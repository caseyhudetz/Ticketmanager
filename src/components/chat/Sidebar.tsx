"use client";

import { useState } from "react";
import {
  MessageSquare,
  Plus,
  Search,
  Calendar,
  Ticket,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  Zap,
} from "lucide-react";

interface SidebarProps {
  onNewChat: () => void;
  onQuickAction: (action: string) => void;
}

interface ConversationStub {
  id: string;
  title: string;
  preview: string;
  time: string;
  unread?: boolean;
}

const RECENT_CONVERSATIONS: ConversationStub[] = [
  {
    id: "conv-1",
    title: "Lakers vs. Celtics Invites",
    preview: "Sent 3 invitations to TechCorp...",
    time: "2h ago",
    unread: true,
  },
  {
    id: "conv-2",
    title: "Q1 ROI Report",
    preview: "Generated hospitality ROI report...",
    time: "Yesterday",
  },
  {
    id: "conv-3",
    title: "Masters Ticket Allocation",
    preview: "Allocated 4 tickets for Augusta...",
    time: "Feb 10",
  },
  {
    id: "conv-4",
    title: "Super Bowl Planning",
    preview: "Reserved suite for Super Bowl LXI...",
    time: "Feb 8",
  },
];

const QUICK_ACTIONS = [
  { icon: Search, label: "Find events", action: "find_event" },
  { icon: Users, label: "Invite a client", action: "invite_client" },
  { icon: Ticket, label: "Manage tickets", action: "allocate_tickets" },
  { icon: Calendar, label: "Calendar", action: "schedule_calendar" },
  { icon: BarChart3, label: "ROI reports", action: "report_roi" },
];

export default function Sidebar({ onNewChat, onQuickAction }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div className="w-16 bg-surface-900 text-white flex flex-col items-center py-4 gap-3">
        <button
          onClick={() => setCollapsed(false)}
          className="p-2 rounded-lg hover:bg-surface-800 transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
        <div className="w-8 h-px bg-surface-700" />
        <button
          onClick={onNewChat}
          className="p-2 rounded-lg bg-brand-600 hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
        <div className="w-8 h-px bg-surface-700" />
        {QUICK_ACTIONS.map((qa) => (
          <button
            key={qa.action}
            onClick={() => onQuickAction(qa.action)}
            className="p-2 rounded-lg hover:bg-surface-800 transition-colors"
            title={qa.label}
          >
            <qa.icon className="w-4 h-4 text-surface-400" />
          </button>
        ))}
        <div className="flex-1" />
        <button className="p-2 rounded-lg hover:bg-surface-800 transition-colors">
          <Settings className="w-4 h-4 text-surface-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-72 bg-surface-900 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-surface-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold">TicketManager</h1>
            <p className="text-xs text-surface-400">Chat</p>
          </div>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1.5 rounded-lg hover:bg-surface-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-surface-400" />
        </button>
      </div>

      {/* New Chat */}
      <div className="px-3 py-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New conversation
        </button>
      </div>

      {/* Quick Actions */}
      <div className="px-3 pb-2">
        <p className="text-xs font-medium text-surface-500 uppercase tracking-wider px-1 mb-2">
          Quick Actions
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {QUICK_ACTIONS.map((qa) => (
            <button
              key={qa.action}
              onClick={() => onQuickAction(qa.action)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-surface-300 hover:bg-surface-800 hover:text-white transition-colors"
            >
              <qa.icon className="w-3.5 h-3.5" />
              {qa.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <p className="text-xs font-medium text-surface-500 uppercase tracking-wider px-1 mb-2">
          Recent
        </p>
        <div className="space-y-0.5">
          {RECENT_CONVERSATIONS.map((conv) => (
            <button
              key={conv.id}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-surface-800 transition-colors group"
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm font-medium text-surface-200 truncate group-hover:text-white">
                  {conv.title}
                </span>
                {conv.unread && (
                  <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-surface-500 truncate">
                  {conv.preview}
                </span>
                <span className="text-xs text-surface-600 shrink-0 ml-2">
                  {conv.time}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-surface-800">
        <div className="flex items-center gap-2 px-2">
          <div className="w-7 h-7 rounded-full bg-brand-700 flex items-center justify-center text-xs font-semibold">
            CH
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-surface-200 truncate">
              Casey H.
            </p>
            <p className="text-xs text-surface-500">Admin</p>
          </div>
          <button className="p-1 rounded hover:bg-surface-800">
            <Settings className="w-3.5 h-3.5 text-surface-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
