import { NextRequest, NextResponse } from "next/server";
import { getEventById, getContactById } from "@/lib/mock-data";
import { ApiResponse, Invitation } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, contactIds, message, template } = body as {
      eventId: string;
      contactIds: string[];
      message?: string;
      template?: string;
    };

    if (!eventId || !contactIds?.length) {
      return NextResponse.json(
        { success: false, error: "Event ID and at least one contact are required" } satisfies ApiResponse<never>,
        { status: 400 }
      );
    }

    const event = getEventById(eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" } satisfies ApiResponse<never>,
        { status: 404 }
      );
    }

    const recipients = contactIds
      .map(getContactById)
      .filter((c): c is NonNullable<typeof c> => c != null);

    if (recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid contacts found" } satisfies ApiResponse<never>,
        { status: 404 }
      );
    }

    const invitation: Invitation = {
      id: `inv-${Date.now()}`,
      event,
      recipients,
      subject: `You're invited: ${event.name} at ${event.venue}`,
      message:
        message ??
        `You're invited to join us for ${event.name} at ${event.venue} on ${event.date}. We hope you can make it!`,
      status: "draft",
      template: {
        id: template ?? "tpl-001",
        name: "Premium",
        subject: "",
        body: "",
        style: "premium",
      },
      calendarAttachment: true,
    };

    return NextResponse.json({
      success: true,
      data: invitation,
    } satisfies ApiResponse<Invitation>);
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create invitation" } satisfies ApiResponse<never>,
      { status: 500 }
    );
  }
}
