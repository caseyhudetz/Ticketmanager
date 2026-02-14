import { NextRequest, NextResponse } from "next/server";
import { getEventById } from "@/lib/mock-data";
import { ApiResponse, CalendarEvent } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, provider, attendeeEmails } = body as {
      eventId: string;
      provider: "google" | "outlook" | "ical";
      attendeeEmails?: string[];
    };

    if (!eventId || !provider) {
      return NextResponse.json(
        { success: false, error: "Event ID and calendar provider are required" } satisfies ApiResponse<never>,
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

    // Parse event date/time into start and end times
    const startTime = new Date(event.date);
    const endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000); // +3 hours

    const calendarEvent: CalendarEvent = {
      id: `cal-${Date.now()}`,
      title: event.name,
      description: `${event.name} at ${event.venue}${event.suiteInfo ? ` — ${event.suiteInfo}` : ""}`,
      startTime,
      endTime,
      location: `${event.venue}, ${event.location.city}, ${event.location.state}`,
      attendees: attendeeEmails ?? [],
      provider,
    };

    // In production, this would call the Google Calendar API, Microsoft Graph API,
    // or generate an .ics file depending on the provider

    return NextResponse.json({
      success: true,
      data: calendarEvent,
    } satisfies ApiResponse<CalendarEvent>);
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create calendar event" } satisfies ApiResponse<never>,
      { status: 500 }
    );
  }
}
