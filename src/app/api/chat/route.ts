import { NextRequest, NextResponse } from "next/server";
import { processMessage } from "@/lib/conversation-engine";
import { ApiResponse, ChatMessage } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body as { message: string };

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, error: "Message is required" } satisfies ApiResponse<never>,
        { status: 400 }
      );
    }

    const response = processMessage(message);

    return NextResponse.json({
      success: true,
      data: response,
    } satisfies ApiResponse<ChatMessage>);
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" } satisfies ApiResponse<never>,
      { status: 500 }
    );
  }
}
