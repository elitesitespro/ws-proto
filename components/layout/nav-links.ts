import type { IconName } from "@/components/icon";
import {
  platformDetails,
  type ShowcasePlatformName,
} from "@/app/_components/platform-showcase-content";
import { HUB } from "@/lib/hub";

/*
 * Where the header goes. The same navigation as the live site's
 * (worldstreetgold.com: the hub's components/landing/v4/Nav.tsx and
 * site-links.ts), in this app's own look: Platforms opens the landing's
 * chapters and every platform, then four plain pages, then the account
 * actions. The pages and the account live in the hub (lib/hub.ts), so those
 * links go there.
 */

export const ACCOUNT_LINKS = {
  /** Signing in, then Home (the dashboard). */
  signIn: `${HUB}/login`,
  /** A new account: create it, confirm the email, then onboarding ("Make WorldStreet yours") and Home. */
  join: `${HUB}/register`,
} as const;

/** The plain pages beside Platforms, in the live nav's order. */
export const NAV_PAGES = [
  { label: "Leaderboard", href: `${HUB}/leaderboard` },
  { label: "Community", href: `${HUB}/community` },
  { label: "About", href: `${HUB}/about` },
  { label: "Legal", href: `${HUB}/legal` },
] as const;

/** The phone menu lists Contact with them, as the live one does. */
export const CONTACT_LINK = { label: "Contact", href: `${HUB}/contact` } as const;

/** The landing's chapters, in page order, by their sections' ids on "/"
 *  (the street's four districts, the wallet, Vivid). */
export const NAV_CHAPTERS: readonly { label: string; id: string }[] = [
  { label: "Connect", id: "connect" },
  { label: "Entertainment", id: "entertainment" },
  { label: "Lifestyle", id: "lifestyle" },
  { label: "Markets", id: "markets" },
  { label: "Wallet", id: "wallet" },
  { label: "Vivid", id: "vivid" },
];

export type NavChapter = (typeof NAV_CHAPTERS)[number];

/** On the landing it's an in-page hash (Lenis glides there); anywhere else it leads home to it. */
export const chapterHref = (chapter: NavChapter, pathname: string | null) =>
  pathname === "/" ? `#${chapter.id}` : `/#${chapter.id}`;

/** Whether this is the page that carries the chapters. */
export const isChapterPage = (pathname: string | null) => pathname === "/";

export type NavPlatform = {
  name: string;
  /** What you do there, in a few plain words (the live nav's line). */
  line: string;
  icon: IconName;
  /** Its address. None yet: it's listed as coming soon. */
  href?: string;
  /** Its entry in platformDetails, for its colour (hueAttrs). */
  hue?: ShowcasePlatformName;
};

const at = (name: ShowcasePlatformName) => ({ href: platformDetails[name].href ?? undefined, hue: name });

/**
 * Every platform, in the live nav's order and with its lines, each in its
 * colour. WorldSports isn't out yet, so it has no link.
 */
export const NAV_PLATFORMS: readonly NavPlatform[] = [
  { name: "Forex", line: "Trade currency pairs", icon: "chart-up", ...at("Forex") },
  { name: "Crypto", line: "Buy and hold coins", icon: "bitcoin", ...at("Crypto") },
  { name: "WorldSpace", line: "Chat, rooms and calls", icon: "users", ...at("WorldSpace") },
  { name: "WorldStore", line: "Buy & sell safely", icon: "shopping-bag", ...at("WorldStore") },
  { name: "Arcade", line: "Play and win prizes", icon: "gamepad", ...at("Arcade") },
  { name: "WorldHealth", line: "See a doctor online", icon: "heart-pulse", ...at("WorldHealth") },
  { name: "Worldwork", line: "Hire artisans nearby", icon: "briefcase", ...at("WorkWorld") },
  // Not in the live nav yet, but it's one of the page's platforms
  { name: "Mastery Academy", line: "Learn skills that pay", icon: "graduation", ...at("Academy") },
  { name: "Xtream", line: "Go live, or watch live", icon: "play", ...at("XStream") },
  { name: "Vision", line: "Watch films & shows", icon: "film", ...at("Vsion") },
  { name: "AI Movie", line: "Make films with AI", icon: "sparkle", ...at("AI Movie") },
  { name: "Prediction", line: "Predict real events", icon: "target", ...at("Prediction") },
  { name: "E-Embassy", line: "Visas and passports", icon: "id-card", ...at("E-Embassy") },
  { name: "WorldMeet", line: "Free HD video calls", icon: "video", ...at("WorldMeet") },
  { name: "WorldSports", line: "Trade sports players", icon: "trophy", ...at("WorldSports") },
];
