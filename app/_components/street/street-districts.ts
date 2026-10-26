import type { ShowcasePlatformName } from "../platform-showcase-content";

/**
 * What a district's billboard art is given: the exit you're looking at (its
 * platform), if any, and whether the car has reached the district yet.
 */
export type ArtProps = { focus: ShowcasePlatformName | null; lit: boolean };

export type Exit = {
  name: ShowcasePlatformName;
  /** Its name in the product (the internal keys stay as the wheel has them). */
  label: string;
  /** A few words on its sign. */
  hook: string;
  /** Its own line, up on the billboard while you look at its exit. */
  line: string;
  /** Its teaser art is light (paper), so the billboard's type turns ink. */
  light?: boolean;
};

export type District = {
  id: "connect" | "entertainment" | "lifestyle" | "markets";
  /** The street's name, on its sign: the category, so the drive teaches the menu. */
  street: string;
  /** The category's colour in app/hues.css. */
  hue: string;
  /** Why it's worth the stop. */
  reason: string;
  line: string;
  /** Things true of the district's platforms that make the case (and, for money, who it's for). */
  facts: readonly string[];
  exits: readonly Exit[];
};

// The street after the platform tour: the tour shows each platform; the
// street says what each part of WorldStreet is for, and every platform is an
// exit off it. Lines are the platforms' own, as their tour panels have them.
export const DISTRICTS: readonly District[] = [
  {
    id: "connect",
    street: "Connect Ave",
    hue: "community",
    reason: "Nobody’s far away.",
    line: "Your people, your communities and your calls, wherever in the world they are.",
    facts: ["Calls with live translated captions", "Communities with live voice rooms"],
    exits: [
      { name: "WorldSpace", label: "WorldSpace", hook: "Find your people", line: "Find your people. Share your world." },
      { name: "WorldMeet", label: "WorldMeet", hook: "One link for every call", line: "Family in London. Team in Lagos. One link.", light: true },
    ],
  },
  {
    id: "entertainment",
    street: "Entertainment Blvd",
    hue: "watch",
    reason: "Something good is always on.",
    line: "Live shows to back, our films to watch together, a film of your own to make and a game to finish on.",
    facts: ["Watch parties, in sync on every screen", "Backing goes straight to the creator"],
    exits: [
      { name: "XStream", label: "Xtream", hook: "Live battles you can back", line: "Go live. Get backed. Get paid." },
      { name: "Vsion", label: "Vision", hook: "Our films, watched together", line: "Our films. Our shows. Watched together." },
      { name: "AI Movie", label: "AI Movie", hook: "Direct your first film", line: "One studio for every film you want to make." },
      { name: "Arcade", label: "Arcade", hook: "Play for the streak", line: "Play for the streak. Stay for the rank." },
    ],
  },
  {
    id: "lifestyle",
    street: "Lifestyle St",
    hue: "shop",
    reason: "Life, handled.",
    line: "Buy and sell safely, find someone nearby for the job, learn a skill and see a doctor.",
    facts: ["Payment held until your order arrives", "Doctors by video, wherever you are"],
    exits: [
      { name: "WorldStore", label: "WorldStore", hook: "Buy and sell, safely", line: "Buy it. Sell it. Safely." },
      { name: "WorkWorld", label: "Worldwork", hook: "Trades near you", line: "Find someone who does the thing you need." },
      { name: "Academy", label: "Mastery Academy", hook: "Eight schools, one path", line: "Learn skills. Build value. Own your future." },
      { name: "WorldHealth", label: "WorldHealth", hook: "See a doctor, anywhere", line: "See a doctor, anywhere." },
    ],
  },
  {
    id: "markets",
    street: "Markets Row",
    hue: "trade",
    reason: "Put your money to work.",
    line: "Trade currencies and crypto, or call what happens next.",
    facts: ["Crypto markets open around the clock", "Every outcome shows its chance", "For eligible users, 18 and over"],
    exits: [
      { name: "Forex", label: "Forex", hook: "The pairs that move the world", line: "Trade the pairs that move the world.", light: true },
      { name: "Crypto", label: "Crypto", hook: "Spot and perps, round the clock", line: "Own the coins, not just the chart." },
      { name: "Prediction", label: "Prediction", hook: "Call it before it happens", line: "Call it before it happens.", light: true },
    ],
  },
];
