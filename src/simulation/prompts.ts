import { AgentProfile, Memory } from './types';
import { getAgentName } from './data/agents';
import { getLocationName, OFFICE_LOCATIONS } from './data/office';

function formatMemories(memories: Memory[]): string {
  if (memories.length === 0) return 'No recent memories.';
  return memories
    .map((m) => `[${m.simTime}] ${m.content}`)
    .join('\n');
}

function formatRelationships(agent: AgentProfile): string {
  return Object.entries(agent.relationships)
    .map(([id, rel]) => `- ${getAgentName(id)}: ${rel}`)
    .join('\n');
}

function formatLocations(): string {
  return OFFICE_LOCATIONS
    .filter((l) => l.type !== 'desk') // only shared spaces
    .map((l) => `- ${l.id}: ${l.name} — ${l.description}`)
    .join('\n');
}

export function buildPlanningPrompt(
  agent: AgentProfile,
  simTime: string,
  currentLocation: string,
  nearbyAgents: string[],
  memories: Memory[]
): string {
  const nearbyStr = nearbyAgents.length > 0
    ? `Nearby: ${nearbyAgents.map(getAgentName).join(', ')}`
    : 'You are alone.';

  return `You are ${agent.name}, ${agent.role} at a small tech company.

PERSONALITY:
- Traits: ${agent.traits.join(', ')}
- Communication style: ${agent.communicationStyle}
- Interests: ${agent.interests.join(', ')}
- Quirks: ${agent.quirks.join(', ')}

RELATIONSHIPS:
${formatRelationships(agent)}

CURRENT SITUATION:
- Time: ${simTime}
- Location: ${getLocationName(currentLocation)}
- ${nearbyStr}

AVAILABLE LOCATIONS:
- Your desk (desk_${agent.id})
${formatLocations()}

RECENT MEMORIES:
${formatMemories(memories)}

What do you do next? Consider your personality, the time of day, who's nearby, and your recent interactions. People naturally take breaks, chat with colleagues, attend meetings, and get work done.

Respond with ONLY valid JSON (no markdown, no explanation):
{
  "action": "move" | "talk" | "work" | "idle",
  "location": "location_id (required if action is move)",
  "target": "agent_id (required if action is talk)",
  "reason": "brief internal thought about why",
  "description": "what you're doing, in 3rd person (e.g., 'Casey walks to the kitchen for coffee')"
}`;
}

export function buildDialoguePrompt(
  agent: AgentProfile,
  otherAgent: AgentProfile,
  location: string,
  agentMemories: Memory[],
  otherMemories: Memory[]
): string {
  const relationship = agent.relationships[otherAgent.id] || 'colleague';
  const otherRelationship = otherAgent.relationships[agent.id] || 'colleague';

  return `Generate a short, natural conversation between two colleagues who just ran into each other.

PERSON 1 — ${agent.name} (${agent.role}):
- Traits: ${agent.traits.join(', ')}
- Communication style: ${agent.communicationStyle}
- Interests: ${agent.interests.join(', ')}
- Quirks: ${agent.quirks.join(', ')}
- Thinks of ${otherAgent.name}: ${relationship}
- Recent memories:
${formatMemories(agentMemories.slice(0, 5))}

PERSON 2 — ${otherAgent.name} (${otherAgent.role}):
- Traits: ${otherAgent.traits.join(', ')}
- Communication style: ${otherAgent.communicationStyle}
- Interests: ${otherAgent.interests.join(', ')}
- Quirks: ${otherAgent.quirks.join(', ')}
- Thinks of ${agent.name}: ${otherRelationship}
- Recent memories:
${formatMemories(otherMemories.slice(0, 5))}

SETTING: ${getLocationName(location)}

Generate 3-5 lines of natural dialogue. The conversation should reflect their personalities, relationship, and current context. Keep it casual and realistic — not every conversation needs to be profound.

Respond with ONLY valid JSON (no markdown):
{
  "messages": [
    { "speaker": "${agent.name}", "text": "..." },
    { "speaker": "${otherAgent.name}", "text": "..." }
  ]
}`;
}

export function buildReflectionPrompt(
  agent: AgentProfile,
  memories: Memory[]
): string {
  return `You are ${agent.name}, ${agent.role}. Here are your recent experiences:

${formatMemories(memories)}

Based on these experiences, what patterns, feelings, or insights do you notice? Think about your relationships with colleagues, how your day is going, and anything noteworthy.

Generate 1-2 brief reflections (one sentence each). These should feel like natural inner thoughts.

Respond with ONLY valid JSON (no markdown):
{
  "reflections": ["...", "..."],
  "importance": [5, 3]
}`;
}
