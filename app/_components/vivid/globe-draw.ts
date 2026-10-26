// Vivid's globe, as numbers: where every dot sits and how it's lit. Ported
// from worldstreet-hub (components/vivid/globe-draw.ts), so Vivid here is the
// same object as in the hub.
//
// The dots sit on a Fibonacci sphere (an even spread with no seams and no
// crowded poles), turn on an axis tipped toward you and are drawn front half
// only, so they shrink, fade and crowd toward the rim the way a real globe
// foreshortens.

const TAU = Math.PI * 2;
/** The axis leans toward you, so the top cap shows. */
const TILT = 0.38;
const COS_T = Math.cos(TILT);
const SIN_T = Math.sin(TILT);
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/** Where the turn starts, so a still frame shows a pleasant face. */
export const FIRST_TURN = 0.13;
/** Milliseconds per turn. Idle drifts; awake (talking) hurries. */
export const TURN_IDLE = 26_000;
export const TURN_ACTIVE = 9_000;

/** Rim to front: the brand gold warming to near-white where a dot faces you. */
const RIM = [234, 179, 8]; // #EAB308
const FRONT = [254, 243, 199]; // #FEF3C7
const SHADES = Array.from({ length: 32 }, (_, i) => {
  const c = RIM.map((v, k) => Math.round(v + ((FRONT[k] - v) * i) / 31));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
});

/** How many dots make a globe about `across` dots wide at its face. */
export function dotsFor(across: number) {
  return Math.round(Math.PI * across * across);
}

/** Dots across the face for a globe `size` px wide: 8 at 16px, 11 at 40px, 17 at 88px, 18 from there. */
export function acrossFor(size: number) {
  return Math.min(18, Math.max(7, 6 + size * 0.12));
}

/** `n` points spread evenly over a unit sphere: x, y, z for each in turn. */
export function globePoints(n: number) {
  const pts = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const y = 1 - ((i + 0.5) / n) * 2;
    const r = Math.sqrt(1 - y * y);
    const a = GOLDEN * i;
    pts[i * 3] = Math.cos(a) * r;
    pts[i * 3 + 1] = y;
    pts[i * 3 + 2] = Math.sin(a) * r;
  }
  return pts;
}

export type GlobeFrame = {
  /** The globe's centre and radius. */
  cx: number;
  cy: number;
  radius: number;
  /** A dot's radius where it faces you; dots shrink toward the rim. */
  dot: number;
  /** How far round it has turned: 0 to 1 is one turn. */
  turn: number;
  /** Voice, 0 to 1: every dot swells and brightens, and the globe grows a touch. */
  level?: number;
  /** All of it, 0 to 1 (for one globe handing over to another). */
  fade?: number;
};

/** The globe on a 2D canvas, in the context's current transform. */
export function drawGlobe(ctx: CanvasRenderingContext2D, pts: Float32Array, f: GlobeFrame) {
  const level = f.level ?? 0;
  const fade = f.fade ?? 1;
  const a = f.turn * TAU;
  const cosA = Math.cos(a);
  const sinA = Math.sin(a);
  const radius = f.radius * (1 + level * 0.05);
  for (let i = 0; i < pts.length; i += 3) {
    const x = pts[i];
    const y = pts[i + 1];
    const z = pts[i + 2];
    const x1 = x * cosA + z * sinA;
    const z1 = z * cosA - x * sinA;
    const y2 = y * COS_T - z1 * SIN_T;
    // Depth: 1 faces you, 0 is the rim. The far half isn't drawn.
    const d = y * SIN_T + z1 * COS_T;
    if (d <= 0) continue;
    ctx.globalAlpha = Math.min(1, 0.18 + 0.82 * d ** 0.7 + level * 0.3) * fade;
    ctx.fillStyle = SHADES[Math.min(31, Math.round(Math.min(1, d * d + level * 0.4) * 31))];
    ctx.beginPath();
    ctx.arc(f.cx + x1 * radius, f.cy - y2 * radius, f.dot * (0.45 + 0.55 * Math.sqrt(d)) * (1 + level * 0.8), 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** A voice, without one: a soft, uneven swell for a globe that's talking. */
export function talking(t: number) {
  const s = Math.sin(t / 170) * 0.5 + Math.sin(t / 97 + 1.3) * 0.3 + Math.sin(t / 61 + 0.4) * 0.2;
  return Math.max(0, s) * 0.55;
}
