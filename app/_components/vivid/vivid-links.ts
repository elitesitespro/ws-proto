import { HUB } from "@/lib/hub";

// Vivid's own page, in the hub. A question in ?q= arrives typed in its box,
// not sent (worldstreet-hub components/vivid/VividUrlPrefill.tsx).
export const VIVID_URL = `${HUB}/vivid`;
export const askVivid = (question: string) => `${VIVID_URL}?q=${encodeURIComponent(question)}`;
