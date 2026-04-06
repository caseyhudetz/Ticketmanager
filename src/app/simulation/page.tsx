'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import SimControls from './components/SimControls';
import ActivityFeed from './components/ActivityFeed';
import AgentPanel from './components/AgentPanel';
import type { SimulationState, Conversation } from '@/simulation/types';

// Dynamic import for Phaser (no SSR)
const PhaserOffice = dynamic(
  () => import('./components/PhaserOffice'),
  { ssr: false, loading: () => <div className="w-full bg-gray-900 rounded-lg flex items-center justify-center" style={{ minHeight: '480px' }}><span className="text-gray-500 font-mono text-sm">Loading office...</span></div> }
);

const INITIAL_STATE: SimulationState = {
  status: 'idle',
  tick: 0,
  simTime: '9:00 AM',
  speed: 1,
  agents: [],
  recentEvents: [],
};

export default function SimulationPage() {
  const [state, setState] = useState<SimulationState>(INITIAL_STATE);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Connect to SSE stream
  const connectSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource('/api/simulation/state');

    es.onmessage = (event) => {
      try {
        const newState: SimulationState = JSON.parse(event.data);
        setState(newState);

        // Extract conversations from recent events
        const convos = newState.recentEvents
          .filter((e) => e.conversation)
          .map((e) => e.conversation!);
        setConversations(convos);
      } catch {
        // Ignore parse errors (heartbeats, etc.)
      }
    };

    es.onerror = () => {
      // Reconnect after a delay
      setTimeout(() => {
        if (eventSourceRef.current === es) {
          connectSSE();
        }
      }, 3000);
    };

    eventSourceRef.current = es;
  }, []);

  useEffect(() => {
    connectSSE();
    return () => {
      eventSourceRef.current?.close();
    };
  }, [connectSSE]);

  // Control handlers
  const handleStart = async () => {
    await fetch('/api/simulation/start', { method: 'POST' });
  };

  const handlePause = async () => {
    await fetch('/api/simulation/pause', { method: 'POST' });
  };

  const handleSpeedChange = async (speed: number) => {
    await fetch('/api/simulation/speed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speed }),
    });
  };

  const handleReset = async () => {
    await fetch('/api/simulation/reset', { method: 'POST' });
    setSelectedAgent(null);
    setConversations([]);
  };

  const handleAgentClick = useCallback((agentId: string) => {
    setSelectedAgent((prev) => (prev === agentId ? null : agentId));
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <header className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-mono font-bold text-gray-100">
            Team Virtual World
          </h1>
          <span className="text-xs font-mono text-gray-500">
            Generative Agent Simulation
          </span>
        </div>
        <a
          href="/"
          className="text-xs font-mono text-gray-500 hover:text-gray-300"
        >
          Back to TicketManager
        </a>
      </header>

      {/* Phaser Office Map */}
      <div className="flex-shrink-0">
        <PhaserOffice
          agentStates={state.agents}
          conversations={conversations}
          onAgentClick={handleAgentClick}
        />
      </div>

      {/* Controls */}
      <SimControls
        status={state.status}
        simTime={state.simTime}
        speed={state.speed}
        tick={state.tick}
        onStart={handleStart}
        onPause={handlePause}
        onSpeedChange={handleSpeedChange}
        onReset={handleReset}
      />

      {/* Bottom panel: Activity Feed + Agent Panel */}
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 border-r border-gray-700 overflow-hidden">
          <ActivityFeed
            events={state.recentEvents}
            onAgentClick={handleAgentClick}
          />
        </div>
        <div className="w-80 overflow-hidden">
          <AgentPanel
            selectedAgentId={selectedAgent}
            agentStates={state.agents}
            onClose={() => setSelectedAgent(null)}
          />
        </div>
      </div>
    </div>
  );
}
