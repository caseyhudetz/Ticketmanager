import { NextResponse } from 'next/server';
import { pauseSimulation } from '@/simulation/engine';

export async function POST() {
  const state = pauseSimulation();
  return NextResponse.json(state);
}
