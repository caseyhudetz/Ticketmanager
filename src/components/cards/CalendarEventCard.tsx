"use client";

import { Calendar, MapPin, Clock } from "lucide-react";

interface CalendarEventData {
  title: string;
  location: string;
  startTime: string;
  duration: string;
}

interface CalendarEventCardProps {
  data: CalendarEventData;
}

export default function CalendarEventCard({ data }: CalendarEventCardProps) {
  return (
    <div className="bg-white rounded-xl border border-surface-200 p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-brand-600 mb-2">
        <Calendar className="w-3.5 h-3.5" />
        Calendar Event
      </div>

      <h3 className="font-semibold text-surface-900">{data.title}</h3>

      <div className="mt-2 space-y-1.5">
        <div className="flex items-center gap-2 text-sm text-surface-600">
          <Clock className="w-3.5 h-3.5" />
          <span>
            {data.startTime} ({data.duration})
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-surface-600">
          <MapPin className="w-3.5 h-3.5" />
          <span>{data.location}</span>
        </div>
      </div>
    </div>
  );
}
