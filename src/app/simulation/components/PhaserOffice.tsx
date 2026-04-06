'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { AgentState, Conversation } from '@/simulation/types';

interface PhaserOfficeProps {
  agentStates: AgentState[];
  conversations: Conversation[];
  onAgentClick: (agentId: string) => void;
}

export default function PhaserOffice({
  agentStates,
  conversations,
  onAgentClick,
}: PhaserOfficeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<any>(null);

  const initGame = useCallback(async () => {
    if (gameRef.current || !containerRef.current) return;

    // Dynamic import to avoid SSR issues
    const Phaser = (await import('phaser')).default;
    const { OfficeScene } = await import('@/simulation/phaser/OfficeScene');

    const scene = new OfficeScene();
    sceneRef.current = scene;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: containerRef.current.clientWidth,
      height: 480,
      backgroundColor: '#1a1a2e',
      scene: scene,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      render: {
        pixelArt: true,
        antialias: false,
      },
    });

    // Listen for agent click events from Phaser
    game.events.on('agentClicked', (agentId: string) => {
      onAgentClick(agentId);
    });

    gameRef.current = game;
  }, [onAgentClick]);

  useEffect(() => {
    initGame();

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        sceneRef.current = null;
      }
    };
  }, [initGame]);

  // Update agent positions when state changes
  useEffect(() => {
    if (sceneRef.current && agentStates.length > 0) {
      sceneRef.current.updateAgentPositions(agentStates);
    }
  }, [agentStates]);

  // Show conversations
  useEffect(() => {
    if (sceneRef.current && conversations.length > 0) {
      const latest = conversations[conversations.length - 1];
      sceneRef.current.showConversation(latest);
    }
  }, [conversations]);

  return (
    <div
      ref={containerRef}
      className="w-full bg-gray-900 rounded-lg overflow-hidden border border-gray-700"
      style={{ minHeight: '480px' }}
    />
  );
}
