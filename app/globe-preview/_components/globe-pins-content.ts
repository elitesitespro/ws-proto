// What the globe shows for each word in the headline: a few live cards,
// pinned to cities. Illustrative only (keep to the rule in
// platform-showcase-content.ts: no unverified limits, promises or claims).
import type { IconName } from "@/components/icon";
import type { ShowcasePlatformName } from "@/app/_components/platform-showcase-content";

export type PinCity = { name: string; lat: number; lon: number };

// Spread round the world, so whichever side faces the viewer has a few to
// choose from as the globe turns.
export const PIN_CITIES: readonly PinCity[] = [
  { name: "London", lat: 51.51, lon: -0.13 },
  { name: "Paris", lat: 48.86, lon: 2.35 },
  { name: "Berlin", lat: 52.52, lon: 13.4 },
  { name: "Madrid", lat: 40.42, lon: -3.7 },
  { name: "Rome", lat: 41.9, lon: 12.5 },
  { name: "Stockholm", lat: 59.33, lon: 18.07 },
  { name: "Reykjavík", lat: 64.15, lon: -21.94 },
  { name: "Istanbul", lat: 41.01, lon: 28.98 },
  { name: "Moscow", lat: 55.76, lon: 37.62 },
  { name: "Casablanca", lat: 33.57, lon: -7.59 },
  { name: "Dakar", lat: 14.72, lon: -17.47 },
  { name: "Accra", lat: 5.6, lon: -0.19 },
  { name: "Lagos", lat: 6.52, lon: 3.38 },
  { name: "Kinshasa", lat: -4.44, lon: 15.27 },
  { name: "Cairo", lat: 30.04, lon: 31.24 },
  { name: "Nairobi", lat: -1.29, lon: 36.82 },
  { name: "Joburg", lat: -26.2, lon: 28.05 },
  { name: "Cape Town", lat: -33.92, lon: 18.42 },
  { name: "Luanda", lat: -8.84, lon: 13.23 },
  { name: "Dar es Salaam", lat: -6.79, lon: 39.21 },
  { name: "Antananarivo", lat: -18.88, lon: 47.51 },
  { name: "Riyadh", lat: 24.71, lon: 46.68 },
  { name: "Dubai", lat: 25.2, lon: 55.27 },
  { name: "Karachi", lat: 24.86, lon: 67.01 },
  { name: "Mumbai", lat: 19.08, lon: 72.88 },
  { name: "Delhi", lat: 28.61, lon: 77.21 },
  { name: "Bangkok", lat: 13.76, lon: 100.5 },
  { name: "Singapore", lat: 1.35, lon: 103.82 },
  { name: "Jakarta", lat: -6.21, lon: 106.85 },
  { name: "Hong Kong", lat: 22.32, lon: 114.17 },
  { name: "Shanghai", lat: 31.23, lon: 121.47 },
  { name: "Manila", lat: 14.6, lon: 120.98 },
  { name: "Seoul", lat: 37.57, lon: 126.98 },
  { name: "Tokyo", lat: 35.68, lon: 139.69 },
  { name: "Kuala Lumpur", lat: 3.14, lon: 101.69 },
  { name: "Ho Chi Minh", lat: 10.82, lon: 106.63 },
  { name: "Bali", lat: -8.65, lon: 115.22 },
  { name: "Perth", lat: -31.95, lon: 115.86 },
  { name: "Darwin", lat: -12.46, lon: 130.84 },
  { name: "Adelaide", lat: -34.93, lon: 138.6 },
  { name: "Melbourne", lat: -37.81, lon: 144.96 },
  { name: "Port Moresby", lat: -9.44, lon: 147.18 },
  { name: "Brisbane", lat: -27.47, lon: 153.03 },
  { name: "Sydney", lat: -33.87, lon: 151.21 },
  { name: "Wellington", lat: -41.29, lon: 174.78 },
  { name: "Auckland", lat: -36.85, lon: 174.76 },
  { name: "Suva", lat: -18.14, lon: 178.44 },
  { name: "Honolulu", lat: 21.31, lon: -157.86 },
  { name: "Vancouver", lat: 49.28, lon: -123.12 },
  { name: "Los Angeles", lat: 34.05, lon: -118.24 },
  { name: "Mexico City", lat: 19.43, lon: -99.13 },
  { name: "Chicago", lat: 41.88, lon: -87.63 },
  { name: "Toronto", lat: 43.65, lon: -79.38 },
  { name: "New York", lat: 40.71, lon: -74.01 },
  { name: "Miami", lat: 25.76, lon: -80.19 },
  { name: "Bogotá", lat: 4.71, lon: -74.07 },
  { name: "Lima", lat: -12.05, lon: -77.04 },
  { name: "São Paulo", lat: -23.55, lon: -46.63 },
  { name: "Rio", lat: -22.91, lon: -43.17 },
  { name: "Santiago", lat: -33.45, lon: -70.67 },
  { name: "Buenos Aires", lat: -34.6, lon: -58.38 },
];

const IMG = "/assets/images";
const FLAG = "/images/currencies";

/** A person in a card: a face from the project's photos and a first name. */
export type Face = { name: string; src: string };
const FACES = {
  bisi: { name: "Bisi", src: "/assets/people/bisi.webp" },
  ade: { name: "Ade", src: `${IMG}/active-meeting-2.jpg` },
  kemi: { name: "Kemi", src: `${IMG}/active-meeting-3.jpg` },
  ama: { name: "Ama", src: `${IMG}/active-meeting-1.jpg` },
  arjun: { name: "Arjun", src: `${IMG}/active-meeting-4.jpg` },
  nia: { name: "Nia", src: `${IMG}/dune-1.jpg` },
  tobi: { name: "Tobi", src: `${IMG}/dune-2.jpg` },
  mei: { name: "Mei", src: `${IMG}/dune-3.jpg` },
  ifeoma: { name: "Ifeoma", src: "/assets/people/ifeoma.webp" },
} satisfies Record<string, Face>;

/** A game's art on its card: a picture, a few letter tiles, or a glyph. */
export type GameArt = { kind: "image"; src: string } | { kind: "letters"; letters: string } | { kind: "icon"; icon: IconName };

/**
 * One card's content. Each kind has its own look (globe-pin-cards.tsx) and
 * its own live part that ticks: a price walks both ways, counts of people
 * drift (more arriving than leaving), sales and scores only climb, a round's
 * clock runs down. Prices are money, so their change is emerald or red.
 * "{city}" in any text is the pin's city.
 */
export type PinCard =
  | { kind: "rate"; base: string; quote: string; flags: readonly [string, string]; value: number; decimals: number; change: number; step: number }
  | { kind: "coin"; symbol: string; name: string; logo: string; value: number; decimals: number; change: number; step: number; stable?: boolean }
  | { kind: "live"; title: string; thumb: string; host: Face; viewers: number }
  | { kind: "chat"; group: string; from: Face; message: string; typing: Face; online: number; faces: readonly Face[] }
  | {
      kind: "match";
      game: string;
      art: GameArt;
      round: number;
      rounds: number;
      playing: number;
      seconds: number;
      leaders: readonly (Face & { score: number })[];
    }
  | { kind: "product"; name: string; price: string; image: string; icon: IconName; seller: string; sold: number }
  | { kind: "course"; title: string; cover: string; lesson: number; lessons: number; learners: number; faces: readonly Face[] };

/** The cards for a platform, the most to show at once, and their footprint (CSS px) for fitting them on screen. */
export type PinSet = { icon: IconName; count: number; size: { w: number; h: number }; cards: readonly PinCard[] };

export const PLATFORM_PINS: Partial<Record<ShowcasePlatformName, PinSet>> = {
  Forex: {
    icon: "chart-up",
    count: 3,
    size: { w: 288, h: 76 },
    cards: [
      { kind: "rate", base: "EUR", quote: "USD", flags: [`${FLAG}/eu.svg`, `${FLAG}/us.svg`], value: 1.0842, decimals: 4, change: 0.12, step: 0.00012 },
      { kind: "rate", base: "USD", quote: "NGN", flags: [`${FLAG}/us.svg`, `${FLAG}/ng.svg`], value: 1540.25, decimals: 2, change: -0.18, step: 0.6 },
      { kind: "rate", base: "EUR", quote: "NGN", flags: [`${FLAG}/eu.svg`, `${FLAG}/ng.svg`], value: 1669.8, decimals: 2, change: 0.06, step: 0.7 },
    ],
  },
  XStream: {
    icon: "live",
    count: 2,
    size: { w: 232, h: 192 },
    cards: [
      { kind: "live", title: "Gaming night with Mei", thumb: `${IMG}/xtream-live.webp`, host: FACES.mei, viewers: 2418 },
      { kind: "live", title: "Cooking with Ama", thumb: `${IMG}/active-meeting-1.jpg`, host: FACES.ama, viewers: 864 },
      { kind: "live", title: "Film night watch-along", thumb: `${IMG}/dune-0.jpg`, host: FACES.tobi, viewers: 5130 },
    ],
  },
  WorldSpace: {
    icon: "users",
    count: 2,
    size: { w: 296, h: 160 },
    cards: [
      {
        kind: "chat",
        group: "{city} creators",
        from: FACES.bisi,
        message: "Who's coming to the meetup tonight?",
        typing: FACES.ade,
        online: 1204,
        faces: [FACES.kemi, FACES.tobi, FACES.nia],
      },
      {
        kind: "chat",
        group: "{city} founders",
        from: FACES.arjun,
        message: "Shared the deck from today's session",
        typing: FACES.ifeoma,
        online: 742,
        faces: [FACES.mei, FACES.ama, FACES.ade],
      },
      {
        kind: "chat",
        group: "{city} book club",
        from: FACES.nia,
        message: "Chapter nine. No spoilers, please!",
        typing: FACES.kemi,
        online: 386,
        faces: [FACES.ifeoma, FACES.arjun, FACES.bisi],
      },
    ],
  },
  Arcade: {
    icon: "gamepad",
    count: 2,
    size: { w: 272, h: 248 },
    cards: [
      {
        kind: "match",
        game: "Trivia night",
        art: { kind: "image", src: `${IMG}/luminous-molten-gold-question-mark-1.png` },
        round: 3,
        rounds: 5,
        playing: 642,
        seconds: 52,
        leaders: [
          { ...FACES.nia, score: 9820 },
          { ...FACES.tobi, score: 9410 },
          { ...FACES.mei, score: 8975 },
        ],
      },
      {
        kind: "match",
        game: "Word sprint",
        art: { kind: "letters", letters: "WORD" },
        round: 2,
        rounds: 4,
        playing: 418,
        seconds: 34,
        leaders: [
          { ...FACES.kemi, score: 4310 },
          { ...FACES.arjun, score: 4185 },
          { ...FACES.ama, score: 3990 },
        ],
      },
      {
        kind: "match",
        game: "Daily challenge",
        art: { kind: "icon", icon: "trophy" },
        round: 7,
        rounds: 10,
        playing: 1380,
        seconds: 45,
        leaders: [
          { ...FACES.ifeoma, score: 15240 },
          { ...FACES.ade, score: 14980 },
          { ...FACES.bisi, score: 14415 },
        ],
      },
    ],
  },
  WorldStore: {
    icon: "shopping-bag",
    count: 3,
    size: { w: 256, h: 84 },
    cards: [
      { kind: "product", name: "Leather tote", price: "$48", image: `${IMG}/store/tote.png`, icon: "shopping-bag", seller: "Seller in {city}", sold: 128 },
      { kind: "product", name: "Amber perfume", price: "$36", image: `${IMG}/store/perfume.png`, icon: "gem", seller: "Seller in {city}", sold: 64 },
      { kind: "product", name: "Clay vase", price: "$22", image: `${IMG}/store/vase.png`, icon: "gift", seller: "Seller in {city}", sold: 211 },
    ],
  },
  Academy: {
    icon: "graduation",
    count: 3,
    size: { w: 272, h: 100 },
    cards: [
      { kind: "course", title: "Photography basics", cover: `${IMG}/academy-course.jpg`, lesson: 4, lessons: 12, learners: 2140, faces: [FACES.kemi, FACES.arjun, FACES.nia] },
      { kind: "course", title: "Designing apps", cover: `${IMG}/meeting-source-1.png`, lesson: 7, lessons: 10, learners: 1786, faces: [FACES.tobi, FACES.ifeoma, FACES.ama] },
      { kind: "course", title: "Visual storytelling", cover: `${IMG}/dune-0.jpg`, lesson: 2, lessons: 8, learners: 642, faces: [FACES.mei, FACES.ade, FACES.bisi] },
    ],
  },
  Crypto: {
    icon: "bitcoin",
    count: 3,
    size: { w: 288, h: 76 },
    cards: [
      { kind: "coin", symbol: "BTC", name: "Bitcoin", logo: `${FLAG}/btc.svg`, value: 67420.18, decimals: 2, change: 1.84, step: 18 },
      { kind: "coin", symbol: "ETH", name: "Ethereum", logo: `${FLAG}/eth.svg`, value: 3512.4, decimals: 2, change: 0.92, step: 1.4 },
      { kind: "coin", symbol: "USDT", name: "Tether", logo: `${FLAG}/usdt.svg`, value: 1.0001, decimals: 4, change: 0.01, step: 0.0001, stable: true },
    ],
  },
};
