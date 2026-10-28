/*
 * The hub: Home (the dashboard), onboarding, Vivid and the account, where the
 * landing's ways in lead. This is the hub's public demo (worldstreet-hub
 * built with DEMO_MODE): no database and no sign-up, so every visitor is a
 * new demo account, and a device that hasn't been through onboarding is
 * taken there before Home. The live hub is https://www.worldstreetgold.com,
 * where a new account starts at /register and signing in at /login.
 */
export const HUB = "https://worldstreet-hub-demo.vercel.app";

/** Whether a link leads into the hub. */
export function isHubLink(href: string) {
  try {
    return new URL(href, window.location.href).origin === HUB;
  } catch {
    return false;
  }
}
