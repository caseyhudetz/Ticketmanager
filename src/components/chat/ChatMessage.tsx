"use client";

import { ChatMessage as ChatMessageType, Event, SalesforceContact, Invitation, ActionButton } from "@/types";
import EventCard from "@/components/cards/EventCard";
import ContactCard from "@/components/cards/ContactCard";
import InvitationPreview from "@/components/cards/InvitationPreview";
import CalendarEventCard from "@/components/cards/CalendarEventCard";
import ActionButtons from "./ActionButtons";

interface ChatMessageProps {
  message: ChatMessageType;
  onAction: (action: string, data?: Record<string, unknown>) => void;
  onSelectEvent?: (event: Event) => void;
  onSelectContact?: (contact: SalesforceContact) => void;
}

export default function ChatMessageComponent({
  message,
  onAction,
  onSelectEvent,
  onSelectContact,
}: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`message-enter flex gap-3 px-4 py-2 ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center shrink-0 mt-1">
          <span className="text-white text-xs font-bold">TM</span>
        </div>
      )}

      {/* Message content */}
      <div
        className={`max-w-[85%] md:max-w-[75%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-2`}
      >
        {/* Text bubble */}
        {message.content && (
          <div
            className={`rounded-2xl px-4 py-2.5 ${
              isUser
                ? "bg-brand-600 text-white rounded-br-md"
                : "bg-white text-surface-800 border border-surface-200 rounded-bl-md shadow-sm"
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-line">
              {message.content}
            </p>
          </div>
        )}

        {/* Rich content */}
        {message.richContent?.map((content, index) => {
          switch (content.type) {
            case "event-card":
              return (
                <div key={index} className="w-full max-w-md">
                  <EventCard
                    event={content.data as Event}
                    onSelect={onSelectEvent}
                  />
                </div>
              );

            case "contact-card":
              return (
                <div key={index} className="w-full max-w-md">
                  <ContactCard
                    contact={content.data as SalesforceContact}
                    onSelect={onSelectContact}
                  />
                </div>
              );

            case "invitation-preview":
              return (
                <div key={index} className="w-full max-w-md">
                  <InvitationPreview
                    invitation={content.data as Invitation}
                  />
                </div>
              );

            case "calendar-event":
              return (
                <div key={index} className="w-full max-w-md">
                  <CalendarEventCard
                    data={
                      content.data as {
                        title: string;
                        location: string;
                        startTime: string;
                        duration: string;
                      }
                    }
                  />
                </div>
              );

            case "action-buttons":
              return (
                <ActionButtons
                  key={index}
                  buttons={content.data as ActionButton[]}
                  onAction={onAction}
                />
              );

            case "text": {
              const textData = content.data as Record<string, unknown>;
              return (
                <div
                  key={index}
                  className="w-full max-w-md bg-white rounded-xl border border-surface-200 p-4"
                >
                  {textData.summary != null ? (
                    <div className="space-y-2">
                      {Object.entries(
                        textData.summary as Record<string, string>
                      ).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-surface-500 capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                          <span className="font-medium text-surface-800">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {textData.items != null ?
                    (textData.items as { event: string; accepted: number; pending: number; declined: number }[]).map(
                      (item, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center py-2 border-b border-surface-100 last:border-0 text-sm"
                        >
                          <span className="text-surface-700">{item.event}</span>
                          <div className="flex gap-2 text-xs">
                            <span className="text-green-600">
                              {item.accepted} accepted
                            </span>
                            <span className="text-yellow-600">
                              {item.pending} pending
                            </span>
                            {item.declined > 0 && (
                              <span className="text-red-500">
                                {item.declined} declined
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    ) : null}
                </div>
              );
            }

            default:
              return null;
          }
        })}

        {/* Timestamp */}
        <span
          className={`text-xs text-surface-400 px-1 ${
            isUser ? "text-right" : ""
          }`}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
