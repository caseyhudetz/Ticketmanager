import { Memory } from './types';

/**
 * In-memory store for agent memories.
 * For MVP, this lives in server memory — resets on restart.
 */
class MemoryStore {
  private memories: Memory[] = [];
  private nextId = 1;

  add(
    agentId: string,
    tick: number,
    simTime: string,
    type: Memory['type'],
    content: string,
    importance: number,
    involvedAgents: string[] = []
  ): Memory {
    const memory: Memory = {
      id: `mem_${this.nextId++}`,
      agentId,
      tick,
      simTime,
      type,
      content,
      importance: Math.max(1, Math.min(10, Math.round(importance))),
      involvedAgents,
    };
    this.memories.push(memory);
    return memory;
  }

  /**
   * Retrieve memories for an agent, scored by recency + importance.
   * Returns top N memories.
   */
  retrieve(agentId: string, currentTick: number, limit: number = 15): Memory[] {
    const agentMemories = this.memories.filter((m) => m.agentId === agentId);

    if (agentMemories.length === 0) return [];

    // Score each memory: recency (0-1) + normalized importance (0-1)
    const maxTick = currentTick || 1;
    const scored = agentMemories.map((m) => {
      const recency = 1 - (currentTick - m.tick) / Math.max(maxTick, 1);
      const importanceNorm = m.importance / 10;
      const score = 0.6 * recency + 0.4 * importanceNorm;
      return { memory: m, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((s) => s.memory);
  }

  /** Get all memories for an agent (for UI display) */
  getAll(agentId: string): Memory[] {
    return this.memories
      .filter((m) => m.agentId === agentId)
      .sort((a, b) => b.tick - a.tick);
  }

  /** Get recent memories since a given tick (for reflection) */
  getRecent(agentId: string, sinceTick: number): Memory[] {
    return this.memories
      .filter((m) => m.agentId === agentId && m.tick >= sinceTick)
      .sort((a, b) => a.tick - b.tick);
  }

  /** Clear all memories (reset) */
  clear(): void {
    this.memories = [];
    this.nextId = 1;
  }

  /** Total memory count */
  get size(): number {
    return this.memories.length;
  }
}

// Singleton instance
export const memoryStore = new MemoryStore();
