'use client';

import { useEffect, useRef } from 'react';
import type { SimulationEvent } from '@/simulation/types';

interface ActivityFeedProps {
  events: SimulationEvent[];
  onAgentClick: (agentId: string) => void;
}

function EventIcon({ type }: { type: SimulationEvent['type'] }) {
  switch (type) {
    case 'move':
      return <span className="text-blue-400">&#x1F6B6;</span>;
    case 'conversation':
      return <span className="text-green-400">&#x1F4AC;</span>;
    case 'reflection':
      return <span className="text-purple-400">&#x1F4AD;</span>;
    case 'action':
      return <span className="text-yellow-400">&#x2699;</span>;
    default:
      return <span>&#x25CF;</span>;
  }
}

export default function ActivityFeed({ events, onAgentClick }: ActivityFeedProps) {
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className="flex flex-col h-full">
      <h3 className="px-3 py-2 text-sm font-mono font-bold text-gray-300 border-b border-gray-700 bg-gray-800">
        Activity Feed
      </h3>
      <div ref={feedRef} className="flex-1 overflow-y-auto p-2 space-y-1">
        {events.length === 0 && (
          <p className="text-gray-500 text-xs font-mono p-2">
            Start the simulation to see activity...
          </p>
        )}
        {events.map((event) => (
          <div
            key={event.id}
            className="flex gap-2 p-2 rounded hover:bg-gray-750 text-xs font-mono group"
          >
            <span className="text-gray-500 whitespace-nowrap">{event.simTime}</span>
            <EventIcon type={event.type} />
            <div className="flex-1">
              <p className="text-gray-300">{event.description}</p>
              {event.conversation && (
                <div className="mt-1 pl-2 border-l-2 border-gray-600 space-y-0.5">
                  {event.conversation.messages.map((msg, i) => (
                    <p key={i} className="text-gray-400">
                      <button
                        onClick={() => onAgentClick(msg.agentId)}
                        className="text-blue-400 hover:text-blue-300 font-bold"
                      >
                        {msg.agentName}
                      </button>
                      : &ldquo;{msg.text}&rdquo;
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
