import { NextResponse } from 'next/server';
import { resetSimulation } from '@/simulation/engine';

export async function POST() {
  const state = resetSimulation();
  return NextResponse.json(state);
}
