"use client";

import { Event } from "@/types";
import { Calendar, MapPin, Ticket, Building2 } from "lucide-react";

interface EventCardProps {
  event: Event;
  onSelect?: (event: Event) => void;
}

export default function EventCard({ event, onSelect }: EventCardProps) {
  const availabilityPercent =
    (event.availableTickets / event.totalTickets) * 100;
  const isLow = availabilityPercent <= 25;

  return (
    <button
      onClick={() => onSelect?.(event)}
      className="w-full text-left bg-white rounded-xl border border-surface-200 p-4 hover:border-brand-400 hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Category badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-700">
              {event.sport ?? event.category}
            </span>
            {isLow && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                Low availability
              </span>
            )}
          </div>

          {/* Event name */}
          <h3 className="font-semibold text-surface-900 group-hover:text-brand-700 transition-colors truncate">
            {event.name}
          </h3>

          {/* Details */}
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2 text-sm text-surface-600">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>
                {event.date} at {event.time}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-surface-600">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {event.venue} — {event.location.city}, {event.location.state}
              </span>
            </div>
            {event.suiteInfo && (
              <div className="flex items-center gap-2 text-sm text-surface-600">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{event.suiteInfo}</span>
              </div>
            )}
          </div>
        </div>

        {/* Ticket count */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div
            className={`flex items-center gap-1 text-lg font-bold ${
              isLow ? "text-red-600" : "text-brand-600"
            }`}
          >
            <Ticket className="w-4 h-4" />
            {event.availableTickets}
          </div>
          <span className="text-xs text-surface-500">
            of {event.totalTickets}
          </span>
        </div>
      </div>

      {/* Availability bar */}
      <div className="mt-3 h-1.5 bg-surface-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isLow ? "bg-red-400" : "bg-brand-400"
          }`}
          style={{ width: `${availabilityPercent}%` }}
        />
      </div>
    </button>
  );
}
