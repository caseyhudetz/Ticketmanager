import Anthropic from '@anthropic-ai/sdk';
import {
  AgentProfile,
  Memory,
  LLMPlanResponse,
  LLMDialogueResponse,
  LLMReflectionResponse,
} from './types';
import {
  buildPlanningPrompt,
  buildDialoguePrompt,
  buildReflectionPrompt,
} from './prompts';

const client = new Anthropic();

// Use Haiku for fast/cheap operations, Sonnet for dialogue quality
const FAST_MODEL = 'claude-haiku-4-5-20251001';
const QUALITY_MODEL = 'claude-sonnet-4-6-20250514';

async function callClaude(
  model: string,
  prompt: string,
  maxTokens: number = 500
): Promise<string> {
  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  return textBlock?.text ?? '';
}

function parseJSON<T>(raw: string): T | null {
  try {
    // Strip markdown code fences if present
    const cleaned = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned) as T;
  } catch {
    console.error('Failed to parse LLM JSON response:', raw.substring(0, 200));
    return null;
  }
}

export async function getAgentPlan(
  agent: AgentProfile,
  simTime: string,
  currentLocation: string,
  nearbyAgents: string[],
  memories: Memory[]
): Promise<LLMPlanResponse> {
  const prompt = buildPlanningPrompt(agent, simTime, currentLocation, nearbyAgents, memories);
  const raw = await callClaude(FAST_MODEL, prompt, 300);
  const parsed = parseJSON<LLMPlanResponse>(raw);

  // Fallback: stay at current location and work
  return parsed ?? {
    action: 'work',
    reason: 'continuing with current task',
    description: `${agent.name} continues working at their desk.`,
  };
}

export async function generateDialogue(
  agent: AgentProfile,
  otherAgent: AgentProfile,
  location: string,
  agentMemories: Memory[],
  otherMemories: Memory[]
): Promise<LLMDialogueResponse> {
  const prompt = buildDialoguePrompt(agent, otherAgent, location, agentMemories, otherMemories);
  const raw = await callClaude(QUALITY_MODEL, prompt, 500);
  const parsed = parseJSON<LLMDialogueResponse>(raw);

  return parsed ?? {
    messages: [
      { speaker: agent.name, text: 'Hey, how\'s it going?' },
      { speaker: otherAgent.name, text: 'Good, good. Busy day!' },
    ],
  };
}

export async function generateReflections(
  agent: AgentProfile,
  memories: Memory[]
): Promise<LLMReflectionResponse> {
  const prompt = buildReflectionPrompt(agent, memories);
  const raw = await callClaude(FAST_MODEL, prompt, 300);
  const parsed = parseJSON<LLMReflectionResponse>(raw);

  return parsed ?? {
    reflections: [],
    importance: [],
  };
}
