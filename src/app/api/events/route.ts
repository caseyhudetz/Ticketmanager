import { NextRequest, NextResponse } from "next/server";
import { searchEvents, MOCK_EVENTS } from "@/lib/mock-data";
import { ApiResponse, Event } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const sport = searchParams.get("sport");
  const city = searchParams.get("city");

  try {
    let events: Event[];

    if (query) {
      events = searchEvents(query);
    } else if (sport) {
      events = MOCK_EVENTS.filter(
        (e) => e.sport?.toLowerCase() === sport.toLowerCase()
      );
    } else if (city) {
      events = MOCK_EVENTS.filter(
        (e) => e.location.city.toLowerCase() === city.toLowerCase()
      );
    } else {
      events = MOCK_EVENTS;
    }

    return NextResponse.json({
      success: true,
      data: events,
    } satisfies ApiResponse<Event[]>);
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" } satisfies ApiResponse<never>,
      { status: 500 }
    );
  }
}
