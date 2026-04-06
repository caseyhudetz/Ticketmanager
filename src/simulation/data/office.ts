import { OfficeLocation } from '../types';

/**
 * Office layout — each location has a position on the Phaser tilemap.
 * Positions are in tile coordinates (16px grid).
 * The office is roughly 40x30 tiles (640x480 base pixels).
 */
export const OFFICE_LOCATIONS: OfficeLocation[] = [
  // Individual desks (left side of office)
  {
    id: 'desk_casey',
    name: "Casey's Desk",
    capacity: 1,
    type: 'desk',
    description: 'A standing desk near the window with product roadmap pinned to the wall',
    position: { x: 3, y: 4 },
  },
  {
    id: 'desk_alex',
    name: "Alex's Desk",
    capacity: 1,
    type: 'desk',
    description: 'A clean, organized desk with two monitors and a mechanical keyboard',
    position: { x: 3, y: 8 },
  },
  {
    id: 'desk_jordan',
    name: "Jordan's Desk",
    capacity: 1,
    type: 'desk',
    description: 'A desk covered with tech stickers on the laptop, snack wrappers nearby',
    position: { x: 3, y: 12 },
  },
  {
    id: 'desk_sam',
    name: "Sam's Desk",
    capacity: 1,
    type: 'desk',
    description: 'A design-focused workspace with a drawing tablet and color swatches',
    position: { x: 3, y: 16 },
  },
  {
    id: 'desk_riley',
    name: "Riley's Desk",
    capacity: 1,
    type: 'desk',
    description: 'A quiet corner desk with dashboards on screen and a plant',
    position: { x: 3, y: 20 },
  },
  {
    id: 'desk_morgan',
    name: "Morgan's Desk",
    capacity: 1,
    type: 'desk',
    description: 'A colorful desk with campaign mockups and a ring light',
    position: { x: 3, y: 24 },
  },
  {
    id: 'desk_taylor',
    name: "Taylor's Desk",
    capacity: 1,
    type: 'desk',
    description: 'An impeccably organized desk with a whiteboard calendar on the wall',
    position: { x: 3, y: 28 },
  },

  // Shared spaces (right side of office)
  {
    id: 'kitchen',
    name: 'Kitchen',
    capacity: 4,
    type: 'kitchen',
    description: 'An open kitchen area with a coffee machine, fridge, and a small table for four',
    position: { x: 30, y: 4 },
  },
  {
    id: 'conf_a',
    name: 'Conference Room A (The Fishbowl)',
    capacity: 6,
    type: 'conference',
    description: 'A glass-walled conference room with a large screen and whiteboard',
    position: { x: 30, y: 12 },
  },
  {
    id: 'conf_b',
    name: 'Conference Room B (The Nook)',
    capacity: 4,
    type: 'conference',
    description: 'A cozy meeting room with a round table and no windows',
    position: { x: 30, y: 20 },
  },
  {
    id: 'lounge',
    name: 'Lounge',
    capacity: 3,
    type: 'lounge',
    description: 'Comfortable couches, a bookshelf, and a small coffee table',
    position: { x: 20, y: 24 },
  },
  {
    id: 'lobby',
    name: 'Lobby',
    capacity: 7,
    type: 'lobby',
    description: 'The entrance area with a reception desk and coat hooks',
    position: { x: 20, y: 2 },
  },
];

export function getLocation(id: string): OfficeLocation | undefined {
  return OFFICE_LOCATIONS.find((l) => l.id === id);
}

export function getLocationName(id: string): string {
  return getLocation(id)?.name ?? id;
}

/** Get the home desk for an agent */
export function getHomeDesk(agentId: string): string {
  return `desk_${agentId}`;
}

/** Get agents currently at a location (from agent states) */
export function getAgentsAtLocation(
  locationId: string,
  agentStates: { agentId: string; currentLocationId: string }[]
): string[] {
  return agentStates
    .filter((s) => s.currentLocationId === locationId)
    .map((s) => s.agentId);
}

/** Check if a location has room for more agents */
export function hasCapacity(
  locationId: string,
  agentStates: { agentId: string; currentLocationId: string }[]
): boolean {
  const location = getLocation(locationId);
  if (!location) return false;
  const currentOccupants = getAgentsAtLocation(locationId, agentStates);
  return currentOccupants.length < location.capacity;
}
