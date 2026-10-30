/*
 * The hub: Home (the dashboard), onboarding, Vivid and the account, where the
 * landing's ways in lead. This is the hub's public demo (worldstreet-hub
 * built with DEMO_MODE): no database, so every visitor is a new demo account.
 * Its /register and /login walk through creating an account and signing in
 * without making one; a device that hasn't been through onboarding is taken
 * there before Home. The live hub is https://www.worldstreetgold.com, with
 * the same /register and /login.
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
