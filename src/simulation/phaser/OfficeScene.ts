import Phaser from 'phaser';
import { OFFICE_LOCATIONS } from '../data/office';
import { AGENT_PROFILES } from '../data/agents';
import type { AgentState, Conversation } from '../types';

// ── Constants ───────────────────────────────────────────────────

const TILE_SIZE = 16;
const MAP_WIDTH = 40;
const MAP_HEIGHT = 32;
const SCALE = 2;

// Room definitions in tile coordinates
interface Room {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  color: number;
  floorColor: number;
}

const ROOMS: Room[] = [
  // Desk area (left column)
  { id: 'desks', x: 1, y: 1, w: 10, h: 30, label: 'Work Area', color: 0x8B7355, floorColor: 0xD2B48C },
  // Kitchen (top right)
  { id: 'kitchen', x: 14, y: 1, w: 12, h: 8, label: 'Kitchen', color: 0x6B8E6B, floorColor: 0xC5E1A5 },
  // Conference Room A (mid right)
  { id: 'conf_a', x: 14, y: 11, w: 12, h: 7, label: 'The Fishbowl', color: 0x5B7BB5, floorColor: 0xBBDEFB },
  // Conference Room B (lower right)
  { id: 'conf_b', x: 14, y: 20, w: 8, h: 6, label: 'The Nook', color: 0x7B68AE, floorColor: 0xD1C4E9 },
  // Lounge (bottom right)
  { id: 'lounge', x: 24, y: 20, w: 8, h: 6, label: 'Lounge', color: 0xC0855A, floorColor: 0xFFE0B2 },
  // Lobby (top center)
  { id: 'lobby', x: 28, y: 1, w: 10, h: 8, label: 'Lobby', color: 0x808080, floorColor: 0xE0E0E0 },
  // Hallway (center corridor)
  { id: 'hall', x: 11, y: 1, w: 3, h: 30, label: '', color: 0x999999, floorColor: 0xEEEEEE },
  { id: 'hall2', x: 14, y: 9, w: 24, h: 2, label: '', color: 0x999999, floorColor: 0xEEEEEE },
  { id: 'hall3', x: 14, y: 18, w: 24, h: 2, label: '', color: 0x999999, floorColor: 0xEEEEEE },
  { id: 'hall4', x: 22, y: 11, w: 3, h: 15, label: '', color: 0x999999, floorColor: 0xEEEEEE },
];

// Agent waypoints (pixel positions for each location)
const WAYPOINTS: Record<string, { x: number; y: number }> = {
  desk_casey: { x: 5 * TILE_SIZE, y: 4 * TILE_SIZE },
  desk_alex: { x: 5 * TILE_SIZE, y: 8 * TILE_SIZE },
  desk_jordan: { x: 5 * TILE_SIZE, y: 12 * TILE_SIZE },
  desk_sam: { x: 5 * TILE_SIZE, y: 16 * TILE_SIZE },
  desk_riley: { x: 5 * TILE_SIZE, y: 20 * TILE_SIZE },
  desk_morgan: { x: 5 * TILE_SIZE, y: 24 * TILE_SIZE },
  desk_taylor: { x: 5 * TILE_SIZE, y: 28 * TILE_SIZE },
  kitchen: { x: 19 * TILE_SIZE, y: 4 * TILE_SIZE },
  conf_a: { x: 19 * TILE_SIZE, y: 14 * TILE_SIZE },
  conf_b: { x: 17 * TILE_SIZE, y: 22 * TILE_SIZE },
  lounge: { x: 27 * TILE_SIZE, y: 22 * TILE_SIZE },
  lobby: { x: 32 * TILE_SIZE, y: 4 * TILE_SIZE },
};

// ── Scene ───────────────────────────────────────────────────────

export class OfficeScene extends Phaser.Scene {
  private agentSprites: Map<string, Phaser.GameObjects.Container> = new Map();
  private speechBubbles: Map<string, Phaser.GameObjects.Container> = new Map();
  private deskLabels: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: 'OfficeScene' });
  }

  create() {
    // Draw the office
    this.drawOffice();
    this.drawFurniture();

    // Create agent sprites
    for (const agent of AGENT_PROFILES) {
      this.createAgentSprite(agent.id, agent.name, agent.spriteColor);
    }

    // Set camera bounds
    this.cameras.main.setBounds(
      0,
      0,
      MAP_WIDTH * TILE_SIZE * SCALE,
      MAP_HEIGHT * TILE_SIZE * SCALE
    );

    // Enable camera drag
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) {
        this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x);
        this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y);
      }
    });
  }

  private drawOffice() {
    const graphics = this.add.graphics();

    // Background
    graphics.fillStyle(0x333333);
    graphics.fillRect(0, 0, MAP_WIDTH * TILE_SIZE * SCALE, MAP_HEIGHT * TILE_SIZE * SCALE);

    // Draw rooms
    for (const room of ROOMS) {
      const x = room.x * TILE_SIZE * SCALE;
      const y = room.y * TILE_SIZE * SCALE;
      const w = room.w * TILE_SIZE * SCALE;
      const h = room.h * TILE_SIZE * SCALE;

      // Floor
      graphics.fillStyle(room.floorColor);
      graphics.fillRect(x, y, w, h);

      // Walls (2px border)
      graphics.lineStyle(2, room.color, 1);
      graphics.strokeRect(x, y, w, h);

      // Room label
      if (room.label) {
        this.add
          .text(x + w / 2, y + 8 * SCALE, room.label, {
            fontSize: `${10 * SCALE}px`,
            color: '#555555',
            fontFamily: 'monospace',
            fontStyle: 'bold',
          })
          .setOrigin(0.5, 0);
      }
    }

    // Draw grid lines (subtle)
    graphics.lineStyle(1, 0x000000, 0.05);
    for (let x = 0; x <= MAP_WIDTH; x++) {
      graphics.lineBetween(
        x * TILE_SIZE * SCALE,
        0,
        x * TILE_SIZE * SCALE,
        MAP_HEIGHT * TILE_SIZE * SCALE
      );
    }
    for (let y = 0; y <= MAP_HEIGHT; y++) {
      graphics.lineBetween(
        0,
        y * TILE_SIZE * SCALE,
        MAP_WIDTH * TILE_SIZE * SCALE,
        y * TILE_SIZE * SCALE
      );
    }
  }

  private drawFurniture() {
    const graphics = this.add.graphics();

    // Draw desks (small rectangles at each desk waypoint)
    const deskAgents = ['casey', 'alex', 'jordan', 'sam', 'riley', 'morgan', 'taylor'];
    for (const agentId of deskAgents) {
      const wp = WAYPOINTS[`desk_${agentId}`];
      if (!wp) continue;

      const dx = wp.x * SCALE;
      const dy = wp.y * SCALE;

      // Desk surface
      graphics.fillStyle(0x8B6914);
      graphics.fillRect(dx - 12 * SCALE, dy - 4 * SCALE, 10 * SCALE, 8 * SCALE);

      // Monitor
      graphics.fillStyle(0x2C3E50);
      graphics.fillRect(dx - 10 * SCALE, dy - 3 * SCALE, 6 * SCALE, 4 * SCALE);

      // Monitor screen
      graphics.fillStyle(0x5DADE2);
      graphics.fillRect(dx - 9 * SCALE, dy - 2 * SCALE, 4 * SCALE, 2 * SCALE);

      // Chair
      graphics.fillStyle(0x34495E);
      graphics.fillRect(dx + 2 * SCALE, dy - 2 * SCALE, 4 * SCALE, 4 * SCALE);

      // Desk label
      const agent = AGENT_PROFILES.find((a) => a.id === agentId);
      if (agent) {
        this.add
          .text(dx - 12 * SCALE, dy + 6 * SCALE, agent.name, {
            fontSize: `${7 * SCALE}px`,
            color: '#666666',
            fontFamily: 'monospace',
          });
      }
    }

    // Kitchen furniture
    const kitchenWp = WAYPOINTS.kitchen;
    // Coffee machine
    graphics.fillStyle(0x4A4A4A);
    graphics.fillRect(
      (kitchenWp.x - 4 * TILE_SIZE) * SCALE,
      (kitchenWp.y - 1 * TILE_SIZE) * SCALE,
      3 * TILE_SIZE * SCALE,
      2 * TILE_SIZE * SCALE
    );
    this.add.text(
      (kitchenWp.x - 3 * TILE_SIZE) * SCALE,
      (kitchenWp.y + 2 * TILE_SIZE) * SCALE,
      'Coffee',
      { fontSize: `${7 * SCALE}px`, color: '#555', fontFamily: 'monospace' }
    );

    // Fridge
    graphics.fillStyle(0xCCCCCC);
    graphics.fillRect(
      (kitchenWp.x + 2 * TILE_SIZE) * SCALE,
      (kitchenWp.y - 1 * TILE_SIZE) * SCALE,
      2 * TILE_SIZE * SCALE,
      3 * TILE_SIZE * SCALE
    );

    // Conference table A
    const confAWp = WAYPOINTS.conf_a;
    graphics.fillStyle(0x6D4C41);
    graphics.fillRect(
      (confAWp.x - 3 * TILE_SIZE) * SCALE,
      (confAWp.y - 1 * TILE_SIZE) * SCALE,
      6 * TILE_SIZE * SCALE,
      2 * TILE_SIZE * SCALE
    );

    // Conference table B (round-ish)
    const confBWp = WAYPOINTS.conf_b;
    graphics.fillStyle(0x6D4C41);
    graphics.fillRect(
      (confBWp.x - 2 * TILE_SIZE) * SCALE,
      (confBWp.y - 1 * TILE_SIZE) * SCALE,
      4 * TILE_SIZE * SCALE,
      2 * TILE_SIZE * SCALE
    );

    // Lounge couches
    const loungeWp = WAYPOINTS.lounge;
    graphics.fillStyle(0xD4A574);
    graphics.fillRect(
      (loungeWp.x - 2 * TILE_SIZE) * SCALE,
      (loungeWp.y - 1 * TILE_SIZE) * SCALE,
      4 * TILE_SIZE * SCALE,
      1 * TILE_SIZE * SCALE
    );
    graphics.fillRect(
      (loungeWp.x - 2 * TILE_SIZE) * SCALE,
      (loungeWp.y + 1 * TILE_SIZE) * SCALE,
      4 * TILE_SIZE * SCALE,
      1 * TILE_SIZE * SCALE
    );

    // Plants (green circles scattered around)
    const plantPositions = [
      { x: 1, y: 1 }, { x: 10, y: 30 }, { x: 13, y: 5 },
      { x: 26, y: 8 }, { x: 37, y: 5 }, { x: 30, y: 25 },
    ];
    for (const pos of plantPositions) {
      graphics.fillStyle(0x4CAF50);
      graphics.fillCircle(
        pos.x * TILE_SIZE * SCALE,
        pos.y * TILE_SIZE * SCALE,
        3 * SCALE
      );
      graphics.fillStyle(0x795548);
      graphics.fillRect(
        pos.x * TILE_SIZE * SCALE - 1 * SCALE,
        pos.y * TILE_SIZE * SCALE + 2 * SCALE,
        2 * SCALE,
        3 * SCALE
      );
    }
  }

  private createAgentSprite(agentId: string, name: string, color: string) {
    const wp = WAYPOINTS[`desk_${agentId}`] || WAYPOINTS.lobby;
    const x = wp.x * SCALE;
    const y = wp.y * SCALE;

    const container = this.add.container(x, y);

    // Body (circle)
    const body = this.add.graphics();
    const colorNum = parseInt(color.replace('#', ''), 16);
    body.fillStyle(colorNum, 1);
    body.fillCircle(0, 0, 6 * SCALE);

    // Outline
    body.lineStyle(1.5, 0x000000, 0.3);
    body.strokeCircle(0, 0, 6 * SCALE);

    // Eyes
    const eyes = this.add.graphics();
    eyes.fillStyle(0xFFFFFF, 1);
    eyes.fillCircle(-2 * SCALE, -1 * SCALE, 2 * SCALE);
    eyes.fillCircle(2 * SCALE, -1 * SCALE, 2 * SCALE);
    eyes.fillStyle(0x000000, 1);
    eyes.fillCircle(-1.5 * SCALE, -1 * SCALE, 1 * SCALE);
    eyes.fillCircle(2.5 * SCALE, -1 * SCALE, 1 * SCALE);

    // Name label
    const nameLabel = this.add
      .text(0, -10 * SCALE, name, {
        fontSize: `${7 * SCALE}px`,
        color: '#FFFFFF',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: { x: 2, y: 1 },
      })
      .setOrigin(0.5, 1);

    container.add([body, eyes, nameLabel]);
    container.setDepth(10);

    // Make clickable
    container.setSize(16 * SCALE, 16 * SCALE);
    container.setInteractive();
    container.on('pointerdown', () => {
      this.game.events.emit('agentClicked', agentId);
    });

    this.agentSprites.set(agentId, container);
  }

  // ── Public methods called from React ──────────────────────────

  updateAgentPositions(agentStates: AgentState[]) {
    for (const agentState of agentStates) {
      const sprite = this.agentSprites.get(agentState.agentId);
      if (!sprite) continue;

      const wp = WAYPOINTS[agentState.currentLocationId];
      if (!wp) continue;

      const targetX = wp.x * SCALE;
      const targetY = wp.y * SCALE;

      // Add slight offset so agents don't stack perfectly
      const index = agentStates
        .filter((a) => a.currentLocationId === agentState.currentLocationId)
        .findIndex((a) => a.agentId === agentState.agentId);
      const offsetX = (index % 3) * 14 * SCALE;
      const offsetY = Math.floor(index / 3) * 14 * SCALE;

      // Tween to new position
      if (
        Math.abs(sprite.x - (targetX + offsetX)) > 2 ||
        Math.abs(sprite.y - (targetY + offsetY)) > 2
      ) {
        this.tweens.add({
          targets: sprite,
          x: targetX + offsetX,
          y: targetY + offsetY,
          duration: 800,
          ease: 'Power2',
        });
      }
    }
  }

  showSpeechBubble(agentId: string, text: string, duration: number = 4000) {
    // Remove existing bubble
    this.hideSpeechBubble(agentId);

    const sprite = this.agentSprites.get(agentId);
    if (!sprite) return;

    const container = this.add.container(sprite.x, sprite.y - 20 * SCALE);

    // Truncate text
    const displayText = text.length > 60 ? text.substring(0, 57) + '...' : text;

    // Bubble text
    const bubbleText = this.add
      .text(0, 0, displayText, {
        fontSize: `${6 * SCALE}px`,
        color: '#000000',
        fontFamily: 'monospace',
        wordWrap: { width: 120 * SCALE },
        padding: { x: 4, y: 2 },
      })
      .setOrigin(0.5, 1);

    // Bubble background
    const bounds = bubbleText.getBounds();
    const bg = this.add.graphics();
    bg.fillStyle(0xFFFFFF, 0.95);
    bg.fillRoundedRect(
      bounds.x - 4 * SCALE,
      bounds.y - 2 * SCALE,
      bounds.width + 8 * SCALE,
      bounds.height + 4 * SCALE,
      4 * SCALE
    );
    bg.lineStyle(1, 0x000000, 0.2);
    bg.strokeRoundedRect(
      bounds.x - 4 * SCALE,
      bounds.y - 2 * SCALE,
      bounds.width + 8 * SCALE,
      bounds.height + 4 * SCALE,
      4 * SCALE
    );

    // Tail triangle
    bg.fillStyle(0xFFFFFF, 0.95);
    bg.fillTriangle(
      -2 * SCALE,
      bounds.y + bounds.height + 2 * SCALE,
      2 * SCALE,
      bounds.y + bounds.height + 2 * SCALE,
      0,
      bounds.y + bounds.height + 6 * SCALE
    );

    container.add([bg, bubbleText]);
    container.setDepth(20);

    this.speechBubbles.set(agentId, container);

    // Auto-hide after duration
    this.time.delayedCall(duration, () => {
      this.hideSpeechBubble(agentId);
    });
  }

  hideSpeechBubble(agentId: string) {
    const existing = this.speechBubbles.get(agentId);
    if (existing) {
      existing.destroy();
      this.speechBubbles.delete(agentId);
    }
  }

  showConversation(conversation: Conversation) {
    // Show speech bubbles for each participant
    for (const msg of conversation.messages) {
      const delay = conversation.messages.indexOf(msg) * 1500;
      this.time.delayedCall(delay, () => {
        this.showSpeechBubble(msg.agentId, msg.text, 3000);
      });
    }
  }
}
