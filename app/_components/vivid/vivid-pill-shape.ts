import { PILL_H } from "./vivid-handoff";

// The ask pill's body, as numbers (vivid-pill.tsx): the sizes of its shapes,
// the path that draws them, and the spring that moves between them. Ported
// from the hub's pill (worldstreet-hub components/dashboard/VividPill.tsx),
// less the chat and voice shapes nobody signed out ever sees, plus the circle
// it's born as when Vivid's intro hands its globe down.

export { PILL_H };

/** Asleep: the small thumb in the middle (px). */
export const THUMB_W = 76;
export const THUMB_H = 34;
/** The sign-in card's corners: the system's card radius. */
export const CARD_R = 20;
/** The sign-in card's least and most height; it's as tall as its words in between. */
export const CARD_MIN = 200;
export const CARD_MAX = 360;
/** Room above the shape for its top edge to bow up while it springs. */
export const HEADROOM = 14;
/** Vivid's globe in the pill, centred in the circle it's born as (the intro lands its globe at this size). */
export const SPHERE = 42;
/** The pill's width: a phone's, with a 12px margin each side, and a laptop's. */
export const PHONE_W = 440;
export const WIDE_W = 520;

/** Everything the spring moves: the shape (w, h, r), and how far it is into the thumb (t), the card (c) and the
 *  circle it's born as (b). */
export type Geo = { w: number; h: number; r: number; t: number; c: number; b: number };
export const KEYS = ["w", "h", "r", "t", "c", "b"] as const;
export const ZERO: Geo = { w: 0, h: 0, r: 0, t: 0, c: 0, b: 0 };

/** The circle the pill is born as, where the intro's globe lands. */
export const CIRCLE: Geo = { w: PILL_H, h: PILL_H, r: PILL_H / 2, t: 0, c: 0, b: 1 };
export const THUMB: Geo = { w: THUMB_W, h: THUMB_H, r: THUMB_H / 2, t: 1, c: 0, b: 0 };
export const pillGeo = (w: number): Geo => ({ w, h: PILL_H, r: PILL_H / 2, t: 0, c: 0, b: 0 });
export const cardGeo = (w: number, h: number): Geo => ({ w, h, r: CARD_R, t: 0, c: 1, b: 0 });

/** Stiff, slightly bouncy: the hub's spring. */
export const STIFFNESS = 210;
export const DAMPING = 18;

export const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * A rounded box path, w×h with corner radius r, centred at x=cx, sitting on
 * y=bottom, with the top edge bowed up by `bulge`. At r = h/2 it's a pill;
 * at w = h too, a circle.
 */
export function shape(cx: number, bottom: number, w: number, h: number, r: number, bulge: number) {
  const rr = Math.max(0, Math.min(r, h / 2, w / 2));
  const l = cx - w / 2;
  const rt = cx + w / 2;
  const top = bottom - h;
  // Circle-ish corners
  const k = 0.5523 * rr;
  const mid = cx;
  return [
    `M${l + rr} ${top}`,
    // The top edge in two halves, bowed by the bulge at the middle
    `C${l + rr + (mid - l - rr) * 0.5} ${top - bulge * 0.9} ${mid - (mid - l - rr) * 0.25} ${top - bulge} ${mid} ${top - bulge}`,
    `C${mid + (rt - rr - mid) * 0.25} ${top - bulge} ${mid + (rt - rr - mid) * 0.5} ${top - bulge * 0.9} ${rt - rr} ${top}`,
    `C${rt - rr + k} ${top} ${rt} ${top + rr - k} ${rt} ${top + rr}`,
    `L${rt} ${bottom - rr}`,
    `C${rt} ${bottom - rr + k} ${rt - rr + k} ${bottom} ${rt - rr} ${bottom}`,
    `L${l + rr} ${bottom}`,
    `C${l + rr - k} ${bottom} ${l} ${bottom - rr + k} ${l} ${bottom - rr}`,
    `L${l} ${top + rr}`,
    `C${l} ${top + rr - k} ${l + rr - k} ${top} ${l + rr} ${top}`,
    "Z",
  ].join("");
}
