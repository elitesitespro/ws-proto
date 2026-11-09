// Vivid as a field of light, for its intro (vivid-intro.tsx). Its dots rest as
// a sphere that breathes, and, scrubbed by the scroll, stream into a shape
// (the word, a globe, the W) and gather back. After the dots on
// vividai.worldstreetgold.com: a shape is drawn offscreen and stippled
// evenly, and the sphere's dots are matched to it along a Hilbert curve, so
// each takes a short path and the shape fills in as one stream.
//
// Everything is in units of the sphere's radius, centred on it; one draw is
// one pass over the dots, sprites added up as light (so where they crowd,
// they glow).

const TAU = Math.PI * 2;
/** The axis leans toward you, so the top cap shows (as globe-draw's). */
const TILT = 0.38;
const COS_T = Math.cos(TILT);
const SIN_T = Math.sin(TILT);
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

export const SHAPES = ["vivid", "globe", "w"] as const;
export type Shape = (typeof SHAPES)[number];

/** Rim to front, the brand's lemon lime warming to near-white (globe-draw's). */
const RIM = [198, 232, 43];
const FRONT = [246, 252, 214];
const SHADES = 16;
/** Each shape's colour, from the lemon (0) to near-white (1). */
const TINT: Record<Shape, number> = { vivid: 0.6, globe: 0.25, w: 0 };
/** How much of the morph is stagger: the shape fills in along its curve, not all at once. */
const STAGGER = 0.55;
/** How far a dot swings off the straight line on its way (a share of its path). */
const SWING = 0.42;
/** How wide the shapes are drawn (radii), and the stipple's canvas (px a side). */
const REACH = 1.12;
const SAMPLE = 320;

const clamp = (v: number) => Math.min(Math.max(v, 0), 1);
const ease = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

/** Where (x, y) falls along a Hilbert curve over a side × side grid (side a power of two). */
function hilbert(side: number, x: number, y: number) {
  let d = 0;
  for (let s = side >> 1; s > 0; s >>= 1) {
    const rx = (x & s) > 0 ? 1 : 0;
    const ry = (y & s) > 0 ? 1 : 0;
    d += s * s * ((3 * rx) ^ ry);
    if (ry === 0) {
      if (rx === 1) {
        x = side - 1 - x;
        y = side - 1 - y;
      }
      const t = x;
      x = y;
      y = t;
    }
  }
  return d;
}

/** Each point's place along the curve, its x and y read from -1..1 (via `xy`). */
function curveOrder(count: number, xy: (i: number) => [number, number]) {
  const side = 256;
  const keys = new Float64Array(count);
  for (let i = 0; i < count; i++) {
    const [x, y] = xy(i);
    const gx = Math.min(side - 1, Math.max(0, Math.floor(((x + 1) / 2) * side)));
    const gy = Math.min(side - 1, Math.max(0, Math.floor(((1 - y) / 2) * side)));
    keys[i] = hilbert(side, gx, gy);
  }
  return Array.from({ length: count }, (_, i) => i).sort((a, b) => keys[a] - keys[b]);
}

/** A seeded random, so the field is the same on every visit. */
function seeded(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** `n` points as even as a stipple from what's filled on a canvas, in radii (y up). */
function stipple(n: number, paint: (c: CanvasRenderingContext2D, size: number) => void, random: () => number) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SAMPLE;
  const c = canvas.getContext("2d", { willReadFrequently: true });
  if (!c) return null;
  c.fillStyle = "#fff";
  c.strokeStyle = "#fff";
  paint(c, SAMPLE);
  const data = c.getImageData(0, 0, SAMPLE, SAMPLE).data;
  const filled: number[] = [];
  for (let i = 0; i < SAMPLE * SAMPLE; i++) if (data[i * 4 + 3] > 127) filled.push(i);
  if (!filled.length) return null;
  // One pick per cell of a grid sized so about n cells are filled: an even spread, never clumps
  let cell = Math.sqrt(filled.length / n);
  let picks: number[] = [];
  for (let tries = 0; tries < 6; tries++) {
    const byCell = new Map<number, number[]>();
    for (const i of filled) {
      const key = Math.floor((i % SAMPLE) / cell) * 4096 + Math.floor(Math.floor(i / SAMPLE) / cell);
      const list = byCell.get(key);
      if (list) list.push(i);
      else byCell.set(key, [i]);
    }
    picks = [...byCell.values()].map((list) => list[Math.floor(random() * list.length)]);
    if (Math.abs(picks.length - n) < n * 0.04) break;
    cell *= Math.sqrt(picks.length / n);
  }
  // Exactly n: drop the extra at random, or double up a few (a hair apart)
  while (picks.length > n) picks.splice(Math.floor(random() * picks.length), 1);
  while (picks.length < n) picks.push(picks[Math.floor(random() * picks.length)]);
  const out = new Float32Array(n * 3);
  const unit = (2 * REACH) / SAMPLE;
  picks.forEach((i, k) => {
    out[k * 3] = ((i % SAMPLE) + random()) * unit - REACH;
    out[k * 3 + 1] = REACH - (Math.floor(i / SAMPLE) + random()) * unit;
  });
  return out;
}

/** The word, as wide as the field allows, in the page's own type. */
function wordPoints(n: number, random: () => number) {
  return stipple(
    n,
    (c, size) => {
      const family = getComputedStyle(document.body).fontFamily || "sans-serif";
      let px = size * 0.42;
      c.font = `700 ${px}px ${family}`;
      const fit = (size * 0.96) / c.measureText("vivid").width;
      if (fit < 1) {
        px *= fit;
        c.font = `700 ${px}px ${family}`;
      }
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText("vivid", size / 2, size * 0.47);
    },
    random,
  );
}

/** WorldStreet's W (public/assets/logos/ws-logo-icon.svg's two strokes, 82 × 56). */
function markPoints(n: number, random: () => number) {
  return stipple(
    n,
    (c, size) => {
      const s = (size * 0.94) / 74;
      c.translate(size / 2 - 41 * s, size / 2 - 28 * s);
      c.scale(s, s);
      c.fill(new Path2D("M40.9432 25.2479L27.603 49L4 7H30.7076L40.9432 25.2479Z"));
      c.fill(new Path2D("M77.8999 7L54.297 49L40.9432 25.2479L51.2059 7H77.8999Z"));
    },
    random,
  );
}

/** A globe of meridians and parallels on the sphere itself: n points along its lines (3D, unrotated). */
function globeLines(n: number, random: () => number) {
  const MERIDIANS = 6; // great circles through the poles: 12 half-meridians
  const PARALLELS = [-60, -30, 0, 30, 60].map((d) => (d * Math.PI) / 180);
  const runs: { length: number; at: (u: number) => [number, number, number] }[] = [];
  for (let k = 0; k < MERIDIANS * 2; k++) {
    const lon = (k * Math.PI) / MERIDIANS;
    runs.push({
      length: Math.PI,
      at: (u) => {
        const lat = -Math.PI / 2 + u * Math.PI;
        return [Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)];
      },
    });
  }
  for (const lat of PARALLELS) {
    runs.push({
      length: TAU * Math.cos(lat),
      at: (u) => [Math.cos(lat) * Math.cos(u * TAU), Math.sin(lat), Math.cos(lat) * Math.sin(u * TAU)],
    });
  }
  const total = runs.reduce((a, r) => a + r.length, 0);
  const out = new Float32Array(n * 3);
  let k = 0;
  for (const run of runs) {
    const count = run === runs[runs.length - 1] ? n - k : Math.round((run.length / total) * n);
    for (let j = 0; j < count && k < n; j++, k++) {
      const [x, y, z] = run.at((j + random() * 0.6) / count);
      out[k * 3] = x;
      out[k * 3 + 1] = y;
      out[k * 3 + 2] = z;
    }
  }
  return out;
}

type Target = {
  /** Each dot's place in the shape (radii), in dot order. */
  pts: Float32Array;
  /** Whether it turns with the sphere (the globe), or faces you (a word, a mark). */
  turns: boolean;
  /** Each dot's place in the stream, 0 to 1: when it sets off. */
  rank: Float32Array;
};

export type FieldFrame = {
  /** The sphere's centre and radius, and a dot's radius where it faces you. */
  cx: number;
  cy: number;
  radius: number;
  dot: number;
  /** How far round it has turned (0 to 1 is a turn), and the clock (ms) it breathes by. */
  turn: number;
  now: number;
  /** Voice, 0 to 1: it swells and brightens. */
  level: number;
  /** All of it, 0 to 1. */
  fade: number;
  /** The shape it's streaming into, and how far (0 the sphere, 1 the shape). */
  shape: Shape | null;
  amount: number;
};

/** Vivid's field of `n` dots: draw it each frame with `draw`. */
export function createField(n: number) {
  const random = seeded(29);
  // The sphere: an even spread over it (Fibonacci), each dot nudged off its
  // place a little so it reads as a stipple of light rather than a lattice,
  // with a beat of its own and a way it swings
  const sphere = new Float32Array(n * 3);
  const beat = new Float32Array(n);
  const swing = new Float32Array(n);
  const nudge = 0.45 * Math.sqrt((4 * Math.PI) / n);
  for (let i = 0; i < n; i++) {
    const y0 = 1 - ((i + 0.5) / n) * 2;
    const r0 = Math.sqrt(1 - y0 * y0);
    const a = GOLDEN * i;
    const x = Math.cos(a) * r0 + (random() - 0.5) * nudge;
    const y = y0 + (random() - 0.5) * nudge;
    const z = Math.sin(a) * r0 + (random() - 0.5) * nudge;
    const len = Math.hypot(x, y, z);
    sphere[i * 3] = x / len;
    sphere[i * 3 + 1] = y / len;
    sphere[i * 3 + 2] = z / len;
    beat[i] = random() * TAU;
    swing[i] = (random() - 0.5) * 2;
  }
  // The dots in the order they lie along the curve, as you see the sphere front on (tilted, not turned)
  const dotOrder = curveOrder(n, (i) => [sphere[i * 3], sphere[i * 3 + 1] * COS_T - sphere[i * 3 + 2] * SIN_T]);
  // ...and as they lie round it (longitude, latitude), for the globe
  const dotRound = curveOrder(n, (i) => [
    Math.atan2(sphere[i * 3 + 2], sphere[i * 3]) / Math.PI,
    (Math.asin(Math.max(-1, Math.min(1, sphere[i * 3 + 1]))) * 2) / Math.PI,
  ]);

  const targets = new Map<Shape, Target | null>();
  /** A shape, worked out the first time it's wanted, its points matched to the dots along the curve. */
  const target = (shape: Shape): Target | null => {
    if (targets.has(shape)) return targets.get(shape) ?? null;
    const raw = shape === "vivid" ? wordPoints(n, random) : shape === "w" ? markPoints(n, random) : globeLines(n, random);
    if (!raw) {
      targets.set(shape, null);
      return null;
    }
    const turns = shape === "globe";
    const order = turns
      ? curveOrder(n, (i) => [
          Math.atan2(raw[i * 3 + 2], raw[i * 3]) / Math.PI,
          (Math.asin(Math.max(-1, Math.min(1, raw[i * 3 + 1]))) * 2) / Math.PI,
        ])
      : curveOrder(n, (i) => [raw[i * 3] / REACH, raw[i * 3 + 1] / REACH]);
    const dots = turns ? dotRound : dotOrder;
    const pts = new Float32Array(n * 3);
    const rank = new Float32Array(n);
    for (let k = 0; k < n; k++) {
      const dot = dots[k];
      const from = order[k];
      pts[dot * 3] = raw[from * 3];
      pts[dot * 3 + 1] = raw[from * 3 + 1];
      pts[dot * 3 + 2] = raw[from * 3 + 2];
      rank[dot] = k / n;
    }
    const t = { pts, turns, rank };
    targets.set(shape, t);
    return t;
  };

  // A soft round sprite for each shade, drawn once: light that adds up where dots crowd
  const SPRITE = 32;
  const sprites = Array.from({ length: SHADES }, (_, s) => {
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = SPRITE;
    const c = sprite.getContext("2d");
    if (!c) return sprite;
    const k = s / (SHADES - 1);
    const [r, g, b] = RIM.map((v, j) => Math.round(v + (FRONT[j] - v) * k));
    const glow = c.createRadialGradient(SPRITE / 2, SPRITE / 2, 0, SPRITE / 2, SPRITE / 2, SPRITE / 2);
    glow.addColorStop(0, `rgba(${r},${g},${b},1)`);
    glow.addColorStop(0.42, `rgba(${r},${g},${b},0.9)`);
    glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
    c.fillStyle = glow;
    c.fillRect(0, 0, SPRITE, SPRITE);
    return sprite;
  });

  /** One frame of the field, in the context's current transform. */
  const draw = (ctx: CanvasRenderingContext2D, f: FieldFrame) => {
    if (f.fade <= 0) return;
    const a = f.turn * TAU;
    const cosA = Math.cos(a);
    const sinA = Math.sin(a);
    const t = f.now / 1000;
    const morph = f.shape && f.amount > 0 ? target(f.shape) : null;
    const amount = morph ? clamp(f.amount) : 0;
    const tint = f.shape ? TINT[f.shape] : 0;
    // At rest the whole of it breathes; it swells a touch with a voice
    const radius = f.radius * (1 + 0.022 * Math.sin(t * 1.15) + f.level * 0.05);
    const size = f.dot * (1 + f.level * 0.8) * 2.4;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < n; i++) {
      // How far this dot is on its way (it sets off when its place in the stream comes up)
      const e = amount > 0 ? ease(clamp((amount * (1 + STAGGER) - (morph?.rank[i] ?? 0) * STAGGER) / 1)) : 0;
      // On the sphere, each dot drifts in and out a little on its own beat, so the surface lives
      const lift = 1 + 0.035 * Math.sin(t * 0.9 + beat[i]) * (1 - e);
      let x = sphere[i * 3] * lift;
      let y = sphere[i * 3 + 1] * lift;
      let z = sphere[i * 3 + 2] * lift;
      if (morph && morph.turns && e > 0) {
        // The globe's lines are on the sphere: the dots slide over it to them, and it all turns as one
        x += (morph.pts[i * 3] - x) * e;
        y += (morph.pts[i * 3 + 1] - y) * e;
        z += (morph.pts[i * 3 + 2] - z) * e;
      }
      // Turn, then tip toward you; depth 1 faces you, -1 is the far side
      const x1 = x * cosA + z * sinA;
      const z1 = z * cosA - x * sinA;
      let sx = x1;
      let sy = y * COS_T - z1 * SIN_T;
      let depth = y * SIN_T + z1 * COS_T;
      if (morph && !morph.turns && e > 0) {
        // A flat shape faces you: off the sphere toward it, swinging out to one side on the way
        const tx = morph.pts[i * 3] + 0.006 * Math.sin(t * 1.3 + beat[i]);
        const ty = morph.pts[i * 3 + 1] + 0.006 * Math.cos(t * 1.1 + beat[i]);
        const dx = tx - sx;
        const dy = ty - sy;
        const arc = SWING * swing[i] * Math.sin(Math.PI * e);
        sx += dx * e - dy * arc;
        sy += dy * e + dx * arc;
        depth += (1 - depth) * e;
      }
      // Faint and small round the back, bright and full where it faces you
      const front = Math.max(depth, 0);
      const alpha = (depth > 0 ? 0.22 + 0.78 * front ** 0.7 : 0.12 * (1 + depth)) * f.fade;
      // The faintest, deep round the back, aren't worth a draw (about a quarter of them, at rest)
      if (alpha < 0.05) continue;
      const shade = Math.min(1, front * front + f.level * 0.4) * (1 - e) + tint * e;
      const s = size * (0.5 + 0.5 * Math.sqrt(front));
      ctx.globalAlpha = Math.min(1, alpha + f.level * 0.2);
      ctx.drawImage(
        sprites[Math.round(shade * (SHADES - 1))],
        f.cx + sx * radius - s / 2,
        f.cy - sy * radius - s / 2,
        s,
        s,
      );
    }
    ctx.restore();
  };

  /** Works a shape out now (a few ms), so the first frame of its morph doesn't wait for it. */
  const prepare = (shape: Shape) => void target(shape);

  return { n, draw, prepare };
}

export type Field = ReturnType<typeof createField>;
