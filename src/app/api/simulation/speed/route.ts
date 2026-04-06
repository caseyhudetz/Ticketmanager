import { NextRequest, NextResponse } from 'next/server';
import { setSpeed } from '@/simulation/engine';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const speed = Number(body.speed) || 1;
  const state = setSpeed(speed);
  return NextResponse.json(state);
}
