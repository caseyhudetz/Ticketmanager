import {
  SimulationState,
  AgentState,
  SimulationEvent,
  Conversation,
  TickResult,
} from './types';
import { AGENT_PROFILES, getAgent, getAgentName } from './data/agents';
import {
  getHomeDesk,
  getAgentsAtLocation,
  hasCapacity,
  getLocationName,
  OFFICE_LOCATIONS,
} from './data/office';
import { memoryStore } from './memory';
import { getAgentPlan, generateDialogue, generateReflections } from './llm';

// ── Simulation Clock ────────────────────────────────────────────

const START_HOUR = 9; // 9:00 AM
const END_HOUR = 17; // 5:00 PM
const TICKS_PER_HOUR = 4; // 15-minute intervals
const TOTAL_TICKS = (END_HOUR - START_HOUR) * TICKS_PER_HOUR; // 32

function tickToTime(tick: number): string {
  const totalMinutes = tick * 15;
  const hours = START_HOUR + Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// ── Simulation State (singleton, lives in server memory) ────────

let state: SimulationState = {
  status: 'idle',
  tick: 0,
  simTime: tickToTime(0),
  speed: 1,
  agents: [],
  recentEvents: [],
};

let allEvents: SimulationEvent[] = [];
let eventIdCounter = 1;
let tickTimer: ReturnType<typeof setTimeout> | null = null;

// SSE listeners
type StateListener = (state: SimulationState) => void;
const listeners: Set<StateListener> = new Set();

export function subscribe(listener: StateListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function broadcast() {
  for (const listener of listeners) {
    listener(getState());
  }
}

// ── Public API ──────────────────────────────────────────────────

export function getState(): SimulationState {
  return { ...state, recentEvents: allEvents.slice(-20) };
}

export function getHistory(): SimulationEvent[] {
  return [...allEvents];
}

export function getAgentMemories(agentId: string) {
  return memoryStore.getAll(agentId);
}

export function startSimulation(): SimulationState {
  if (state.status === 'running') return getState();

  if (state.status === 'idle') {
    // Fresh start
    memoryStore.clear();
    allEvents = [];
    eventIdCounter = 1;
    state.tick = 0;
    state.simTime = tickToTime(0);

    // Initialize agents at their desks
    state.agents = AGENT_PROFILES.map((agent) => ({
      agentId: agent.id,
      currentLocationId: getHomeDesk(agent.id),
      currentAction: { type: 'work' as const, description: `Starting the workday` },
      status: 'Settling in at desk',
    }));

    // Add initial observation memories
    for (const agent of AGENT_PROFILES) {
      memoryStore.add(
        agent.id,
        0,
        tickToTime(0),
        'observation',
        `${agent.name} arrived at the office and sat down at their desk to start the day.`,
        3
      );
    }
  }

  state.status = 'running';
  scheduleNextTick();
  broadcast();
  return getState();
}

export function pauseSimulation(): SimulationState {
  if (state.status === 'running') {
    state.status = 'paused';
    if (tickTimer) {
      clearTimeout(tickTimer);
      tickTimer = null;
    }
  } else if (state.status === 'paused') {
    state.status = 'running';
    scheduleNextTick();
  }
  broadcast();
  return getState();
}

export function setSpeed(speed: number): SimulationState {
  state.speed = Math.max(1, Math.min(5, speed));
  broadcast();
  return getState();
}

export function resetSimulation(): SimulationState {
  if (tickTimer) {
    clearTimeout(tickTimer);
    tickTimer = null;
  }
  state = {
    status: 'idle',
    tick: 0,
    simTime: tickToTime(0),
    speed: state.speed,
    agents: [],
    recentEvents: [],
  };
  memoryStore.clear();
  allEvents = [];
  eventIdCounter = 1;
  broadcast();
  return getState();
}

// ── Tick Logic ──────────────────────────────────────────────────

function scheduleNextTick() {
  if (state.status !== 'running') return;
  if (state.tick >= TOTAL_TICKS) {
    state.status = 'paused';
    broadcast();
    return;
  }

  // Base interval: 3 seconds per tick, scaled by speed
  const interval = Math.max(500, 3000 / state.speed);
  tickTimer = setTimeout(() => executeTick(), interval);
}

async function executeTick() {
  if (state.status !== 'running') return;

  state.tick++;
  state.simTime = tickToTime(state.tick);
  const tickEvents: SimulationEvent[] = [];

  console.log(`[Sim] Tick ${state.tick} — ${state.simTime}`);

  // Phase 1: Each agent decides what to do
  const planPromises = state.agents.map(async (agentState) => {
    const agent = getAgent(agentState.agentId);
    if (!agent) return;

    const nearbyAgents = getAgentsAtLocation(
      agentState.currentLocationId,
      state.agents
    ).filter((id) => id !== agent.id);

    const memories = memoryStore.retrieve(agent.id, state.tick);

    try {
      const plan = await getAgentPlan(
        agent,
        state.simTime,
        agentState.currentLocationId,
        nearbyAgents,
        memories
      );

      // Apply the plan
      if (plan.action === 'move' && plan.location) {
        const targetLocation = plan.location;
        if (
          targetLocation !== agentState.currentLocationId &&
          hasCapacity(targetLocation, state.agents)
        ) {
          const oldLocation = agentState.currentLocationId;
          agentState.currentLocationId = targetLocation;
          agentState.currentAction = {
            type: 'move',
            locationId: targetLocation,
            reason: plan.reason,
          };
          agentState.status = plan.description || `Moving to ${getLocationName(targetLocation)}`;

          const moveDesc = plan.description ||
            `${agent.name} moved from ${getLocationName(oldLocation)} to ${getLocationName(targetLocation)}.`;

          memoryStore.add(agent.id, state.tick, state.simTime, 'observation', moveDesc, 3);
          tickEvents.push({
            id: `evt_${eventIdCounter++}`,
            tick: state.tick,
            simTime: state.simTime,
            type: 'move',
            description: moveDesc,
            agentIds: [agent.id],
          });
        }
      } else if (plan.action === 'work') {
        agentState.currentAction = {
          type: 'work',
          description: plan.description || 'Working',
        };
        agentState.status = plan.description || 'Working';
      } else if (plan.action === 'idle') {
        agentState.currentAction = {
          type: 'idle',
          description: plan.description || 'Taking a break',
        };
        agentState.status = plan.description || 'Taking a break';
      }
      // 'talk' action is handled in Phase 2 via co-location
    } catch (err) {
      console.error(`[Sim] Error planning for ${agent.name}:`, err);
    }
  });

  await Promise.all(planPromises);

  // Phase 2: Generate conversations for agents in the same shared space
  const sharedLocations = OFFICE_LOCATIONS.filter((l) => l.type !== 'desk');
  const conversedThisTick = new Set<string>();

  for (const location of sharedLocations) {
    const agentsHere = getAgentsAtLocation(location.id, state.agents)
      .filter((id) => !conversedThisTick.has(id));

    if (agentsHere.length >= 2) {
      // Pick a pair to converse (first two who haven't already talked)
      const [agentAId, agentBId] = agentsHere.slice(0, 2);
      const agentA = getAgent(agentAId);
      const agentB = getAgent(agentBId);

      if (agentA && agentB) {
        try {
          const memoriesA = memoryStore.retrieve(agentA.id, state.tick, 5);
          const memoriesB = memoryStore.retrieve(agentB.id, state.tick, 5);

          const dialogue = await generateDialogue(
            agentA,
            agentB,
            location.id,
            memoriesA,
            memoriesB
          );

          const conversation: Conversation = {
            id: `conv_${eventIdCounter}`,
            tick: state.tick,
            simTime: state.simTime,
            locationId: location.id,
            participants: [agentA.id, agentB.id],
            messages: dialogue.messages.map((m) => ({
              agentId: m.speaker === agentA.name ? agentA.id : agentB.id,
              agentName: m.speaker,
              text: m.text,
            })),
          };

          // Create memories for both participants
          const convoSummary = dialogue.messages
            .map((m) => `${m.speaker}: "${m.text}"`)
            .join(' | ');
          const memContent = `Had a conversation with ${agentB.name} in ${getLocationName(location.id)}: ${convoSummary}`;
          const memContentB = `Had a conversation with ${agentA.name} in ${getLocationName(location.id)}: ${convoSummary}`;

          memoryStore.add(agentA.id, state.tick, state.simTime, 'conversation', memContent, 5, [agentB.id]);
          memoryStore.add(agentB.id, state.tick, state.simTime, 'conversation', memContentB, 5, [agentA.id]);

          tickEvents.push({
            id: `evt_${eventIdCounter++}`,
            tick: state.tick,
            simTime: state.simTime,
            type: 'conversation',
            description: `${agentA.name} and ${agentB.name} chatted in ${getLocationName(location.id)}.`,
            agentIds: [agentA.id, agentB.id],
            conversation,
          });

          conversedThisTick.add(agentAId);
          conversedThisTick.add(agentBId);
        } catch (err) {
          console.error(`[Sim] Error generating dialogue:`, err);
        }
      }
    }
  }

  // Phase 3: Reflection (every 8 ticks = ~2 sim hours)
  if (state.tick % 8 === 0 && state.tick > 0) {
    const reflectionPromises = state.agents.map(async (agentState) => {
      const agent = getAgent(agentState.agentId);
      if (!agent) return;

      const recentMemories = memoryStore.getRecent(agent.id, state.tick - 8);
      if (recentMemories.length < 2) return;

      try {
        const result = await generateReflections(agent, recentMemories);
        for (let i = 0; i < result.reflections.length; i++) {
          const reflection = result.reflections[i];
          const importance = result.importance[i] ?? 5;

          memoryStore.add(
            agent.id,
            state.tick,
            state.simTime,
            'reflection',
            reflection,
            importance
          );

          tickEvents.push({
            id: `evt_${eventIdCounter++}`,
            tick: state.tick,
            simTime: state.simTime,
            type: 'reflection',
            description: `${agent.name} reflected: "${reflection}"`,
            agentIds: [agent.id],
          });
        }
      } catch (err) {
        console.error(`[Sim] Error generating reflections for ${agent.name}:`, err);
      }
    });

    await Promise.all(reflectionPromises);
  }

  // Store events and broadcast
  allEvents.push(...tickEvents);
  broadcast();

  // Schedule next tick
  scheduleNextTick();
}
