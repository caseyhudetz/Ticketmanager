"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage as ChatMessageType, Event, SalesforceContact } from "@/types";
import { processMessage, resetContext } from "@/lib/conversation-engine";
import ChatMessageComponent from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import Sidebar from "@/components/chat/Sidebar";
import WelcomeScreen from "@/components/chat/WelcomeScreen";
import TypingIndicator from "@/components/chat/TypingIndicator";

export default function Home() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleSend = useCallback(
    (text: string) => {
      const userMessage: ChatMessageType = {
        id: `msg-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      // Simulate processing delay for natural feel
      setTimeout(() => {
        const response = processMessage(text);
        setMessages((prev) => [...prev, response]);
        setIsTyping(false);
      }, 600 + Math.random() * 800);
    },
    []
  );

  const handleNewChat = useCallback(() => {
    setMessages([]);
    resetContext();
  }, []);

  const handleQuickAction = useCallback(
    (action: string) => {
      const actionMessages: Record<string, string> = {
        find_event: "Show me upcoming events",
        invite_client: "I want to invite a client to an event",
        allocate_tickets: "Help me allocate tickets",
        schedule_calendar: "Add an event to my calendar",
        report_roi: "Show me our hospitality ROI report",
      };

      const text = actionMessages[action] ?? "What can you help me with?";
      handleSend(text);
    },
    [handleSend]
  );

  const handleAction = useCallback(
    (action: string) => {
      const actionMessages: Record<string, string> = {
        find_event: "Show me more events",
        filter_date: "Filter events by this month",
        create_invitation: "Create an invitation for this event",
        view_history: "Show their event history",
        invite_client: "I want to invite a client",
        allocate_tickets: "Help me allocate tickets for this event",
        lookup_contact: "Search for a contact in Salesforce",
        view_all_contacts: "Show all my Salesforce contacts",
        send_invitation: "Send the invitation",
        confirm_send: "Yes, send it now",
        edit_invitation: "Let me edit the invitation message",
        schedule_calendar: "Add this to my calendar",
        calendar_outlook: "Add to my Outlook calendar",
        calendar_google: "Add to my Google Calendar",
        calendar_ical: "Download the calendar file",
        send_reminders: "Send RSVP reminders to pending guests",
        view_rsvp_details: "Show me detailed RSVP breakdown",
        list_tickets: "List my unused tickets for sale",
        exchange_tickets: "Exchange tickets with partner companies",
        detailed_report: "Show me the full detailed report",
        export_pdf: "Export the report as PDF",
        compliance_report: "Show the compliance report",
        complete: "Thanks, I'm all set!",
      };

      const text = actionMessages[action] ?? action;
      handleSend(text);
    },
    [handleSend]
  );

  const handleSelectEvent = useCallback(
    (event: Event) => {
      handleSend(`Tell me more about ${event.name} at ${event.venue}`);
    },
    [handleSend]
  );

  const handleSelectContact = useCallback(
    (contact: SalesforceContact) => {
      handleSend(
        `I want to invite ${contact.firstName} ${contact.lastName} from ${contact.company}`
      );
    },
    [handleSend]
  );

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <Sidebar onNewChat={handleNewChat} onQuickAction={handleQuickAction} />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-surface-50 min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-surface-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-surface-800">
              {messages.length === 0
                ? "New Conversation"
                : "TicketManager Assistant"}
            </h2>
            <p className="text-xs text-surface-400">
              {messages.length === 0
                ? "Start by describing what you need"
                : `${messages.length} messages`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-surface-500 bg-surface-100 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Salesforce connected
            </span>
          </div>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <WelcomeScreen onSuggestion={handleSend} />
          ) : (
            <div className="max-w-3xl mx-auto py-4 space-y-1">
              {messages.map((msg) => (
                <ChatMessageComponent
                  key={msg.id}
                  message={msg}
                  onAction={handleAction}
                  onSelectEvent={handleSelectEvent}
                  onSelectContact={handleSelectContact}
                />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput onSend={handleSend} disabled={isTyping} />
      </div>
    </div>
  );
}
