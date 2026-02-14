"use client";

import { Ticket, Users, Calendar, BarChart3, Send, Search } from "lucide-react";

interface WelcomeScreenProps {
  onSuggestion: (text: string) => void;
}

const SUGGESTIONS = [
  {
    icon: Search,
    title: "Find upcoming events",
    text: "Show me upcoming NBA games this month",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Users,
    title: "Invite a client",
    text: "Invite Sarah Chen from TechCorp to the Lakers game",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Ticket,
    title: "Allocate tickets",
    text: "Reserve 4 tickets for the Chiefs vs 49ers game",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Calendar,
    title: "Schedule & calendar",
    text: "Add the Super Bowl to my Outlook calendar",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: Send,
    title: "Send invitations",
    text: "Create a premium invitation for the Masters Tournament",
    color: "bg-pink-50 text-pink-600",
  },
  {
    icon: BarChart3,
    title: "View ROI reports",
    text: "Show me our hospitality program ROI",
    color: "bg-cyan-50 text-cyan-600",
  },
];

export default function WelcomeScreen({ onSuggestion }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      {/* Logo & greeting */}
      <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center mb-6 shadow-lg shadow-brand-200">
        <Ticket className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-surface-900 mb-2">
        Welcome to TicketManager
      </h2>
      <p className="text-surface-500 text-center max-w-md mb-8">
        Manage your corporate hospitality program through conversation.
        Describe what you need and I&apos;ll handle the rest.
      </p>

      {/* Suggestion grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl w-full">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion.title}
            onClick={() => onSuggestion(suggestion.text)}
            className="flex items-start gap-3 p-4 rounded-xl bg-white border border-surface-200 hover:border-brand-300 hover:shadow-md transition-all duration-200 text-left group"
          >
            <div
              className={`w-9 h-9 rounded-lg ${suggestion.color} flex items-center justify-center shrink-0`}
            >
              <suggestion.icon className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-sm font-medium text-surface-800 group-hover:text-brand-700">
                {suggestion.title}
              </p>
              <p className="text-xs text-surface-400 mt-0.5 leading-relaxed">
                &quot;{suggestion.text}&quot;
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Integrations note */}
      <div className="mt-8 flex items-center gap-4 text-xs text-surface-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          Salesforce connected
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          Outlook synced
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          400+ venues
        </span>
      </div>
    </div>
  );
}
