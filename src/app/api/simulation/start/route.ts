import { NextResponse } from 'next/server';
import { startSimulation } from '@/simulation/engine';

export async function POST() {
  const state = startSimulation();
  return NextResponse.json(state);
}
