// Adapted from worldstreetgold.com. Keep previews illustrative and avoid
// unverified limits, delivery promises or claims about product availability.
export type PlatformPreviewKind =
  | "social" | "call" | "meeting" | "live" | "film" | "studio" | "arcade"
  | "store" | "work" | "academy" | "health" | "forex" | "crypto" | "prediction";

type PlatformDetail = {
  headline: string;
  description: string;
  features: readonly string[];
  action: string;
  href: string;
  preview: PlatformPreviewKind;
};

export const platformDetails = {
  WorldSpace: {
    headline: "Find your people.",
    description: "Share a thought, join a conversation and keep up with your community.",
    features: ["Posts", "Messages", "Community rooms"],
    action: "Explore WorldSpace", href: "https://social.worldstreetgold.com/", preview: "social",
  },
  WorldCall: {
    headline: "A familiar voice, a little closer.",
    description: "Make room for a real conversation. Catch up with the people who matter.",
    features: ["Voice conversations", "Stay connected"],
    action: "Create your account", href: "/create-account", preview: "call",
  },
  WorldMeet: {
    headline: "Bring everyone into the room.",
    description: "Connect your team or family with a video call and a shared link.",
    features: ["Video calls", "Invite by link", "Meet together"],
    action: "Open WorldMeet", href: "https://meet.worldstreetgold.com/", preview: "meeting",
  },
  XStream: {
    headline: "Be part of the moment.",
    description: "Go live, find a creator and join the conversation as it happens.",
    features: ["Live streams", "Creator rooms", "Live chat"],
    action: "Explore live streams", href: "https://xtream.worldstreetgold.com/", preview: "live",
  },
  Vsion: {
    headline: "Something worth watching. Together.",
    description: "Discover films and shows, then bring friends into a watch party.",
    features: ["Films", "Shows", "Watch parties"],
    action: "Explore films", href: "https://vision.worldstreetgold.com/", preview: "film",
  },
  "AI Movie": {
    headline: "Give your next story a screen.",
    description: "Develop a script, choose AI characters and start shaping your film.",
    features: ["Script writing", "AI cast", "Trailers"],
    action: "Open the studio", href: "https://movie.worldstreetgold.com/", preview: "studio",
  },
  Arcade: {
    headline: "Make time for one more round.",
    description: "Take on trivia, daily challenges and friendly competition.",
    features: ["Quick games", "Challenges", "Rankings"],
    action: "Explore Arcade", href: "https://arcade.worldstreetgold.com/", preview: "arcade",
  },
  WorldStore: {
    headline: "Your next find is here.",
    description: "Browse local sellers or give your own products a place to be discovered.",
    features: ["Shopping", "Seller listings", "Local finds"],
    action: "Explore WorldStore", href: "https://shop.worldstreetgold.com/", preview: "store",
  },
  WorkWorld: {
    headline: "Find the right hands for the job.",
    description: "Discover nearby tradespeople and connect with a service provider.",
    features: ["Local services", "Provider profiles", "Direct contact"],
    action: "Find a provider", href: "https://work.worldstreetgold.com/", preview: "work",
  },
  Academy: {
    headline: "Keep your next skill in reach.",
    description: "Explore practical courses and pick up where you left off.",
    features: ["Courses", "Lessons", "Learning progress"],
    action: "Explore Academy", href: "https://academy.worldstreetgold.com/", preview: "academy",
  },
  WorldHealth: {
    headline: "Start a conversation about your health.",
    description: "Connect with a doctor through video, audio or text. Not for emergencies.",
    features: ["Video", "Audio", "Text consultations"],
    action: "Explore WorldHealth", href: "https://health.worldstreetgold.com/", preview: "health",
  },
  Forex: {
    headline: "Follow currencies around the world.",
    description: "Explore currency pairs across the Tokyo, London and New York sessions.",
    features: ["Currency pairs", "Market charts", "Trading sessions"],
    action: "Explore Forex", href: "https://portal.worldstreetgold.com/", preview: "forex",
  },
  Crypto: {
    headline: "Keep your coins in view.",
    description: "Explore digital assets and follow your portfolio in one place.",
    features: ["Digital assets", "Wallets", "Portfolio tracking"],
    action: "Explore Crypto", href: "https://dashboard.worldstreetgold.com/", preview: "crypto",
  },
  Prediction: {
    headline: "What do you think happens next?",
    description: "Explore possible outcomes across sport, music and politics. For adults 18 and over.",
    features: ["Events", "Market odds", "Outcome cards"],
    action: "Explore Prediction", href: "https://prediction.worldstreetgold.com/", preview: "prediction",
  },
} satisfies Record<string, PlatformDetail>;

export type ShowcasePlatformName = keyof typeof platformDetails;
