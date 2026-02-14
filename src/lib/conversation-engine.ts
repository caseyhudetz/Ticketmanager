import { ChatMessage, DetectedIntent, MessageContent, ActionButton } from "@/types";
import { detectIntent, getIntentDescription } from "./intent-engine";
import { searchEvents, searchContacts, MOCK_EVENTS, MOCK_CONTACTS, MOCK_ALLOCATIONS } from "./mock-data";

interface ConversationContext {
  lastIntent?: DetectedIntent;
  selectedEvent?: string;
  selectedContact?: string;
  pendingAction?: string;
}

let context: ConversationContext = {};

export function resetContext(): void {
  context = {};
}

export function processMessage(userMessage: string): ChatMessage {
  const intent = detectIntent(userMessage);

  const handler = intentHandlers[intent.type] ?? handleGeneral;
  const response = handler(userMessage, intent);

  context.lastIntent = intent;

  return {
    id: `msg-${Date.now()}`,
    role: "assistant",
    content: response.text,
    richContent: response.richContent,
    timestamp: new Date(),
    intent,
  };
}

interface HandlerResponse {
  text: string;
  richContent?: MessageContent[];
}

type IntentHandler = (message: string, intent: DetectedIntent) => HandlerResponse;

const intentHandlers: Record<string, IntentHandler> = {
  find_event: handleFindEvent,
  invite_client: handleInviteClient,
  allocate_tickets: handleAllocateTickets,
  check_availability: handleCheckAvailability,
  lookup_contact: handleLookupContact,
  send_invitation: handleSendInvitation,
  schedule_calendar: handleScheduleCalendar,
  view_rsvp_status: handleViewRsvp,
  sell_unused_tickets: handleSellTickets,
  report_roi: handleReportRoi,
  general_question: handleGeneral,
  unknown: handleGeneral,
};

function handleFindEvent(message: string, intent: DetectedIntent): HandlerResponse {
  const sportEntity = intent.entities.find((e) => e.type === "sport");
  const teamEntity = intent.entities.find((e) => e.type === "team");
  const cityEntity = intent.entities.find((e) => e.type === "city");

  const query = sportEntity?.value ?? teamEntity?.value ?? cityEntity?.value ?? message;
  let events = searchEvents(query);

  if (events.length === 0) {
    events = MOCK_EVENTS.slice(0, 4);
  }

  const eventCards: MessageContent[] = events.map((event) => ({
    type: "event-card",
    data: event,
  }));

  const buttons: ActionButton[] = [
    { id: "btn-more", label: "Show more events", action: "find_event", variant: "outline" },
    { id: "btn-filter", label: "Filter by date", action: "filter_date", variant: "outline" },
  ];

  eventCards.push({
    type: "action-buttons",
    data: buttons,
  });

  const greeting = events.length === MOCK_EVENTS.length
    ? "Here's what's coming up across all our events:"
    : `I found ${events.length} event${events.length > 1 ? "s" : ""} matching your search:`;

  return {
    text: greeting,
    richContent: eventCards,
  };
}

function handleInviteClient(message: string, intent: DetectedIntent): HandlerResponse {
  const contactEntity = intent.entities.find((e) => e.type === "contactName");
  const companyEntity = intent.entities.find((e) => e.type === "company");

  if (contactEntity || companyEntity) {
    const query = contactEntity?.value ?? companyEntity?.value ?? "";
    const contacts = searchContacts(query);

    if (contacts.length > 0) {
      context.selectedContact = contacts[0].id;

      const contactCards: MessageContent[] = contacts.map((c) => ({
        type: "contact-card",
        data: c,
      }));

      const buttons: ActionButton[] = [
        { id: "btn-invite", label: "Create invitation", action: "create_invitation", variant: "primary" },
        { id: "btn-history", label: "View event history", action: "view_history", variant: "outline" },
      ];

      contactCards.push({ type: "action-buttons", data: buttons });

      return {
        text: `I found ${contacts.length} contact${contacts.length > 1 ? "s" : ""} in Salesforce. Here's who I found:`,
        richContent: contactCards,
      };
    }
  }

  // No specific contact — show top contacts and ask to pick
  const topContacts = MOCK_CONTACTS.slice(0, 4);
  const contactCards: MessageContent[] = topContacts.map((c) => ({
    type: "contact-card",
    data: c,
  }));

  const buttons: ActionButton[] = [
    { id: "btn-search", label: "Search Salesforce", action: "lookup_contact", variant: "primary" },
    { id: "btn-all", label: "View all contacts", action: "view_all_contacts", variant: "outline" },
  ];

  contactCards.push({ type: "action-buttons", data: buttons });

  return {
    text: "Who would you like to invite? Here are some of your top contacts from Salesforce:",
    richContent: contactCards,
  };
}

function handleAllocateTickets(message: string, intent: DetectedIntent): HandlerResponse {
  const quantityEntity = intent.entities.find((e) => e.type === "quantity");
  const recipientEntity = intent.entities.find((e) => e.type === "recipient");

  if (context.selectedEvent && context.selectedContact) {
    const allocation = {
      eventId: context.selectedEvent,
      contactId: context.selectedContact,
      quantity: quantityEntity ? parseInt(quantityEntity.value) : 2,
    };

    return {
      text: `I've allocated ${allocation.quantity} tickets. The recipient will receive a mobile transfer notification. Would you also like to send a calendar invite?`,
      richContent: [
        {
          type: "ticket-allocation",
          data: {
            ...allocation,
            status: "confirmed",
            transferMethod: "mobile",
          },
        },
        {
          type: "action-buttons",
          data: [
            { id: "btn-cal", label: "Add to calendar", action: "schedule_calendar", variant: "primary" },
            { id: "btn-invite", label: "Send invitation email", action: "send_invitation", variant: "secondary" },
            { id: "btn-done", label: "Done", action: "complete", variant: "outline" },
          ] as ActionButton[],
        },
      ],
    };
  }

  // Need more context
  const events = MOCK_EVENTS.filter((e) => e.availableTickets > 0).slice(0, 3);
  return {
    text: "I can help you allocate tickets. Which event would you like to allocate tickets for?",
    richContent: [
      ...events.map((e) => ({ type: "event-card" as const, data: e })),
      {
        type: "action-buttons",
        data: [
          { id: "btn-all-events", label: "Show all events", action: "find_event", variant: "outline" },
        ] as ActionButton[],
      },
    ],
  };
}

function handleCheckAvailability(_message: string, _intent: DetectedIntent): HandlerResponse {
  const available = MOCK_EVENTS.filter((e) => e.availableTickets > 0);

  return {
    text: `You have tickets available across ${available.length} upcoming events. Here's the breakdown:`,
    richContent: [
      ...available.map((e) => ({ type: "event-card" as const, data: e })),
    ],
  };
}

function handleLookupContact(message: string, intent: DetectedIntent): HandlerResponse {
  const nameEntity = intent.entities.find((e) => e.type === "contactName");
  const companyEntity = intent.entities.find((e) => e.type === "company");

  const query = nameEntity?.value ?? companyEntity?.value ?? message;
  const contacts = searchContacts(query);

  if (contacts.length === 0) {
    return {
      text: `I couldn't find any contacts matching "${query}" in Salesforce. Would you like to try a different search, or add a new contact?`,
      richContent: [
        {
          type: "action-buttons",
          data: [
            { id: "btn-retry", label: "Search again", action: "lookup_contact", variant: "primary" },
            { id: "btn-all", label: "Browse all contacts", action: "view_all_contacts", variant: "outline" },
          ] as ActionButton[],
        },
      ],
    };
  }

  return {
    text: `Found ${contacts.length} contact${contacts.length > 1 ? "s" : ""} in Salesforce:`,
    richContent: [
      ...contacts.map((c) => ({ type: "contact-card" as const, data: c })),
      {
        type: "action-buttons",
        data: [
          { id: "btn-invite", label: "Invite to event", action: "invite_client", variant: "primary" },
          { id: "btn-allocate", label: "Allocate tickets", action: "allocate_tickets", variant: "secondary" },
        ] as ActionButton[],
      },
    ],
  };
}

function handleSendInvitation(_message: string, _intent: DetectedIntent): HandlerResponse {
  const event = MOCK_EVENTS[0];
  const contact = MOCK_CONTACTS[0];

  return {
    text: "Here's a preview of the invitation. Review it and I'll send it when you're ready:",
    richContent: [
      {
        type: "invitation-preview",
        data: {
          id: `inv-${Date.now()}`,
          event,
          recipients: [contact],
          subject: `You're invited: ${event.name} at ${event.venue}`,
          message: `Hi ${contact.firstName},\n\nWe'd love for you to join us for ${event.name} at ${event.venue} on ${event.date}. We have ${event.suiteInfo ?? "great seats"} reserved.\n\nPlease let us know if you can make it!\n\nBest regards`,
          status: "draft",
          template: { id: "tpl-001", name: "Premium", subject: "", body: "", style: "premium" as const },
          calendarAttachment: true,
        },
      },
      {
        type: "action-buttons",
        data: [
          { id: "btn-send", label: "Send now", action: "confirm_send", variant: "primary" },
          { id: "btn-edit", label: "Edit message", action: "edit_invitation", variant: "outline" },
          { id: "btn-calendar", label: "Include calendar invite", action: "schedule_calendar", variant: "outline" },
        ] as ActionButton[],
      },
    ],
  };
}

function handleScheduleCalendar(_message: string, _intent: DetectedIntent): HandlerResponse {
  const event = MOCK_EVENTS[0];

  return {
    text: `I'll add "${event.name}" to your calendar. Which calendar would you like to use?`,
    richContent: [
      {
        type: "calendar-event",
        data: {
          title: event.name,
          location: `${event.venue}, ${event.location.city}, ${event.location.state}`,
          startTime: event.date,
          duration: "3 hours",
        },
      },
      {
        type: "action-buttons",
        data: [
          { id: "btn-outlook", label: "Outlook", action: "calendar_outlook", variant: "primary" },
          { id: "btn-google", label: "Google Calendar", action: "calendar_google", variant: "secondary" },
          { id: "btn-ical", label: "Download .ics", action: "calendar_ical", variant: "outline" },
        ] as ActionButton[],
      },
    ],
  };
}

function handleViewRsvp(_message: string, _intent: DetectedIntent): HandlerResponse {
  return {
    text: "Here's the RSVP status for your upcoming events:",
    richContent: [
      {
        type: "text",
        data: {
          items: [
            { event: "Lakers vs. Celtics (Mar 15)", accepted: 3, pending: 2, declined: 1 },
            { event: "Yankees vs. Dodgers (Apr 22)", accepted: 2, pending: 1, declined: 0 },
            { event: "Chiefs vs. 49ers (Oct 12)", accepted: 0, pending: 6, declined: 0 },
          ],
        },
      },
      {
        type: "action-buttons",
        data: [
          { id: "btn-remind", label: "Send reminders", action: "send_reminders", variant: "primary" },
          { id: "btn-details", label: "View details", action: "view_rsvp_details", variant: "outline" },
        ] as ActionButton[],
      },
    ],
  };
}

function handleSellTickets(_message: string, _intent: DetectedIntent): HandlerResponse {
  const withAvailable = MOCK_EVENTS.filter((e) => e.availableTickets > 2);

  return {
    text: `You have unused tickets across ${withAvailable.length} events that could be listed on the All Access Community marketplace:`,
    richContent: [
      ...withAvailable.map((e) => ({ type: "event-card" as const, data: e })),
      {
        type: "action-buttons",
        data: [
          { id: "btn-list", label: "List for sale", action: "list_tickets", variant: "primary" },
          { id: "btn-exchange", label: "Exchange with partners", action: "exchange_tickets", variant: "outline" },
        ] as ActionButton[],
      },
    ],
  };
}

function handleReportRoi(_message: string, _intent: DetectedIntent): HandlerResponse {
  return {
    text: "Here's your hospitality program performance summary:",
    richContent: [
      {
        type: "text",
        data: {
          summary: {
            totalEvents: 24,
            totalGuests: 156,
            avgAttendanceRate: "87%",
            estimatedROI: "$2.4M pipeline influenced",
            complianceStatus: "100% compliant",
            topPerformingEvent: "Super Bowl LX — 4 deals closed",
            ticketUtilization: "78%",
          },
        },
      },
      {
        type: "action-buttons",
        data: [
          { id: "btn-full-report", label: "Full report", action: "detailed_report", variant: "primary" },
          { id: "btn-export", label: "Export to PDF", action: "export_pdf", variant: "outline" },
          { id: "btn-compliance", label: "Compliance report", action: "compliance_report", variant: "outline" },
        ] as ActionButton[],
      },
    ],
  };
}

function handleGeneral(_message: string, _intent: DetectedIntent): HandlerResponse {
  return {
    text: "I can help you with managing your corporate hospitality program. Here's what I can do:",
    richContent: [
      {
        type: "action-buttons",
        data: [
          { id: "btn-events", label: "Find events", action: "find_event", variant: "primary" },
          { id: "btn-invite", label: "Invite a client", action: "invite_client", variant: "secondary" },
          { id: "btn-tickets", label: "Manage tickets", action: "allocate_tickets", variant: "outline" },
          { id: "btn-report", label: "View ROI reports", action: "report_roi", variant: "outline" },
        ] as ActionButton[],
      },
    ],
  };
}
