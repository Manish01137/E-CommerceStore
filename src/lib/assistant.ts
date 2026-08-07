/**
 * Rule-based FAQ engine for the "Ethereal Assistant" chat widget.
 *
 * This is intentionally not a real AI — it's keyword matching over a fixed
 * set of topics grounded in real store facts (shipping, payments, policies).
 * `resolveUserMessage` is the one seam to swap out later if a real LLM API
 * key gets wired in — everything else (the widget UI) just calls it.
 */

export interface LinkAction {
  label: string;
  href: string;
}

export interface AssistantReply {
  text: string;
  links?: LinkAction[];
  chips?: string[];
}

interface Topic {
  id: string;
  chipLabel: string;
  showAsChip: boolean;
  keywords: string[];
  reply: () => AssistantReply | Promise<AssistantReply>;
}

export const WHATSAPP_LINK: LinkAction = {
  label: "Chat on WhatsApp",
  href: "https://wa.me/919831301409",
};

export const EMAIL_LINK: LinkAction = {
  label: "Email us",
  href: "mailto:hello@etherealartisan.in",
};

const MAIN_CHIPS = [
  "shipping",
  "payment",
  "tracking",
  "returns",
  "ingredients",
  "wholesale",
  "contact",
];

let shippingCache: { shippingFee: number; freeShippingAbove: number | null } | null = null;

async function fetchShippingSettings() {
  if (shippingCache) return shippingCache;
  try {
    const res = await fetch("/api/settings");
    if (!res.ok) throw new Error("bad response");
    const data = await res.json();
    shippingCache = { shippingFee: data.shippingFee, freeShippingAbove: data.freeShippingAbove };
  } catch {
    shippingCache = { shippingFee: 79, freeShippingAbove: 999 };
  }
  return shippingCache;
}

const TOPICS: Topic[] = [
  {
    id: "greeting",
    chipLabel: "Say hi",
    showAsChip: false,
    keywords: ["hi", "hello", "hey", "namaste", "good morning", "good afternoon", "good evening"],
    reply: () => ({
      text: "Hi, I'm the Ethereal Assistant 🌿 Ask me about shipping, orders, ingredients or wholesale — or tap a topic below.",
      chips: MAIN_CHIPS,
    }),
  },
  {
    id: "shipping",
    chipLabel: "Shipping & delivery",
    showAsChip: true,
    keywords: [
      "ship", "shipping", "deliver", "delivery", "dispatch", "courier",
      "when will i get", "how long does delivery take", "when will it arrive", "shiprocket",
    ],
    reply: async () => {
      const { shippingFee, freeShippingAbove } = await fetchShippingSettings();
      const free = freeShippingAbove != null
        ? `, and it's free on orders over ₹${freeShippingAbove}`
        : "";
      return {
        text: `Delivery is a flat ₹${shippingFee}${free}. Once your order ships you'll get a tracking link, and you can check live status anytime under My Orders.`,
        links: [{ label: "My Orders", href: "/account" }],
        chips: ["tracking", "payment"],
      };
    },
  },
  {
    id: "payment",
    chipLabel: "Payment options",
    showAsChip: true,
    keywords: [
      "pay", "payment", "upi", "card", "netbanking", "net banking", "razorpay",
      "cod", "cash on delivery", "cash",
    ],
    reply: () => ({
      text: "We accept UPI, cards and net-banking, all secured through Razorpay. We don't currently offer cash on delivery.",
      chips: ["shipping", "returns"],
    }),
  },
  {
    id: "returns",
    chipLabel: "Returns & refunds",
    showAsChip: true,
    keywords: [
      "return", "refund", "exchange", "cancel", "cancellation", "damaged",
      "wrong item", "replace", "broken",
    ],
    reply: () => ({
      text: "We don't have a fixed online returns policy yet — if something's wrong with your order, message us directly and we'll sort it out personally.",
      links: [WHATSAPP_LINK, EMAIL_LINK],
      chips: ["contact"],
    }),
  },
  {
    id: "tracking",
    chipLabel: "Track my order",
    showAsChip: true,
    keywords: [
      "track", "tracking", "order status", "where is my order", "awb",
      "shipped yet", "my order",
    ],
    reply: () => ({
      text: "You can track any order under My Orders in your account — once it ships you'll see the courier and a live tracking link there.",
      links: [{ label: "My Orders", href: "/account" }],
      chips: ["shipping"],
    }),
  },
  {
    id: "ingredients",
    chipLabel: "Ingredients",
    showAsChip: true,
    keywords: [
      "ingredient", "ingredients", "sls", "sles", "paraben", "parabens",
      "silicone", "silicones", "natural", "organic", "chemical",
      "sensitive skin", "allergy", "safe", "cruelty",
    ],
    reply: () => ({
      text: "Every product is SLS, SLES, paraben and silicone free — cold-pressed oils, hand-poured in small batches and cured for about 4 weeks before it's labelled. Full ingredient lists are on each product page.",
      links: [{ label: "Browse Products", href: "/products" }],
      chips: ["products"],
    }),
  },
  {
    id: "products",
    chipLabel: "Our products",
    showAsChip: false,
    keywords: [
      "product", "products", "soap", "lotion", "face wash", "face pack",
      "shampoo", "conditioner", "bath salt", "travel kit", "catalogue",
      "what do you sell", "categories",
    ],
    reply: () => ({
      text: "We make soaps, body wash, body lotion, body scrub, face wash, face cream, face pack, shampoo, conditioner, bath salts and travel kits — about 11 product lines in all.",
      links: [{ label: "Shop All Products", href: "/products" }],
      chips: ["ingredients", "wholesale"],
    }),
  },
  {
    id: "wholesale",
    chipLabel: "Wholesale enquiries",
    showAsChip: true,
    keywords: [
      "wholesale", "bulk", "business", "hotel", "boutique", "private label",
      "b2b", "reseller", "distributor", "corporate gift",
    ],
    reply: () => ({
      text: "For hotels, boutiques and bulk or private-label orders, share your volume on our Wholesale page and we'll reply personally within two working days with pricing and samples.",
      links: [{ label: "Wholesale & Business", href: "/business" }],
      chips: ["contact"],
    }),
  },
  {
    id: "contact",
    chipLabel: "Talk to us",
    showAsChip: true,
    keywords: [
      "contact", "phone", "number", "email", "whatsapp", "human", "support",
      "talk to someone", "help", "reach you",
    ],
    reply: () => ({
      text: "Happy to help directly:",
      links: [WHATSAPP_LINK, EMAIL_LINK],
    }),
  },
];

const TOPIC_BY_ID = new Map(TOPICS.map((t) => [t.id, t]));

export function getChipLabel(id: string): string {
  return TOPIC_BY_ID.get(id)?.chipLabel ?? id;
}

export function getWelcomeMessage(): AssistantReply {
  return TOPIC_BY_ID.get("greeting")!.reply() as AssistantReply;
}

export async function getReplyForChip(id: string): Promise<AssistantReply> {
  const topic = TOPIC_BY_ID.get(id);
  if (!topic) return fallbackReply();
  return topic.reply();
}

function normalize(input: string): string {
  return input.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ");
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Whole-word/phrase match so short keywords like "ship" don't fire inside "ships". */
function containsKeyword(normalized: string, keyword: string): boolean {
  return new RegExp(`\\b${escapeRegExp(keyword)}\\b`).test(normalized);
}

function fallbackReply(): AssistantReply {
  return {
    text: "I'm not totally sure about that one — but our team's happy to help directly.",
    links: [WHATSAPP_LINK, EMAIL_LINK],
  };
}

export async function resolveUserMessage(input: string): Promise<AssistantReply> {
  const normalized = normalize(input);
  let best: { topic: Topic; score: number } | null = null;

  for (const topic of TOPICS) {
    if (topic.id === "greeting") continue;
    let score = 0;
    for (const keyword of topic.keywords) {
      if (containsKeyword(normalized, keyword)) score += keyword.split(" ").length;
    }
    if (score > 0 && (!best || score > best.score)) best = { topic, score };
  }

  if (!best) {
    // Greeting only matches if nothing more specific did.
    const greeting = TOPIC_BY_ID.get("greeting")!;
    const isGreeting = greeting.keywords.some((kw) => containsKeyword(normalized, kw));
    if (isGreeting) return greeting.reply();
    return fallbackReply();
  }

  return best.topic.reply();
}
