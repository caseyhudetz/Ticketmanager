"use client";

import { Invitation } from "@/types";
import { Mail, Calendar, MapPin, Users } from "lucide-react";

interface InvitationPreviewProps {
  invitation: Invitation;
}

export default function InvitationPreview({
  invitation,
}: InvitationPreviewProps) {
  return (
    <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 px-5 py-4 text-white">
        <div className="flex items-center gap-2 text-brand-200 text-xs font-medium uppercase tracking-wider mb-1">
          <Mail className="w-3.5 h-3.5" />
          Invitation Preview
        </div>
        <h3 className="font-semibold text-lg">{invitation.subject}</h3>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Event details */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-surface-700">
            <Calendar className="w-4 h-4 text-brand-500" />
            <span>
              {invitation.event.date} at {invitation.event.time}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-surface-700">
            <MapPin className="w-4 h-4 text-brand-500" />
            <span>{invitation.event.venue}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-surface-700">
            <Users className="w-4 h-4 text-brand-500" />
            <span>
              To:{" "}
              {invitation.recipients
                .map((r) => `${r.firstName} ${r.lastName}`)
                .join(", ")}
            </span>
          </div>
        </div>

        {/* Message body */}
        <div className="bg-surface-50 rounded-lg p-4 text-sm text-surface-700 whitespace-pre-line border border-surface-100">
          {invitation.message}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 text-xs text-surface-400">
          {invitation.calendarAttachment && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-surface-100 rounded-md">
              <Calendar className="w-3 h-3" />
              Calendar invite attached
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-surface-100 rounded-md">
            Template: {invitation.template.name}
          </span>
        </div>
      </div>
    </div>
  );
}
