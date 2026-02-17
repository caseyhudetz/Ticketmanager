import { ChatMessage, DetectedIntent, MessageContent, ActionButton, MeetingFlowState, MeetingFlowStep, MeetingFlowData, Invitation } from "@/types";
import { detectIntent, getIntentDescription } from "./intent-engine";
import { searchEvents, searchContacts, MOCK_EVENTS, MOCK_CONTACTS, MOCK_ALLOCATIONS, parseTimeframe, filterEvents } from "./mock-data";

interface ConversationContext {
  lastIntent?: DetectedIntent;
  selectedEvent?: string;
  selectedContact?: string;
  pendingAction?: string;
  meetingFlow?: MeetingFlowState;
}

let context: ConversationContext = {};

export function resetContext(): void {
  context = {};
}

export function processMessage(userMessage: string): ChatMessage {
  const intent = detectIntent(userMessage);

  // If a meeting flow is active, route through the state machine
  if (context.meetingFlow?.active) {
    const response = advanceMeetingFlow(userMessage, intent);
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

  // If plan_meeting intent detected, start new flow
  if (intent.type === "plan_meeting") {
    context.meetingFlow = initMeetingFlow(userMessage, intent);
    const response = advanceMeetingFlow(userMessage, intent);
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

  // Existing flat handler routing (unchanged)
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
  plan_meeting: handleGeneral, // handled by flow, fallback only
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
          { id: "btn-meeting", label: "Plan a meeting", action: "plan_meeting", variant: "secondary" },
          { id: "btn-tickets", label: "Manage tickets", action: "allocate_tickets", variant: "outline" },
          { id: "btn-report", label: "View ROI reports", action: "report_roi", variant: "outline" },
        ] as ActionButton[],
      },
    ],
  };
}

// ── Meeting Planner Flow ──────────────────────────────────────────────

function initMeetingFlow(
  message: string,
  intent: DetectedIntent
): MeetingFlowState {
  const data: MeetingFlowData = {};

  // Extract company from entities
  const companyEntity = intent.entities.find((e) => e.type === "company");
  if (companyEntity) {
    data.companyName = companyEntity.value;
    const contacts = searchContacts(companyEntity.value);
    if (contacts.length === 1) {
      data.selectedContact = contacts[0];
    } else if (contacts.length > 1) {
      data.candidateContacts = contacts;
    }
  }

  // Extract timeframe
  const dateEntity = intent.entities.find((e) => e.type === "date");
  if (dateEntity) {
    const tf = parseTimeframe(dateEntity.value);
    if (tf) data.timeframe = tf;
  }

  // Extract city if provided
  const cityEntity = intent.entities.find((e) => e.type === "city");
  if (cityEntity) {
    data.location = cityEntity.value;
  }

  // Determine starting step by skipping already-resolved steps
  let startStep: MeetingFlowStep = "client_identification";
  if (data.selectedContact) {
    startStep = "location";
    if (data.location) {
      startStep = "event_discovery";
    }
  }

  return {
    currentStep: startStep,
    data,
    active: true,
  };
}

function advanceMeetingFlow(
  message: string,
  intent: DetectedIntent
): HandlerResponse {
  const flow = context.meetingFlow!;

  // Allow user to cancel at any point
  if (/(?:cancel|never ?mind|start over|stop|quit)\b/i.test(message)) {
    flow.active = false;
    return {
      text: "No problem, I've cancelled the meeting planner. What else can I help you with?",
      richContent: [
        {
          type: "action-buttons",
          data: [
            { id: "btn-restart", label: "Start over", action: "plan_meeting", variant: "primary" },
            { id: "btn-events", label: "Browse events", action: "find_event", variant: "outline" },
          ] as ActionButton[],
        },
      ],
    };
  }

  switch (flow.currentStep) {
    case "client_identification":
      return handleFlowClientId(message, flow);
    case "location":
      return handleFlowLocation(message, flow);
    case "event_discovery":
      return handleFlowEventDiscovery(flow);
    case "event_selection":
      return handleFlowEventSelection(message, flow);
    case "invitation_preview":
      return handleFlowInvitationPreview(flow);
    case "send_confirmation":
      return handleFlowSendConfirmation(message, flow);
    default:
      flow.active = false;
      return handleGeneral(message, intent);
  }
}

function buildCityButtons(): ActionButton[] {
  const cities = [...new Set(MOCK_EVENTS.map((e) => e.location.city))];
  return cities.slice(0, 5).map((city, i) => ({
    id: `btn-city-${i}`,
    label: city,
    action: `flow_select_city_${city}`,
    variant: (i === 0 ? "primary" : "outline") as "primary" | "outline",
  }));
}

// Step 1: Client Identification
function handleFlowClientId(
  message: string,
  flow: MeetingFlowState
): HandlerResponse {
  const data = flow.data;

  // If we have candidates, check if user is selecting one
  if (data.candidateContacts && data.candidateContacts.length > 0) {
    const selectedByName = data.candidateContacts.find((c) => {
      const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
      return message.toLowerCase().includes(fullName) ||
             message.toLowerCase().includes(c.firstName.toLowerCase());
    });

    if (selectedByName) {
      data.selectedContact = selectedByName;
      data.candidateContacts = undefined;
      flow.currentStep = data.location ? "event_discovery" : "location";

      if (data.location) {
        return handleFlowEventDiscovery(flow);
      }

      return {
        text: `Great, I'll plan this for ${selectedByName.firstName} ${selectedByName.lastName} from ${selectedByName.company}. Where will you be meeting? I can filter events by city.`,
        richContent: [
          { type: "contact-card", data: selectedByName },
          { type: "action-buttons", data: buildCityButtons() },
        ],
      };
    }

    // Show candidates for user to pick
    const contactCards: MessageContent[] = data.candidateContacts.map((c) => ({
      type: "contact-card",
      data: c,
    }));
    contactCards.push({
      type: "action-buttons",
      data: [
        { id: "btn-search-again", label: "Search again", action: "flow_search_contact", variant: "outline" },
      ] as ActionButton[],
    });

    return {
      text: `I found ${data.candidateContacts.length} contacts at ${data.companyName ?? "that company"}. Which one will you be meeting with?`,
      richContent: contactCards,
    };
  }

  // Single contact already found from init
  if (data.selectedContact) {
    flow.currentStep = data.location ? "event_discovery" : "location";
    if (data.location) {
      return handleFlowEventDiscovery(flow);
    }
    return {
      text: `I found ${data.selectedContact.firstName} ${data.selectedContact.lastName} from ${data.selectedContact.company} in Salesforce. I'll set this meeting up for them.\n\nWhere will you be meeting? I can filter events by location.`,
      richContent: [
        { type: "contact-card", data: data.selectedContact },
        { type: "action-buttons", data: buildCityButtons() },
      ],
    };
  }

  // Try to search with company name or the user's message
  const query = data.companyName ?? message;
  const contacts = searchContacts(query);

  if (contacts.length === 1) {
    data.selectedContact = contacts[0];
    flow.currentStep = data.location ? "event_discovery" : "location";
    if (data.location) {
      return handleFlowEventDiscovery(flow);
    }
    return {
      text: `Found ${contacts[0].firstName} ${contacts[0].lastName} from ${contacts[0].company}. I'll plan the meeting for them.\n\nWhere will you be meeting?`,
      richContent: [
        { type: "contact-card", data: contacts[0] },
        { type: "action-buttons", data: buildCityButtons() },
      ],
    };
  } else if (contacts.length > 1) {
    data.candidateContacts = contacts;
    return handleFlowClientId(message, flow);
  }

  // Nothing found — ask
  return {
    text: "I couldn't find that contact in Salesforce. Could you tell me the client's name or company?",
    richContent: [
      {
        type: "action-buttons",
        data: [
          { id: "btn-browse", label: "Browse all contacts", action: "flow_browse_contacts", variant: "outline" },
        ] as ActionButton[],
      },
    ],
  };
}

// Step 2: Location
function handleFlowLocation(
  message: string,
  flow: MeetingFlowState
): HandlerResponse {
  const data = flow.data;

  // Try to extract a city from the message
  const cityMatch = message.match(
    /\b(Los Angeles|New York|San Francisco|Kansas City|Chicago|Boston|Dallas|Houston|Phoenix|Sacramento|San Jose|Inglewood|Augusta|Santa Clara)\b/i
  );

  if (cityMatch) {
    data.location = cityMatch[1];
    flow.currentStep = "event_discovery";
    return handleFlowEventDiscovery(flow);
  }

  // Short message — treat as city name
  const trimmed = message.trim();
  if (trimmed.length > 0 && trimmed.length < 30) {
    data.location = trimmed;
    flow.currentStep = "event_discovery";
    return handleFlowEventDiscovery(flow);
  }

  return {
    text: "Which city will you be meeting in? I'll find events near that location.",
    richContent: [
      { type: "action-buttons", data: buildCityButtons() },
    ],
  };
}

// Step 3: Event Discovery
function handleFlowEventDiscovery(
  flow: MeetingFlowState
): HandlerResponse {
  const data = flow.data;

  const matchedEvents = filterEvents(MOCK_EVENTS, {
    timeframe: data.timeframe ? { start: data.timeframe.start, end: data.timeframe.end } : undefined,
    city: data.location ?? undefined,
  });

  if (matchedEvents.length === 0) {
    // Broaden search: try location only, then date only, then show all
    const byLocation = data.location ? filterEvents(MOCK_EVENTS, { city: data.location }) : [];
    const byDate = data.timeframe ? filterEvents(MOCK_EVENTS, { timeframe: data.timeframe }) : [];
    const fallback = byLocation.length > 0 ? byLocation : byDate.length > 0 ? byDate : MOCK_EVENTS.slice(0, 4);

    data.matchedEvents = fallback;
    flow.currentStep = "event_selection";

    const qualifier = byLocation.length > 0
      ? `in ${data.location} (across all dates)`
      : byDate.length > 0
        ? `during ${data.timeframe?.label ?? "that timeframe"} (all locations)`
        : "";

    return {
      text: `I couldn't find exact matches for ${data.timeframe?.label ?? ""} in ${data.location ?? "that area"}, but here are some options ${qualifier}:`,
      richContent: [
        ...fallback.map((e) => ({ type: "event-card" as const, data: e })),
        {
          type: "action-buttons",
          data: [
            { id: "btn-show-all", label: "Show all events", action: "flow_show_all_events", variant: "outline" },
          ] as ActionButton[],
        },
      ],
    };
  }

  data.matchedEvents = matchedEvents;
  flow.currentStep = "event_selection";

  const timeLabel = data.timeframe?.label ?? "";
  const locationLabel = data.location ?? "";
  const contactName = data.selectedContact?.firstName ?? "your client";

  return {
    text: `I found ${matchedEvents.length} event${matchedEvents.length > 1 ? "s" : ""} ${timeLabel ? `${timeLabel} ` : ""}${locationLabel ? `in ${locationLabel} ` : ""}that would be great for your meeting with ${contactName}:`,
    richContent: [
      ...matchedEvents.map((e) => ({ type: "event-card" as const, data: e })),
      {
        type: "action-buttons",
        data: [
          { id: "btn-show-more", label: "Show more options", action: "flow_show_all_events", variant: "outline" },
        ] as ActionButton[],
      },
    ],
  };
}

// Step 4: Event Selection
function handleFlowEventSelection(
  message: string,
  flow: MeetingFlowState
): HandlerResponse {
  const data = flow.data;
  const lowerMsg = message.toLowerCase();

  const matched = (data.matchedEvents ?? MOCK_EVENTS).find((e) => {
    return lowerMsg.includes(e.name.toLowerCase()) ||
           lowerMsg.includes(e.venue.toLowerCase()) ||
           e.name.toLowerCase().split(/\s+/).some(
             (word) => word.length > 3 && lowerMsg.includes(word)
           );
  });

  if (matched) {
    data.selectedEvent = matched;
    flow.currentStep = "invitation_preview";
    return handleFlowInvitationPreview(flow);
  }

  // Could not determine — ask again
  const events = data.matchedEvents ?? [];
  return {
    text: "Which event would you like to select for the meeting? Just click one or tell me the event name.",
    richContent: [
      ...events.map((e) => ({ type: "event-card" as const, data: e })),
    ],
  };
}

// Step 5: Invitation Preview
function handleFlowInvitationPreview(
  flow: MeetingFlowState
): HandlerResponse {
  const data = flow.data;
  const contact = data.selectedContact!;
  const event = data.selectedEvent!;

  const invitation: Invitation = {
    id: `inv-${Date.now()}`,
    event,
    recipients: [contact],
    subject: `You're invited: ${event.name} at ${event.venue}`,
    message: `Hi ${contact.firstName},\n\nWe'd love for you to join us for ${event.name} at ${event.venue} on ${event.date} at ${event.time}.\n\n${event.suiteInfo ? `We have ${event.suiteInfo} reserved for the occasion.` : "We have great seats reserved."}\n\nPlease let us know if you can make it!\n\nBest regards`,
    status: "draft",
    template: { id: "tpl-001", name: "Premium", subject: "", body: "", style: "premium" as const },
    calendarAttachment: true,
  };

  data.invitation = invitation;
  flow.currentStep = "send_confirmation";

  return {
    text: `Here's the invitation preview for ${contact.firstName} ${contact.lastName} to attend ${event.name}. Review it and let me know when you're ready to send:`,
    richContent: [
      { type: "invitation-preview", data: invitation },
      {
        type: "action-buttons",
        data: [
          { id: "btn-send-now", label: "Send now", action: "flow_confirm_send", variant: "primary" },
          { id: "btn-edit-msg", label: "Edit message", action: "flow_edit_invitation", variant: "outline" },
          { id: "btn-cancel", label: "Cancel", action: "flow_cancel", variant: "outline" },
        ] as ActionButton[],
      },
    ],
  };
}

// Step 6: Send Confirmation
function handleFlowSendConfirmation(
  message: string,
  flow: MeetingFlowState
): HandlerResponse {
  const data = flow.data;
  const isConfirm = /(?:send|yes|confirm|go ahead|looks good|approve|do it|perfect)/i.test(message);
  const isCancel = /(?:cancel|never ?mind|don't|no)\b/i.test(message);

  if (isCancel) {
    flow.active = false;
    flow.currentStep = "completed";
    return {
      text: "No problem, I've cancelled the invitation. Is there anything else I can help you with?",
      richContent: [
        {
          type: "action-buttons",
          data: [
            { id: "btn-restart", label: "Plan another meeting", action: "plan_meeting", variant: "primary" },
            { id: "btn-events", label: "Browse events", action: "find_event", variant: "outline" },
          ] as ActionButton[],
        },
      ],
    };
  }

  if (isConfirm) {
    flow.active = false;
    flow.currentStep = "completed";
    const contact = data.selectedContact!;
    const event = data.selectedEvent!;

    return {
      text: `Invitation sent to ${contact.firstName} ${contact.lastName} (${contact.email}) for ${event.name} on ${event.date}! A calendar invite has been attached.`,
      richContent: [
        {
          type: "action-buttons",
          data: [
            { id: "btn-add-cal", label: "Add to my calendar", action: "schedule_calendar", variant: "primary" },
            { id: "btn-another", label: "Plan another meeting", action: "plan_meeting", variant: "secondary" },
            { id: "btn-done", label: "All done", action: "complete", variant: "outline" },
          ] as ActionButton[],
        },
      ],
    };
  }

  // Ambiguous — ask again
  return {
    text: "Would you like me to send this invitation now?",
    richContent: [
      {
        type: "action-buttons",
        data: [
          { id: "btn-send-yes", label: "Yes, send it", action: "flow_confirm_send", variant: "primary" },
          { id: "btn-cancel", label: "Cancel", action: "flow_cancel", variant: "outline" },
        ] as ActionButton[],
      },
    ],
  };
}
