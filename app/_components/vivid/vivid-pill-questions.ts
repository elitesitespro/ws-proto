// What the ask pill (vivid-pill.tsx) suggests asking, for the part of the
// page in the middle of the screen: the label after "Ask Vivid ·" and the
// questions its placeholder rolls through. Plain questions Vivid can honestly
// answer: free, it explains WorldStreet, every platform, markets and terms,
// and shows where things are (never what to buy or sell); with Pro it also
// has live prices, your portfolio, watches that alert you, sending money once
// you say yes, and voice. It never trades, and never goes anywhere for you.

export type Ask = { label: string; qs: readonly string[] };
/** An Ask with the key it's known by (a section id, or "discover:<hue>" for a platform on the dial). */
export type KeyedAsk = Ask & { key: string };

/** Above the first section: the night globe at the top of the page. */
export const HERO = "hero";

/** The parts of the page that change the questions, in page order, by their ids ("footer" is the site footer).
 *  A later one sits inside or over an earlier one (a district in the street, the wallet over it), so it wins. */
export const SECTION_ORDER = [
  "discover",
  "street",
  "connect",
  "entertainment",
  "lifestyle",
  "markets",
  "wallet",
  "vivid",
  "join",
  "footer",
] as const;

/** A district sits inside the street: in the gap between two, the one you were on keeps its questions. */
export const INSIDE: Record<string, string> = {
  connect: "street",
  entertainment: "street",
  lifestyle: "street",
  markets: "street",
};

const SECTION_ASK: Record<string, Ask> = {
  [HERO]: {
    label: "WorldStreet",
    qs: [
      "What is WorldStreet?",
      "What can I do with one account?",
      "Which platform should I start with?",
      "What can Vivid do for me?",
    ],
  },
  discover: {
    label: "Thirteen platforms",
    qs: ["Which platform is for me?", "What’s the difference between Xtream and Vision?", "Where should I start?"],
  },
  street: {
    label: "The street",
    qs: [
      "Which part of WorldStreet is for me?",
      "What’s on each street?",
      "Do I need a separate account for each platform?",
    ],
  },
  connect: {
    label: "Connect",
    qs: [
      "What’s the difference between WorldSpace and WorldMeet?",
      "Can I call family abroad?",
      "How do voice rooms work?",
    ],
  },
  entertainment: {
    label: "Entertainment",
    qs: [
      "How do live battles work on Xtream?",
      "What’s a watch party on Vision?",
      "Can I make a film with AI Movie?",
      "How do the weekly ranks work in Arcade?",
    ],
  },
  lifestyle: {
    label: "Lifestyle",
    qs: [
      "How does WorldStore hold my payment?",
      "How do I find someone on Worldwork?",
      "Which Mastery Academy course suits me?",
      "How do I see a doctor on WorldHealth?",
    ],
  },
  markets: {
    label: "Markets",
    qs: [
      "What’s the difference between forex and crypto?",
      "What does the chance on a prediction mean?",
      "Who can use Markets?",
      "What’s Bitcoin’s price right now?",
    ],
  },
  wallet: {
    label: "Wallet",
    qs: ["How do I add money?", "Which currencies can I hold?", "How do I send money to a friend?"],
  },
  vivid: {
    label: "Vivid",
    qs: [
      "What can you do for me?",
      "What’s free, and what comes with Pro?",
      "Can you tell me when a price moves?",
      "Can I talk to you out loud?",
    ],
  },
  join: {
    label: "Join",
    qs: ["How do I open an account?", "Is it free to join?", "What do I need to sign up?"],
  },
  footer: {
    label: "WorldStreet",
    qs: ["Is my money safe here?", "How do I contact support?", "Where can I read the terms?"],
  },
};

/** The platform showing on the dial, by the hue its section wears (data-hue on #discover, from hueAttrs). */
const DIAL_ASK: Record<string, Ask> = {
  social: {
    label: "WorldSpace",
    qs: ["What is WorldSpace?", "How do community rooms work?", "Can I find people who like what I like?"],
  },
  meet: {
    label: "WorldMeet",
    qs: ["How do I start a call on WorldMeet?", "Can people join with just a link?", "Do the captions translate?"],
  },
  xtreme: {
    label: "Xtream",
    qs: ["How do live battles work?", "How do creators get paid on Xtream?", "Can I just watch?"],
  },
  vision: {
    label: "Vision",
    qs: ["What can I watch on Vision?", "How does a watch party work?", "Can I watch with friends far away?"],
  },
  studio: {
    label: "AI Movie",
    qs: ["Can I make a film with AI?", "How do I direct an AI cast?", "What does the writing desk do?"],
  },
  arcade: {
    label: "Arcade",
    qs: ["What games are in Arcade?", "How do the weekly ranks work?", "Who do I play against?"],
  },
  shop: {
    label: "WorldStore",
    qs: ["How does WorldStore keep my money safe?", "How do I sell on WorldStore?", "When does a seller get paid?"],
  },
  work: {
    label: "Worldwork",
    qs: ["What is Worldwork?", "How do I find someone near me for a job?", "How do I offer my trade?"],
  },
  academy: {
    label: "Mastery Academy",
    qs: ["Which course should I start with?", "What are the eight schools?", "Do I need experience to start?"],
  },
  health: {
    label: "WorldHealth",
    qs: ["How do I see a doctor online?", "How do I pay for a visit?", "Is WorldHealth for emergencies?"],
  },
  forex: {
    label: "Forex",
    qs: ["What is forex, in plain words?", "What’s a pip?", "When is the forex market open?"],
  },
  crypto: {
    label: "Crypto",
    qs: ["What is USDT?", "What’s the difference between spot and perps?", "How do I buy my first crypto?"],
  },
  prediction: {
    label: "Prediction",
    qs: ["How do predictions work?", "What does an outcome’s chance mean?", "Who can use Prediction?"],
  },
};

/** The questions for a part of the page; on the dial, for the platform showing if it's one we know. */
export function askFor(section: string, dialHue: string | null): KeyedAsk {
  const platform = section === "discover" && dialHue ? DIAL_ASK[dialHue] : undefined;
  if (platform) return { key: `discover:${dialHue}`, ...platform };
  const ask = SECTION_ASK[section];
  return ask ? { key: section, ...ask } : { key: HERO, ...SECTION_ASK[HERO] };
}
