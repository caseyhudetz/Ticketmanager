// ── Chat & Conversation ─────────────────────────────────────────────

export type MessageRole = "user" | "assistant" | "system";

export type MessageContentType =
  | "text"
  | "event-card"
  | "contact-card"
  | "invitation-preview"
  | "ticket-allocation"
  | "calendar-event"
  | "action-buttons"
  | "loading";

export interface MessageContent {
  type: MessageContentType;
  data: unknown;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  richContent?: MessageContent[];
  timestamp: Date;
  intent?: DetectedIntent;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// ── Intent Detection ────────────────────────────────────────────────

export type IntentType =
  | "find_event"
  | "invite_client"
  | "allocate_tickets"
  | "check_availability"
  | "lookup_contact"
  | "send_invitation"
  | "schedule_calendar"
  | "view_rsvp_status"
  | "sell_unused_tickets"
  | "report_roi"
  | "plan_meeting"
  | "general_question"
  | "unknown";

export interface DetectedIntent {
  type: IntentType;
  confidence: number;
  entities: IntentEntity[];
}

export interface IntentEntity {
  type: string;
  value: string;
  raw: string;
}

// ── Events & Tickets ────────────────────────────────────────────────

export interface Event {
  id: string;
  name: string;
  venue: string;
  date: string;
  time: string;
  sport?: string;
  category: string;
  imageUrl?: string;
  availableTickets: number;
  totalTickets: number;
  suiteInfo?: string;
  location: {
    city: string;
    state: string;
  };
}

export interface TicketAllocation {
  id: string;
  eventId: string;
  event: Event;
  assignedTo: SalesforceContact;
  quantity: number;
  status: "pending" | "confirmed" | "transferred" | "checked_in";
  transferMethod: "mobile" | "email" | "will_call";
  assignedAt: Date;
}

// ── Salesforce ──────────────────────────────────────────────────────

export interface SalesforceContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company: string;
  title?: string;
  accountId?: string;
  accountName?: string;
  lastEventAttended?: string;
  totalEventsAttended?: number;
  relationshipScore?: number;
  avatarUrl?: string;
}

export interface SalesforceAccount {
  id: string;
  name: string;
  industry?: string;
  annualRevenue?: number;
  contacts: SalesforceContact[];
  ticketHistory: TicketAllocation[];
}

// ── Invitations ─────────────────────────────────────────────────────

export interface Invitation {
  id: string;
  event: Event;
  recipients: SalesforceContact[];
  message: string;
  subject: string;
  status: "draft" | "sent" | "delivered" | "opened" | "rsvp_yes" | "rsvp_no";
  sentAt?: Date;
  template: InvitationTemplate;
  calendarAttachment: boolean;
}

export interface InvitationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  style: "formal" | "casual" | "premium";
}

// ── Calendar ────────────────────────────────────────────────────────

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
  attendees: string[];
  provider: "google" | "outlook" | "ical";
  eventId?: string;
}

// ── API Responses ───────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ── Meeting Planner Flow ───────────────────────────────────────────

export type MeetingFlowStep =
  | "client_identification"
  | "location"
  | "event_discovery"
  | "event_selection"
  | "invitation_preview"
  | "send_confirmation"
  | "completed";

export interface MeetingFlowData {
  selectedContact?: SalesforceContact;
  candidateContacts?: SalesforceContact[];
  companyName?: string;
  location?: string;
  timeframe?: {
    label: string;
    start: Date;
    end: Date;
  };
  matchedEvents?: Event[];
  selectedEvent?: Event;
  invitation?: Invitation;
}

export interface MeetingFlowState {
  currentStep: MeetingFlowStep;
  data: MeetingFlowData;
  active: boolean;
}

// ── Chat Action Buttons ─────────────────────────────────────────────

export interface ActionButton {
  id: string;
  label: string;
  action: string;
  variant: "primary" | "secondary" | "outline";
  data?: Record<string, unknown>;
}
