import { NextRequest, NextResponse } from 'next/server';
import { getHistory, getAgentMemories } from '@/simulation/engine';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');

  if (agentId) {
    const memories = getAgentMemories(agentId);
    return NextResponse.json({ memories });
  }

  const events = getHistory();
  return NextResponse.json({ events });
}
