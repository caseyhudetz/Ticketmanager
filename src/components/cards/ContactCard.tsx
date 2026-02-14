"use client";

import { SalesforceContact } from "@/types";
import { Building2, Mail, Star, CalendarCheck } from "lucide-react";

interface ContactCardProps {
  contact: SalesforceContact;
  onSelect?: (contact: SalesforceContact) => void;
}

export default function ContactCard({ contact, onSelect }: ContactCardProps) {
  const initials = `${contact.firstName[0]}${contact.lastName[0]}`;
  const scoreColor =
    contact.relationshipScore && contact.relationshipScore >= 80
      ? "text-green-600 bg-green-50"
      : contact.relationshipScore && contact.relationshipScore >= 60
        ? "text-yellow-600 bg-yellow-50"
        : "text-surface-500 bg-surface-100";

  return (
    <button
      onClick={() => onSelect?.(contact)}
      className="w-full text-left bg-white rounded-xl border border-surface-200 p-4 hover:border-brand-400 hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-sm shrink-0">
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name and title */}
          <h3 className="font-semibold text-surface-900 group-hover:text-brand-700 transition-colors">
            {contact.firstName} {contact.lastName}
          </h3>
          {contact.title && (
            <p className="text-sm text-surface-500 truncate">{contact.title}</p>
          )}

          {/* Company */}
          <div className="flex items-center gap-1.5 mt-1 text-sm text-surface-600">
            <Building2 className="w-3.5 h-3.5" />
            <span>{contact.company}</span>
          </div>

          {/* Email */}
          <div className="flex items-center gap-1.5 mt-0.5 text-sm text-surface-500">
            <Mail className="w-3.5 h-3.5" />
            <span className="truncate">{contact.email}</span>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 mt-2">
            {contact.relationshipScore != null && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${scoreColor}`}
              >
                <Star className="w-3 h-3" />
                Score: {contact.relationshipScore}
              </span>
            )}
            {contact.totalEventsAttended != null &&
              contact.totalEventsAttended > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-surface-500">
                  <CalendarCheck className="w-3 h-3" />
                  {contact.totalEventsAttended} events attended
                </span>
              )}
          </div>

          {/* Last event */}
          {contact.lastEventAttended && (
            <p className="mt-1 text-xs text-surface-400">
              Last: {contact.lastEventAttended}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
