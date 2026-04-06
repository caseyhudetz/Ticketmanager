// ── Agent Profiles ──────────────────────────────────────────────

export interface AgentProfile {
  id: string;
  name: string;
  role: string;
  traits: string[];
  communicationStyle: string;
  interests: string[];
  quirks: string[];
  relationships: Record<string, string>; // agentId → relationship description
  spriteColor: string; // hex color for avatar
}

// ── Office World ────────────────────────────────────────────────

export interface OfficeLocation {
  id: string;
  name: string;
  capacity: number;
  type: 'desk' | 'kitchen' | 'conference' | 'lounge' | 'lobby';
  description: string;
  /** Pixel position on the Phaser tilemap */
  position: { x: number; y: number };
}

// ── Memory System ───────────────────────────────────────────────

export interface Memory {
  id: string;
  agentId: string;
  tick: number; // simulation tick when this was created
  simTime: string; // human-readable sim time, e.g. "10:30 AM"
  type: 'observation' | 'conversation' | 'reflection';
  content: string;
  importance: number; // 1-10
  involvedAgents: string[]; // agent ids
}

// ── Simulation State ────────────────────────────────────────────

export type AgentAction =
  | { type: 'move'; locationId: string; reason: string }
  | { type: 'talk'; targetAgentId: string; reason: string }
  | { type: 'work'; description: string }
  | { type: 'idle'; description: string };

export interface AgentState {
  agentId: string;
  currentLocationId: string;
  currentAction: AgentAction;
  status: string; // short description like "working on code review"
}

export interface ConversationMessage {
  agentId: string;
  agentName: string;
  text: string;
}

export interface Conversation {
  id: string;
  tick: number;
  simTime: string;
  locationId: string;
  participants: string[]; // agent ids
  messages: ConversationMessage[];
}

export interface SimulationEvent {
  id: string;
  tick: number;
  simTime: string;
  type: 'move' | 'conversation' | 'reflection' | 'action';
  description: string;
  agentIds: string[];
  conversation?: Conversation;
}

export interface SimulationState {
  status: 'idle' | 'running' | 'paused';
  tick: number;
  simTime: string;
  speed: number; // 1, 2, or 5
  agents: AgentState[];
  recentEvents: SimulationEvent[];
}

// ── API Types ───────────────────────────────────────────────────

export interface TickResult {
  tick: number;
  simTime: string;
  agentStates: AgentState[];
  events: SimulationEvent[];
}

export interface LLMPlanResponse {
  action: 'move' | 'talk' | 'work' | 'idle';
  location?: string;
  target?: string;
  reason: string;
  description?: string;
}

export interface LLMDialogueResponse {
  messages: { speaker: string; text: string }[];
}

export interface LLMReflectionResponse {
  reflections: string[];
  importance: number[];
}
