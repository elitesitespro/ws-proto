import type { IconName } from "@/components/icon";
import {
  platformDetails,
  type ShowcasePlatformName,
} from "@/app/_components/platform-showcase-content";

/*
 * Where the header goes. The same navigation as the live site's
 * (worldstreetgold.com: the hub's components/landing/v4/Nav.tsx and
 * site-links.ts), in this app's own look: Platforms opens the landing's
 * chapters and every platform, then four plain pages, then the account
 * actions. The pages and the account live on the live site, so those links
 * go there.
 */

const LIVE_SITE = "https://www.worldstreetgold.com";

export const ACCOUNT_LINKS = {
  signIn: `${LIVE_SITE}/login`,
  join: `${LIVE_SITE}/register`,
} as const;

/** The plain pages beside Platforms, in the live nav's order. */
export const NAV_PAGES = [
  { label: "Leaderboard", href: `${LIVE_SITE}/leaderboard` },
  { label: "Community", href: `${LIVE_SITE}/community` },
  { label: "About", href: `${LIVE_SITE}/about` },
  { label: "Legal", href: `${LIVE_SITE}/legal` },
] as const;

/** The phone menu lists Contact with them, as the live one does. */
export const CONTACT_LINK = { label: "Contact", href: `${LIVE_SITE}/contact` } as const;

/** The landing's chapters, in page order. `id` is the section's id on "/";
 *  `preview` is its id on /globe-preview, where it's named differently. */
export const NAV_CHAPTERS: readonly { label: string; id: string; preview?: string }[] = [
  { label: "Connect", id: "connect" },
  { label: "Entertainment", id: "entertainment" },
  { label: "Lifestyle", id: "lifestyle" },
  { label: "Markets", id: "markets" },
  { label: "Wallet", id: "wallet" },
  { label: "Vivid", id: "intelligence", preview: "vivid" },
];

export type NavChapter = (typeof NAV_CHAPTERS)[number];

/** Pages that carry the chapters themselves, so a chapter there is an in-page hash. */
const CHAPTER_PAGES = ["/", "/globe-preview"];

/** On a page with the chapters it's an in-page hash (Lenis glides there); anywhere else it leads home to it. */
export const chapterHref = (chapter: NavChapter, pathname: string | null) => {
  if (pathname === "/globe-preview") return `#${chapter.preview ?? chapter.id}`;
  return pathname === "/" ? `#${chapter.id}` : `/#${chapter.id}`;
};

export const isChapterPage = (pathname: string | null) => CHAPTER_PAGES.includes(pathname ?? "");

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

const at = (name: ShowcasePlatformName) => ({ href: platformDetails[name].href, hue: name });

/**
 * Every platform, in the live nav's order and with its lines. E-Embassy and
 * WorldSports aren't in this app's showcase, so they wear no platform colour;
 * WorldSports isn't out yet, so it has no link.
 */
export const NAV_PLATFORMS: readonly NavPlatform[] = [
  { name: "Forex", line: "Trade currency pairs", icon: "chart-up", ...at("Forex") },
  { name: "Crypto", line: "Buy and hold coins", icon: "bitcoin", ...at("Crypto") },
  { name: "WorldSpace", line: "Chat, rooms and calls", icon: "users", ...at("WorldSpace") },
  { name: "WorldStore", line: "Buy & sell safely", icon: "shopping-bag", ...at("WorldStore") },
  { name: "Arcade", line: "Play and win prizes", icon: "gamepad", ...at("Arcade") },
  { name: "WorldHealth", line: "See a doctor online", icon: "heart-pulse", ...at("WorldHealth") },
  { name: "Worldwork", line: "Hire artisans nearby", icon: "briefcase", ...at("WorkWorld") },
  // Not in the live nav yet, but it's one of the page's thirteen
  { name: "Mastery Academy", line: "Learn skills that pay", icon: "graduation", ...at("Academy") },
  { name: "Xtream", line: "Go live, or watch live", icon: "play", ...at("XStream") },
  { name: "Vision", line: "Watch films & shows", icon: "film", ...at("Vsion") },
  { name: "AI Movie", line: "Make films with AI", icon: "sparkle", ...at("AI Movie") },
  { name: "Prediction", line: "Predict real events", icon: "target", ...at("Prediction") },
  { name: "E-Embassy", line: "Visas and passports", icon: "id-card", href: "https://embassy.worldstreetgold.com/" },
  { name: "WorldMeet", line: "Free HD video calls", icon: "video", ...at("WorldMeet") },
  { name: "WorldSports", line: "Trade sports players", icon: "trophy" },
];
