import { Event, SalesforceContact, SalesforceAccount, Invitation, TicketAllocation } from "@/types";

// ── Mock Events ─────────────────────────────────────────────────────

export const MOCK_EVENTS: Event[] = [
  {
    id: "evt-001",
    name: "Lakers vs. Celtics",
    venue: "Crypto.com Arena",
    date: "2026-03-15",
    time: "7:30 PM PST",
    sport: "NBA",
    category: "Basketball",
    availableTickets: 8,
    totalTickets: 12,
    suiteInfo: "Suite 204 — Premium Club Level",
    location: { city: "Los Angeles", state: "CA" },
  },
  {
    id: "evt-002",
    name: "Yankees vs. Dodgers",
    venue: "Dodger Stadium",
    date: "2026-04-22",
    time: "1:10 PM PST",
    sport: "MLB",
    category: "Baseball",
    availableTickets: 4,
    totalTickets: 6,
    suiteInfo: "Dugout Club — Section A",
    location: { city: "Los Angeles", state: "CA" },
  },
  {
    id: "evt-003",
    name: "Chiefs vs. 49ers",
    venue: "Arrowhead Stadium",
    date: "2026-10-12",
    time: "4:25 PM CT",
    sport: "NFL",
    category: "Football",
    availableTickets: 12,
    totalTickets: 16,
    suiteInfo: "Club Level Suite 450",
    location: { city: "Kansas City", state: "MO" },
  },
  {
    id: "evt-004",
    name: "Taylor Swift — The Eras Tour",
    venue: "SoFi Stadium",
    date: "2026-06-08",
    time: "7:00 PM PST",
    category: "Concert",
    availableTickets: 6,
    totalTickets: 10,
    suiteInfo: "VIP Hospitality Suite",
    location: { city: "Inglewood", state: "CA" },
  },
  {
    id: "evt-005",
    name: "Warriors vs. Nuggets",
    venue: "Chase Center",
    date: "2026-03-22",
    time: "7:00 PM PST",
    sport: "NBA",
    category: "Basketball",
    availableTickets: 2,
    totalTickets: 8,
    location: { city: "San Francisco", state: "CA" },
  },
  {
    id: "evt-006",
    name: "US Open — Men's Final",
    venue: "Arthur Ashe Stadium",
    date: "2026-09-13",
    time: "4:00 PM ET",
    sport: "Tennis",
    category: "Tennis",
    availableTickets: 6,
    totalTickets: 8,
    suiteInfo: "President's Suite",
    location: { city: "New York", state: "NY" },
  },
  {
    id: "evt-007",
    name: "Super Bowl LXI",
    venue: "Levi's Stadium",
    date: "2027-02-14",
    time: "3:30 PM PST",
    sport: "NFL",
    category: "Football",
    availableTickets: 4,
    totalTickets: 8,
    suiteInfo: "Commissioner's Club",
    location: { city: "Santa Clara", state: "CA" },
  },
  {
    id: "evt-008",
    name: "Masters Tournament — Sunday Final Round",
    venue: "Augusta National Golf Club",
    date: "2026-04-12",
    time: "10:00 AM ET",
    sport: "Golf",
    category: "Golf",
    availableTickets: 3,
    totalTickets: 4,
    suiteInfo: "Patron Badge + Hospitality Chalet",
    location: { city: "Augusta", state: "GA" },
  },
];

// ── Mock Salesforce Contacts ────────────────────────────────────────

export const MOCK_CONTACTS: SalesforceContact[] = [
  {
    id: "sf-001",
    firstName: "Sarah",
    lastName: "Chen",
    email: "sarah.chen@techcorp.com",
    phone: "+1 (415) 555-0142",
    company: "TechCorp Inc.",
    title: "VP of Engineering",
    accountId: "acc-001",
    accountName: "TechCorp Inc.",
    lastEventAttended: "Warriors vs. Suns — Jan 2026",
    totalEventsAttended: 7,
    relationshipScore: 92,
  },
  {
    id: "sf-002",
    firstName: "Marcus",
    lastName: "Johnson",
    email: "m.johnson@globalfinance.com",
    phone: "+1 (212) 555-0198",
    company: "Global Finance Group",
    title: "Managing Director",
    accountId: "acc-002",
    accountName: "Global Finance Group",
    lastEventAttended: "Yankees vs. Red Sox — Sept 2025",
    totalEventsAttended: 12,
    relationshipScore: 88,
  },
  {
    id: "sf-003",
    firstName: "Emily",
    lastName: "Rodriguez",
    email: "emily.r@innovatehq.io",
    phone: "+1 (310) 555-0167",
    company: "InnovateHQ",
    title: "Chief Revenue Officer",
    accountId: "acc-003",
    accountName: "InnovateHQ",
    lastEventAttended: "Lakers vs. Warriors — Feb 2026",
    totalEventsAttended: 5,
    relationshipScore: 76,
  },
  {
    id: "sf-004",
    firstName: "David",
    lastName: "Kim",
    email: "david.kim@nexuspartners.com",
    phone: "+1 (650) 555-0134",
    company: "Nexus Partners",
    title: "Senior Partner",
    accountId: "acc-004",
    accountName: "Nexus Partners",
    lastEventAttended: "Super Bowl LX — Feb 2026",
    totalEventsAttended: 15,
    relationshipScore: 95,
  },
  {
    id: "sf-005",
    firstName: "Jessica",
    lastName: "Williams",
    email: "jwilliams@megacorp.com",
    phone: "+1 (312) 555-0189",
    company: "MegaCorp Solutions",
    title: "Director of Partnerships",
    accountId: "acc-005",
    accountName: "MegaCorp Solutions",
    lastEventAttended: null as unknown as string,
    totalEventsAttended: 0,
    relationshipScore: 45,
  },
  {
    id: "sf-006",
    firstName: "Robert",
    lastName: "Patel",
    email: "r.patel@acmeindustries.com",
    phone: "+1 (408) 555-0156",
    company: "Acme Industries",
    title: "CEO",
    accountId: "acc-006",
    accountName: "Acme Industries",
    lastEventAttended: "Masters Tournament — Apr 2025",
    totalEventsAttended: 9,
    relationshipScore: 81,
  },
];

// ── Mock Accounts ───────────────────────────────────────────────────

export const MOCK_ACCOUNTS: SalesforceAccount[] = [
  {
    id: "acc-001",
    name: "TechCorp Inc.",
    industry: "Technology",
    annualRevenue: 450_000_000,
    contacts: [MOCK_CONTACTS[0]],
    ticketHistory: [],
  },
  {
    id: "acc-002",
    name: "Global Finance Group",
    industry: "Financial Services",
    annualRevenue: 1_200_000_000,
    contacts: [MOCK_CONTACTS[1]],
    ticketHistory: [],
  },
  {
    id: "acc-003",
    name: "InnovateHQ",
    industry: "SaaS",
    annualRevenue: 85_000_000,
    contacts: [MOCK_CONTACTS[2]],
    ticketHistory: [],
  },
];

// ── Mock Allocations ────────────────────────────────────────────────

export const MOCK_ALLOCATIONS: TicketAllocation[] = [
  {
    id: "alloc-001",
    eventId: "evt-001",
    event: MOCK_EVENTS[0],
    assignedTo: MOCK_CONTACTS[0],
    quantity: 2,
    status: "confirmed",
    transferMethod: "mobile",
    assignedAt: new Date("2026-02-10"),
  },
  {
    id: "alloc-002",
    eventId: "evt-003",
    event: MOCK_EVENTS[2],
    assignedTo: MOCK_CONTACTS[1],
    quantity: 4,
    status: "pending",
    transferMethod: "email",
    assignedAt: new Date("2026-02-12"),
  },
];

// ── Search Helpers ──────────────────────────────────────────────────

export function searchEvents(query: string): Event[] {
  const q = query.toLowerCase();
  return MOCK_EVENTS.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.sport?.toLowerCase().includes(q) ||
      e.location.city.toLowerCase().includes(q) ||
      e.location.state.toLowerCase().includes(q)
  );
}

export function searchContacts(query: string): SalesforceContact[] {
  const q = query.toLowerCase();
  return MOCK_CONTACTS.filter(
    (c) =>
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.title && c.title.toLowerCase().includes(q))
  );
}

export function getEventById(id: string): Event | undefined {
  return MOCK_EVENTS.find((e) => e.id === id);
}

export function getContactById(id: string): SalesforceContact | undefined {
  return MOCK_CONTACTS.find((c) => c.id === id);
}
