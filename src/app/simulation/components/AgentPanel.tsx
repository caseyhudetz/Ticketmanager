'use client';

import { useEffect, useState } from 'react';
import { AGENT_PROFILES } from '@/simulation/data/agents';
import type { Memory, AgentState } from '@/simulation/types';

interface AgentPanelProps {
  selectedAgentId: string | null;
  agentStates: AgentState[];
  onClose: () => void;
}

export default function AgentPanel({
  selectedAgentId,
  agentStates,
  onClose,
}: AgentPanelProps) {
  const [memories, setMemories] = useState<Memory[]>([]);

  const agent = selectedAgentId
    ? AGENT_PROFILES.find((a) => a.id === selectedAgentId)
    : null;
  const agentState = selectedAgentId
    ? agentStates.find((a) => a.agentId === selectedAgentId)
    : null;

  useEffect(() => {
    if (!selectedAgentId) {
      setMemories([]);
      return;
    }

    // Fetch agent memories
    const fetchMemories = async () => {
      try {
        const res = await fetch(
          `/api/simulation/history?agentId=${selectedAgentId}`
        );
        const data = await res.json();
        setMemories(data.memories || []);
      } catch {
        console.error('Failed to fetch memories');
      }
    };

    fetchMemories();
    const interval = setInterval(fetchMemories, 5000);
    return () => clearInterval(interval);
  }, [selectedAgentId]);

  if (!agent || !selectedAgentId) {
    return (
      <div className="flex flex-col h-full">
        <h3 className="px-3 py-2 text-sm font-mono font-bold text-gray-300 border-b border-gray-700 bg-gray-800">
          Agent Details
        </h3>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 text-xs font-mono">
            Click an agent to see their thoughts...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-gray-700 bg-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: agent.spriteColor }}
          />
          <h3 className="text-sm font-mono font-bold text-gray-200">
            {agent.name}
          </h3>
          <span className="text-xs font-mono text-gray-400">{agent.role}</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-300 text-sm"
        >
          &#x2715;
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Current status */}
        {agentState && (
          <div className="bg-gray-750 rounded p-2">
            <p className="text-xs font-mono text-gray-400">Currently:</p>
            <p className="text-sm font-mono text-gray-200">{agentState.status}</p>
          </div>
        )}

        {/* Traits */}
        <div>
          <p className="text-xs font-mono text-gray-400 mb-1">Traits:</p>
          <div className="flex flex-wrap gap-1">
            {agent.traits.map((trait) => (
              <span
                key={trait}
                className="px-1.5 py-0.5 bg-gray-700 rounded text-xs font-mono text-gray-300"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>

        {/* Memories */}
        <div>
          <p className="text-xs font-mono text-gray-400 mb-1">
            Memories ({memories.length}):
          </p>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {memories.slice(0, 20).map((mem) => (
              <div
                key={mem.id}
                className={`p-1.5 rounded text-xs font-mono ${
                  mem.type === 'reflection'
                    ? 'bg-purple-900/30 text-purple-300 border-l-2 border-purple-500'
                    : mem.type === 'conversation'
                    ? 'bg-green-900/30 text-green-300 border-l-2 border-green-500'
                    : 'bg-gray-800 text-gray-400 border-l-2 border-gray-600'
                }`}
              >
                <span className="text-gray-500">[{mem.simTime}]</span>{' '}
                {mem.content}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
