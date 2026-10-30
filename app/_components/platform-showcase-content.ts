// Adapted from worldstreetgold.com. Keep previews illustrative and avoid
// unverified limits, delivery promises or claims about product availability.
import type { CSSProperties } from "react";

export type PlatformPreviewKind =
  | "social" | "call" | "meeting" | "live" | "film" | "studio" | "arcade"
  | "store" | "work" | "academy" | "health" | "travel" | "forex" | "crypto" | "sports" | "prediction";

type PlatformDetail = {
  headline: string;
  description: string;
  features: readonly string[];
  action: string;
  /** Its front door; none yet for a platform that's coming soon. */
  href: string | null;
  preview: PlatformPreviewKind;
};

export const platformDetails = {
  WorldSpace: {
    headline: "Find your people.",
    description: "Share a thought, join a conversation and keep up with your community.",
    features: ["Posts", "Messages", "Community rooms"],
    action: "Explore WorldSpace", href: "https://social.worldstreetgold.com/", preview: "social",
  },
  WorldMeet: {
    headline: "Everyone you need, on one call.",
    description: "Call one person or bring everyone in, by voice or video, with one link.",
    features: ["Voice and video calls", "Invite by link", "Live captions"],
    action: "Open WorldMeet", href: "https://meet.worldstreetgold.com/", preview: "meeting",
  },
  XStream: {
    headline: "Go live. Get backed. Get paid.",
    description: "Go live, back the creators you love in live battles, and send gifts that count.",
    features: ["Live streams", "Live battles", "Gifts"],
    action: "Watch live on Xtream", href: "https://xtream.worldstreetgold.com/", preview: "live",
  },
  Vsion: {
    headline: "Our films. Our shows. Watched together.",
    description: "WorldStreet originals on demand. Start a watch party and every screen plays in sync.",
    features: ["Originals", "Films and shows", "Watch parties"],
    action: "Open Vision", href: "https://vision.worldstreetgold.com/", preview: "film",
  },
  "AI Movie": {
    headline: "One studio for every film you want to make.",
    description: "Direct a cast of AI characters while the writing desk handles the script, logline, trailer and captions.",
    features: ["AI cast", "Scripts and loglines", "Trailers and captions"],
    action: "Start a film", href: "https://movie.worldstreetgold.com/", preview: "studio",
  },
  Arcade: {
    headline: "Play for the streak. Stay for the rank.",
    description: "Take on members or the Street Bot, clear the day's challenges and climb the weekly ranks.",
    features: ["Trivia duels", "Daily challenges", "Weekly ranks"],
    action: "Explore Arcade", href: "https://arcade.worldstreetgold.com/", preview: "arcade",
  },
  WorldStore: {
    headline: "Buy it. Sell it. Safely.",
    description: "Buy and sell near you. Pay through WorldStore and your money is held until you get what you ordered.",
    features: ["Sellers near you", "Offers in chat", "Escrow on goods"],
    action: "Shop WorldStore", href: "https://shop.worldstreetgold.com/", preview: "store",
  },
  WorkWorld: {
    headline: "Find someone who does the thing you need.",
    description: "A directory of providers, wherever you are. See who's closest, then call them yourself.",
    features: ["Over 100 trades", "Closest first", "Call them directly"],
    action: "Find a provider", href: "https://work.worldstreetgold.com/", preview: "work",
  },
  Academy: {
    headline: "Learn skills. Build value. Own your future.",
    description: "Eight schools of practical, expert-led programmes, from trading to AI. Learn the skill before you put it to work.",
    features: ["Eight schools", "Expert instructors", "Certificates"],
    action: "Start learning", href: "https://academy.worldstreetgold.com/", preview: "academy",
  },
  WorldHealth: {
    headline: "See a doctor, anywhere.",
    description: "Book a consultation with a reviewed, independent doctor and meet by video, audio or text. Not for emergencies.",
    features: ["Video, audio or text", "Reviewed consultants", "Their own rates and hours"],
    action: "Find a doctor", href: "https://health.worldstreetgold.com/", preview: "health",
  },
  "E-Embassy": {
    headline: "The world is closer than you think.",
    description: "Tell us where you're going. One consultant sorts out the passport, the visa, the flights and the hotel, and tells you what's happening as it happens.",
    features: ["Passports", "Visas", "Flights and stays"],
    action: "Start a trip", href: "https://embassy.worldstreetgold.com/", preview: "travel",
  },
  Forex: {
    headline: "Trade the pairs that move the world.",
    description: "Majors, minors and crosses through the Tokyo, London and New York sessions. Set take-profit and stop-loss before you enter. Trading carries risk.",
    features: ["Currency pairs", "Spot and futures", "Take-profit and stop-loss"],
    action: "Open a forex account", href: "https://portal.worldstreetgold.com/", preview: "forex",
  },
  Crypto: {
    headline: "Own the coins, not just the chart.",
    description: "Buy, sell and manage Bitcoin, Ethereum, Solana, XRP and more, spot or perpetual futures. Prices shown are illustrative.",
    features: ["Spot trading", "Perpetual futures", "Live portfolio"],
    action: "Start trading crypto", href: "https://dashboard.worldstreetgold.com/", preview: "crypto",
  },
  WorldSports: {
    headline: "Own sport like stock.",
    description: "Buy shares in the players you rate and watch their price move with every match. Coming soon, for adults 18 and over. Players and prices shown are illustrative.",
    features: ["Player shares", "Prices that move with form", "Lineups to copy"],
    action: "Coming soon", href: null, preview: "sports",
  },
  Prediction: {
    headline: "Pick what happens. Get paid if you're right.",
    description: "Sports, politics and the Nigerian music charts, every outcome with its % chance. For adults 18 and over.",
    features: ["Sports", "Politics", "Music charts"],
    action: "Open Prediction", href: "https://prediction.worldstreetgold.com/", preview: "prediction",
  },
} satisfies Record<string, PlatformDetail>;

export type ShowcasePlatformName = keyof typeof platformDetails;

/* Each platform's colour, the same family as the hub's (app/hues.css). A
   platform the hub has a colour for wears it by id. The rest keep their own
   identity colour, softened into that family: one lightness (oklch L 78%),
   one low saturation (C 0.088), and an ink a step lighter (L 86%). */
type HueId =
  | "social" | "xtreme" | "vision" | "arcade" | "shop"
  | "academy" | "forex" | "crypto" | "prediction";
type Tint = { id: string; hue: string; rgb: string; ink: string };

const platformHues: Record<ShowcasePlatformName, HueId | Tint> = {
  WorldSpace: "social",
  // WorldMeet's own gold, as in the hub's registry and the app: on white
  // (its section's fill), so the ink is the deep gold
  WorldMeet: { id: "meet", hue: "#eab308", rgb: "234, 179, 8", ink: "#a16207" },
  XStream: "xtreme",
  Vsion: "vision",
  "AI Movie": { id: "studio", hue: "#d2a5d9", rgb: "210, 165, 217", ink: "#e5c4ea" },
  Arcade: "arcade",
  WorldStore: "shop",
  WorkWorld: { id: "work", hue: "#74cab9", rgb: "116, 202, 185", ink: "#a3dfd2" },
  Academy: "academy",
  WorldHealth: { id: "health", hue: "#e9a0aa", rgb: "233, 160, 170", ink: "#f8c0c7" },
  // E-Embassy's passport blue (#0450C0), softened into the family and turned
  // a little towards indigo, clear of WorldSpace's sky (oklch hue 276)
  "E-Embassy": { id: "embassy", hue: "#a8b3f0", rgb: "168, 179, 240", ink: "#c4ceff" },
  Forex: "forex",
  Crypto: "crypto",
  // WorldSports' pitch green (#10B981), softened into the family and turned
  // towards grass, clear of Forex's green (oklch hue 138)
  WorldSports: { id: "sports", hue: "#9cc58e", rgb: "156, 197, 142", ink: "#bbddb0" },
  Prediction: "prediction",
};

/** Spread on an element to give it the platform's colour: then read
 *  var(--hue), --hue-rgb, --hue-soft, --hue-line, --hue-ink and --hue-on
 *  inside it. */
export function hueAttrs(name: ShowcasePlatformName): {
  "data-hue": string;
  style: CSSProperties;
} {
  const hue = platformHues[name];
  if (typeof hue === "string") return { "data-hue": hue, style: {} };
  return {
    "data-hue": hue.id,
    style: {
      "--hue": hue.hue,
      "--hue-rgb": hue.rgb,
      "--hue-ink": hue.ink,
    } as CSSProperties,
  };
}
