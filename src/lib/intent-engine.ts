import { DetectedIntent, IntentType, IntentEntity } from "@/types";

interface IntentPattern {
  type: IntentType;
  patterns: RegExp[];
  entityExtractors?: EntityExtractor[];
}

interface EntityExtractor {
  type: string;
  pattern: RegExp;
}

const INTENT_PATTERNS: IntentPattern[] = [
  {
    type: "plan_meeting",
    patterns: [
      /(?:meeting|meet)\s+(?:with\s+)?(?:my\s+)?(?:\w+\s+)?(?:client|contact|customer).*(?:find|help|suggest|show|what|any|game|event|concert)/i,
      /(?:plan|organize|set up|arrange)\s+(?:a\s+)?(?:client\s+)?meeting/i,
      /(?:find|show|suggest)\s+(?:events?|games?|shows?)\s+.*(?:meeting|client|customer)/i,
      /(?:take|bring|host)\s+(?:my\s+)?(?:client|contact).*(?:to\s+(?:a|an|the)\s+)?(?:game|event|show|concert)/i,
      /(?:client\s+entertainment|entertain\s+(?:a\s+)?client).*(?:event|game|show|next|this|upcoming)/i,
      /(?:like to|want to|need to)\s+plan\s+(?:a\s+)?(?:client\s+)?meeting/i,
    ],
    entityExtractors: [
      { type: "company", pattern: /(?:my\s+)?(\w+)\s+client/i },
      { type: "company", pattern: /(?:client|contact)\s+(?:from|at|with)\s+(\w+)/i },
      { type: "date", pattern: /\b(today|tomorrow|this week|next week|this month|next month|this weekend)\b/i },
      { type: "city", pattern: /\bin\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/ },
    ],
  },
  {
    type: "find_event",
    patterns: [
      /(?:find|search|look for|show me|what|any|upcoming)\s+(?:events?|games?|shows?|concerts?|matches?)/i,
      /(?:what's|whats|what is)\s+(?:happening|coming up|available)/i,
      /(?:lakers|yankees|cowboys|warriors|chiefs|dodgers|giants|eagles|celtics|49ers|knicks|nets|mets|bulls|bears|rams|chargers|padres|angels|clippers|kings|ducks|sharks|rangers|bruins|heat|thunder|nuggets|bucks|suns|hawks|cavaliers|pacers|pistons|wizards|magic|hornets|raptors|timberwolves|pelicans|spurs|grizzlies|trail blazers|jazz|rockets)\s*(?:game|ticket|event)?s?/i,
      /(?:nfl|nba|mlb|nhl|mls|ncaa)\s+(?:games?|events?|tickets?)/i,
      /(?:this|next)\s+(?:week|month|weekend)/i,
    ],
    entityExtractors: [
      { type: "sport", pattern: /\b(nfl|nba|mlb|nhl|mls|ncaa|football|basketball|baseball|hockey|soccer)\b/i },
      { type: "team", pattern: /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/ },
      { type: "date", pattern: /\b(today|tomorrow|this week|next week|this month|next month|this weekend)\b/i },
      { type: "city", pattern: /\bin\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/ },
    ],
  },
  {
    type: "invite_client",
    patterns: [
      /(?:invite|send invitation|bring)\s+(?:a client|client|customer|guest|contact|them|him|her)/i,
      /(?:want to|need to|let's|can we)\s+(?:invite|bring|take)\s/i,
      /(?:invitation|invite)\s+(?:to|for)/i,
      /(?:host|entertain|take out)\s+(?:a client|client|customer)/i,
    ],
    entityExtractors: [
      { type: "contactName", pattern: /(?:invite|bring|take)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/ },
      { type: "company", pattern: /(?:from|at|with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/ },
    ],
  },
  {
    type: "allocate_tickets",
    patterns: [
      /(?:allocate|assign|give|reserve|hold|set aside)\s+(?:\d+\s+)?tickets?/i,
      /(?:tickets?\s+(?:for|to))/i,
      /(?:need|want|get)\s+\d+\s+(?:tickets?|seats?)/i,
      /(?:book|reserve)\s+(?:a |the )?(?:suite|box|seats?)/i,
    ],
    entityExtractors: [
      { type: "quantity", pattern: /(\d+)\s+(?:tickets?|seats?)/ },
      { type: "recipient", pattern: /(?:for|to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/ },
    ],
  },
  {
    type: "check_availability",
    patterns: [
      /(?:how many|any)\s+(?:tickets?|seats?)\s+(?:available|left|remaining|open)/i,
      /(?:availability|what's available|check if)/i,
      /(?:do we have|are there)\s+(?:any |enough )?(?:tickets?|seats?)/i,
    ],
  },
  {
    type: "lookup_contact",
    patterns: [
      /(?:find|search|look up|lookup|who is|pull up|show me)\s+(?:contact|client|customer|person)/i,
      /(?:salesforce|crm)\s+(?:contact|record|account)/i,
      /(?:find|search|look up)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:in salesforce|in crm|contact)/i,
      /(?:who|which)\s+(?:clients?|contacts?|customers?)\s+(?:from|at|with)/i,
    ],
    entityExtractors: [
      { type: "contactName", pattern: /(?:find|look up|search for|pull up)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/ },
      { type: "company", pattern: /(?:from|at|with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/ },
    ],
  },
  {
    type: "send_invitation",
    patterns: [
      /(?:send|deliver|dispatch|fire off)\s+(?:the |that |this )?(?:invitation|invite|email)/i,
      /(?:go ahead|please|yes)\s+(?:send|deliver)/i,
      /(?:send it|looks good|approve|confirm)\s*(?:send|it)?/i,
    ],
  },
  {
    type: "schedule_calendar",
    patterns: [
      /(?:add|put|schedule|create|block)\s+(?:on |to |in )?(?:my |the )?(?:calendar|schedule|outlook|google cal)/i,
      /(?:calendar|schedule)\s+(?:invite|event|block|reminder)/i,
      /(?:block|save)\s+(?:the |this )?(?:date|time)/i,
    ],
  },
  {
    type: "view_rsvp_status",
    patterns: [
      /(?:rsvp|response|who's coming|who accepted|who declined|attendance|guest list)/i,
      /(?:check|view|show)\s+(?:rsvp|responses?|attendance)/i,
      /(?:did|has)\s+\w+\s+(?:respond|accept|rsvp|reply)/i,
    ],
  },
  {
    type: "sell_unused_tickets",
    patterns: [
      /(?:sell|list|offload|get rid of)\s+(?:unused|extra|remaining|surplus)\s+(?:tickets?|seats?)/i,
      /(?:unused|extra)\s+(?:tickets?|seats?)/i,
      /(?:don't need|won't use|leftover)\s+(?:tickets?|seats?)/i,
    ],
  },
  {
    type: "report_roi",
    patterns: [
      /(?:roi|return on investment|analytics|report|metrics|impact)/i,
      /(?:show|generate|pull|view)\s+(?:a |the )?(?:report|analytics|metrics|roi)/i,
      /(?:how|what)\s+(?:effective|successful|well|much)\s+(?:are|were|was)/i,
      /(?:compliance|tax|deduction)/i,
    ],
  },
];

function extractEntities(
  text: string,
  extractors?: EntityExtractor[]
): IntentEntity[] {
  if (!extractors) return [];

  const entities: IntentEntity[] = [];
  for (const extractor of extractors) {
    const match = text.match(extractor.pattern);
    if (match && match[1]) {
      entities.push({
        type: extractor.type,
        value: match[1].trim(),
        raw: match[0],
      });
    }
  }
  return entities;
}

export function detectIntent(userMessage: string): DetectedIntent {
  let bestMatch: DetectedIntent = {
    type: "general_question",
    confidence: 0.3,
    entities: [],
  };

  for (const intentPattern of INTENT_PATTERNS) {
    for (const pattern of intentPattern.patterns) {
      if (pattern.test(userMessage)) {
        const entities = extractEntities(
          userMessage,
          intentPattern.entityExtractors
        );
        const confidence = 0.7 + entities.length * 0.1;

        if (confidence > bestMatch.confidence) {
          bestMatch = {
            type: intentPattern.type,
            confidence: Math.min(confidence, 0.99),
            entities,
          };
        }
      }
    }
  }

  return bestMatch;
}

export function getIntentDescription(type: IntentType): string {
  const descriptions: Record<IntentType, string> = {
    find_event: "Finding events and games",
    invite_client: "Inviting a client to an event",
    allocate_tickets: "Allocating tickets",
    check_availability: "Checking ticket availability",
    lookup_contact: "Looking up a contact",
    send_invitation: "Sending an invitation",
    schedule_calendar: "Adding to calendar",
    view_rsvp_status: "Checking RSVP status",
    sell_unused_tickets: "Managing unused tickets",
    report_roi: "Viewing reports and ROI",
    plan_meeting: "Planning a client meeting",
    general_question: "General question",
    unknown: "Processing request",
  };
  return descriptions[type];
}
