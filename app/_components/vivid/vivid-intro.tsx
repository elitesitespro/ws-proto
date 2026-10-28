"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { motion, useMotionValue, useScroll, useTransform } from "motion/react";
import { Icon } from "@/components/icon";
import { useMediaQuery } from "@/lib/use-media-query";
import { usePauseOffscreen } from "@/lib/use-pause-offscreen";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { hueAttrs } from "../platform-showcase-content";
import { platforms } from "../platform-timeline-section";
import { FIRST_TURN, TURN_ACTIVE, TURN_IDLE, acrossFor, dotsFor, drawGlobe, globePoints, talking } from "./globe-draw";
import { PILL_H, dockLift, pillDock } from "./vivid-handoff";
import { SPHERE } from "./vivid-pill-shape";
import styles from "./vivid-intro.module.css";

// The dashboard dock's globe (px). It lifts off once the dock's this far down
// the screen, over at least this much of a screen's scroll
const DOCK = 40;
const DOCK_SEEN = 0.72;
const MIN_LIFT = 0.6;
// Dots across the big globe's face: globe-draw's most, so up close it's the
// same object as the dock's, only nearer
const BIG_DOTS = 18;
// Shrinking toward a small globe (the dock's, the pill's), the small one's
// coarser dots take over across this many px
const HANDOVER = 64;
// The canvas has room past the globe's rim for its dots as they swell
const PAD = 1.1;
// Between the globe's rim and a filament, and a filament and its mark (px);
// and the shortest filament light runs along
const GAP = 6;
const MIN_RUN = 28;

// The beats, over the stretch the stage is held (0 to 1; before it, -1 to 0
// is the lift-off, as the stage comes up the screen). It never waits: as you
// scroll, something is always on the move.
// The thirteen come in one after another, each over ARRIVE_EACH
const ARRIVE_FROM = 0.03;
const ARRIVE_STAGGER = 0.018;
const ARRIVE_EACH = 0.17;
// The globe draws back from its close-up as they gather round it
const RECEDE = [0.02, 0.34] as const;
// A ring goes out from it to them as they connect
const WAVE = [0.3, 0.46] as const;
// Light runs along the filaments, in and out: coming up, then going
const LIVE = [0.34, 0.42, 0.58, 0.64] as const;
// They fold into the globe, one just after another
const FOLD = [0.6, 0.72] as const;
const FOLD_STAGGER = 0.003;
// Then it falls into the pill at the foot of the screen; the stage lets go
// soon after it lands
const DROP = [0.7, 0.93] as const;
// The last line comes in as it starts to fall, and comes down a little with it
const HANDOFF_IN = [0.7, 0.78];
const HANDOFF_FALL = 36;
// Its trail, like a long exposure (in the fall's own units, 0 to 1): how far
// back up the path it reaches, how soon it shows, and how soon after landing
// its tail runs in after it and it's gone. Drawn on a bar this long (px),
// only ever scaled down.
const TRAIL = 0.5;
const TRAIL_IN = 0.12;
const TRAIL_OUT = 0.25;
const TRAIL_W = 480;
const TRAIL_H = 14;
// As it settles into the pill, a ring goes out from there once: from the
// pill's circle to this size (px), over this long
const RIPPLE = 240;
const RIPPLE_MS = 1200;
// How far round the orbit they travel as you scroll the whole stretch
// (radians), and how far they swirl coming in and folding away
const GLIDE = 0.5;
const SWIRL_IN = 0.9;
const SWIRL_OUT = 1.1;
// Where the glide is at zero: the orbit as it's measured, and as it's shown still
const SETTLED = 0.5;

// The thirteen round the globe, a step apart from the top, each nudged round
// (radians) and in or out (a share of the orbit), so they read as a
// constellation more than a clock face
const NUDGE = [0, 0.07, -0.05, 0.04, -0.08, 0.05, 0, -0.04, 0.08, -0.05, 0.03, -0.07, 0.05];
const REACH = [1, 0.88, 0.97, 0.87, 1, 0.92, 0.86, 0.99, 0.9, 1, 0.87, 0.95, 0.9];
const NEAREST = Math.min(...REACH);
const ANGLES = platforms.map((_, k) => -Math.PI / 2 + (k * 2 * Math.PI) / platforms.length + NUDGE[k]);

const clamp = (v: number) => Math.min(Math.max(v, 0), 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeIn = (t: number) => t ** 3;
/** 0 before `a`, 1 after `b`, eased between. */
const span = (v: number, a: number, b: number) => easeInOut(clamp((v - a) / (b - a)));
/** Up and back down again between `a` and `b`. */
const bump = (v: number, a: number, b: number) => Math.sin(Math.PI * clamp((v - a) / (b - a)));

type Geo = {
  /** The globe's size as it arrives from the dock, its biggest; and the canvas's, with room. */
  big: number;
  canvas: number;
  /** Its size with the thirteen round it. */
  wake: number;
  /** The orbit's centre and radii, on the stage (and so on the screen, while it's held). */
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  /** Half a mark; and from the centre to past the stage's far corner. */
  half: number;
  far: number;
  /** The ring's size at full stretch. */
  wave: number;
  /** How far the stage is held (px). */
  pin: number;
};

/**
 * Vivid, introduced. The wallet's Ask Vivid globe lifts out of its dock as
 * the lights go down, and rises into the middle of the night, big. It wakes:
 * all thirteen platforms swirl in from the edges into an orbit round it, each
 * on a filament, with light running in and out along them, because all of
 * WorldStreet runs through it. Then they fold into it, and it falls to the
 * foot of the screen trailing light, into the ask pill that rides along from
 * then on, and a ring goes out as it settles there (../vivid-handoff:
 * dockLift as it leaves the dock, pillDock as it lands).
 *
 * Scrubbed by the scroll, start to finish, on a stage held by the browser
 * (sticky); every frame is transforms and opacity from one handler, and one
 * canvas for the globe, drawn at its biggest and scaled down. With reduced
 * motion it's a still picture: the globe with the thirteen round it.
 */
export function VividIntro() {
  const reduce = useReducedMotion();
  const wide = useMediaQuery("(min-width: 1024px)");
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const netRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const hazeRef = useRef<HTMLSpanElement>(null);
  const waveRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<HTMLElement>(null);
  const rippleRef = useRef<HTMLElement>(null);
  const markRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const spokeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  usePauseOffscreen(trackRef);

  // Where the intro is: -1 to 0 lifting off, 0 to 1 held (see the beats above)
  const { scrollY } = useScroll();
  const time = useMotionValue(-1);
  // The words, a block at a time. On a phone the name gives way to what it
  // is in the same place, one gone as the other comes; laid across, the two
  // stand together.
  const meetAt = wide ? [-0.5, -0.1, 0.6, 0.68] : [-0.5, -0.1, 0.27, 0.33];
  const meetOpacity = useTransform(time, meetAt, [0, 1, 1, 0]);
  const meetY = useTransform(time, meetAt, [32, 0, 0, -24]);
  const claimAt = wide ? [0.22, 0.34, 0.62, 0.7] : [0.33, 0.41, 0.6, 0.68];
  const claimOpacity = useTransform(time, claimAt, [0, 1, 1, 0]);
  const claimY = useTransform(time, claimAt, [24, 0, 0, -24]);
  const readoutOpacity = useTransform(time, [0.36, 0.44, 0.6, 0.66], [0, 1, 1, 0]);
  const handoffOpacity = useTransform(time, HANDOFF_IN, [0, 1]);
  // Down with the globe, gathering speed as it does
  const handoffY = useTransform(time, (t) => HANDOFF_FALL * clamp((t - DROP[0]) / (DROP[1] - DROP[0])) ** 2);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const frame = frameRef.current;
    const net = netRef.current;
    const orbit = orbitRef.current;
    const veil = veilRef.current;
    const haze = hazeRef.current;
    const wave = waveRef.current;
    const canvas = canvasRef.current;
    const trail = trailRef.current;
    const ripple = rippleRef.current;
    const ctx = canvas?.getContext("2d");
    if (!track || !stage || !frame || !net || !orbit || !veil || !haze || !wave || !canvas || !trail || !ripple || !ctx) {
      return;
    }
    const marks = markRefs.current;
    const spokes = spokeRefs.current;
    const lines = spokes.map((spoke) => spoke?.children[0] as HTMLElement | undefined);
    const wires = spokes.map((spoke) => spoke?.children[1] as HTMLElement | undefined);
    const markOn = platforms.map(() => false);

    // The big globe's dots, and the small globes' it hands over to at either
    // end, dot for dot as VividGlobe draws them at that size
    const bigPts = globePoints(dotsFor(BIG_DOTS));
    const dockAcross = acrossFor(DOCK);
    const dockPts = globePoints(dotsFor(dockAcross));
    const pillAcross = acrossFor(SPHERE);
    const pillPts = globePoints(dotsFor(pillAcross));

    let g: Geo | null = null;
    let dpr = 1;
    // What the globe's doing, for its drawing to read: on screen or not, how
    // big it's shown, the small globe it's nearest, and how awake it is
    const look = { shown: false, w: DOCK, near: "dock" as "dock" | "pill", nearW: DOCK, awake: 0, flare: 0, lift: 0, paceTo: 0 };
    let turn = FIRST_TURN;
    let level = 0;
    let pace = 0;
    let raf = 0;
    let last = 0;
    // Which stretch of the page the scroll was last in, well before or well past the intro
    let lastZone = "";
    // The dock's globe and the pill's marker, found once and kept while they're on the page
    let dockEl: Element | null = null;
    let anchorEl: Element | null = null;
    // The trail's on screen; where the fall was last time; the landing ring
    // playing, and whether it may play again (once the globe's been scrolled
    // back up out of the pill)
    let trailOn = false;
    let lastFall = 0;
    let rippling: Animation | null = null;
    let armed = true;
    const find = (el: Element | null, selector: string) => (el?.isConnected ? el : document.querySelector(selector));

    /** One set of dots, `fade` strong, drawn so that scaled down to `look.w` it's VividGlobe at that size. */
    const layer = (pts: Float32Array, across: number, fade: number) => {
      if (!g || fade <= 0) return;
      const dot = (g.big / across) * 0.27;
      const radius = g.big / 2 - dot * 1.4 - (0.5 * g.big) / Math.max(look.w, 1);
      drawGlobe(ctx, pts, { cx: g.canvas / 2, cy: g.canvas / 2, radius, dot, turn, level, fade });
    };
    const paint = () => {
      if (!g) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const handover = clamp((look.w - look.nearW) / HANDOVER);
      const dock = look.near === "dock";
      layer(dock ? dockPts : pillPts, dock ? dockAcross : pillAcross, 1 - handover);
      layer(bigPts, BIG_DOTS, handover);
    };

    const step = (now: number) => {
      const dt = last ? Math.min(now - last, 100) : 16;
      last = now;
      // A change of speed bends the turn rather than jumping it
      pace += (look.paceTo - pace) * 0.05;
      turn = (turn + dt / lerp(TURN_IDLE, TURN_ACTIVE, pace)) % 1;
      // Awake, it swells and brightens as if talking; taking the thirteen in, it flares
      const target = look.awake * (0.14 + talking(now) * 0.5) + look.flare * 0.5 + look.lift;
      level += (target - level) * 0.12;
      paint();
      raf = requestAnimationFrame(step);
    };
    const run = () => {
      if (raf || reduce || !look.shown || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(step);
    };
    const halt = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    /**
     * The thirteen and their filaments at `p`, round a globe `w` across at
     * `ox`, `oy` (the orbit's middle, until it starts down); `pulse`: how
     * much light runs.
     */
    const placeMarks = (p: number, w: number, pulse: number, ox: number, oy: number) => {
      if (!g) return;
      const r0 = w / 2 + GAP;
      for (let k = 0; k < platforms.length; k++) {
        const mark = marks[k];
        const spoke = spokes[k];
        const line = lines[k];
        const wire = wires[k];
        if (!mark || !spoke || !line || !wire) continue;
        const a = easeOut(clamp((p - ARRIVE_FROM - k * ARRIVE_STAGGER) / ARRIVE_EACH));
        const f = easeIn(clamp((p - FOLD[0] - k * FOLD_STAGGER) / (FOLD[1] - FOLD[0])));
        if (a <= 0 || f >= 1) {
          if (markOn[k]) {
            mark.style.opacity = spoke.style.opacity = "0";
            markOn[k] = false;
          }
          continue;
        }
        markOn[k] = true;
        // Its place on the orbit, carried round as you scroll; it swirls in
        // from past the edge to there, and swirls on into the globe
        const angle = ANGLES[k] + GLIDE * (p - SETTLED);
        const tx = g.rx * REACH[k] * Math.cos(angle);
        const ty = g.ry * REACH[k] * Math.sin(angle);
        const toward = Math.atan2(ty, tx) - SWIRL_IN * (1 - a) + SWIRL_OUT * f;
        const reach = lerp(g.far, Math.hypot(tx, ty), a) * (1 - f);
        const scale = (0.6 + 0.4 * a) * (1 - 0.55 * f);
        const x = ox + Math.cos(toward) * reach;
        const y = oy + Math.sin(toward) * reach;
        mark.style.transform = `translate3d(${x - g.half}px, ${y - g.half}px, 0) scale(${scale})`;
        mark.style.opacity = String(Math.min(1, a * 2.5) * (1 - clamp((f - 0.45) / 0.45)));
        // Its filament reaches out from the globe to meet it as it comes,
        // and shortens with it as it folds in
        const drawn = clamp((a - 0.45) / 0.55);
        const length = Math.max(0, reach - g.half * scale - GAP - r0) * drawn;
        spoke.style.transform = `translate3d(${ox}px, ${oy}px, 0) rotate(${toward}rad)`;
        spoke.style.opacity = String(Math.min(1, drawn * 3) * (1 - f));
        line.style.transform = `translate3d(${r0}px, 0, 0) scaleX(${length / 100})`;
        wire.style.opacity = String(drawn >= 1 ? pulse * (1 - f) : 0);
      }
    };

    const render = () => {
      if (!g) return;
      const vh = window.innerHeight;
      const box = track.getBoundingClientRect();
      // Reduced motion: no flight; the pill takes over once the intro's end is on screen
      if (reduce) {
        pillDock.set(box.bottom <= vh + 1 ? 1 : 0);
        return;
      }
      // Well before it or well past it, nothing changes: settle once, then rest
      const zone = box.top > vh * 2.5 ? "before" : box.bottom < -vh ? "after" : "in";
      if (zone !== "in" && zone === lastZone) return;
      lastZone = zone;
      // The lift-off, 0 to 1: from when the dock's low on the screen (or
      // MIN_LIFT of a screen before the stage holds, if that's sooner) to
      // the stage holding. Both measured from where the page is now.
      const toPin = box.top;
      dockEl = find(dockEl, "[data-vivid-dock]");
      const dock = dockEl?.getBoundingClientRect();
      const docked = !!dock && dock.width > 0;
      const toLift = Math.min(docked ? dock.top + dock.height / 2 - vh * DOCK_SEEN : Infinity, toPin - vh * MIN_LIFT);
      const q = clamp(-toLift / (toPin - toLift));
      const p = clamp(-toPin / g.pin);
      const at = q < 1 ? q - 1 : p;
      // The fall, 0 to 1, and on past 1 once it's landed (for the trail's tail)
      const fall = q < 1 ? 0 : (p - DROP[0]) / (DROP[1] - DROP[0]);
      const d = clamp(fall);
      time.set(at);
      dockLift.set(q);
      pillDock.set(d);
      // Down from the orbit's middle to the middle of the circle the pill is
      // born as (looked up only when it's wanted); it falls, so it gathers speed
      let pill: { x: number; y: number } | null = null;
      const pillMid = () => {
        if (pill) return pill;
        anchorEl = find(anchorEl, "[data-vivid-pill-anchor]");
        const a = anchorEl?.getBoundingClientRect();
        pill =
          a && (a.top || a.left)
            ? { x: a.left + a.width / 2, y: a.top + a.height / 2 }
            : { x: stage.clientWidth / 2, y: vh - 12 - PILL_H / 2 };
        return pill;
      };
      const orbitMid = { x: g.cx, y: g.cy };
      const fallAt = (e: number) => ({
        x: lerp(orbitMid.x, pillMid().x, easeInOut(e)),
        y: lerp(orbitMid.y, pillMid().y, e * e),
      });

      // The lights go down on the wallet as the globe lifts out of it
      const dim = q > 0 && q < 1 ? span(at, -0.95, -0.45) * 0.92 : 0;
      veil.style.opacity = String(dim);
      veil.style.visibility = dim > 0 ? "visible" : "hidden";

      // The globe: out of the dock, quickly clear of it and growing as it
      // comes to the middle; then drawing back as the thirteen gather; then
      // down, shrinking, into the pill (it falls, so it gathers speed)
      let x = g.cx;
      let y = g.cy;
      let w = g.big;
      if (q < 1) {
        const from = docked
          ? { x: dock.left + dock.width / 2, y: dock.top + dock.height / 2, w: dock.width }
          : { x: stage.clientWidth / 2, y: vh + DOCK, w: DOCK };
        x = lerp(from.x, g.cx, easeOut(q));
        y = lerp(from.y, g.cy, easeOut(q));
        w = lerp(from.w, g.big, easeInOut(q));
        look.near = "dock";
        look.nearW = from.w;
        look.flare = 0;
      } else {
        look.flare = bump(p, FOLD[0] + 0.03, FOLD[1] + 0.04);
        w = lerp(g.big, g.wake, span(p, RECEDE[0], RECEDE[1])) * (1 + 0.06 * look.flare);
        look.near = "pill";
        look.nearW = SPHERE;
        if (d > 0) {
          ({ x, y } = fallAt(d));
          // It lands the size of the pill's own globe
          w = lerp(w, SPHERE, easeInOut(d));
        }
      }
      look.w = w;
      look.awake = q < 1 ? 0 : span(p, 0.06, 0.36) * (1 - span(p, DROP[0], DROP[0] + 0.08));
      look.lift = q < 1 ? 0.12 * q : 0;
      look.paceTo = q < 1 ? q : 1 - span(p, DROP[0], DROP[1]);
      const shown = q > 0 && d < 1;
      if (shown) canvas.style.transform = `translate3d(${x - g.canvas / 2}px, ${y - g.canvas / 2}px, 0) scale(${w / g.big})`;
      if (shown !== look.shown) {
        look.shown = shown;
        canvas.style.visibility = shown ? "visible" : "hidden";
        if (shown) {
          paint();
          run();
        } else halt();
      }

      // Its trail as it falls: a streak of the street's light from where it
      // was a while back to just inside it, thin and bright at the globe,
      // fading back up the path. Once it's landed the tail runs in after it.
      const streak = fall > 0 ? clamp(fall / TRAIL_IN) * (1 - clamp((fall - 1) / TRAIL_OUT)) : 0;
      let length = 0;
      if (streak > 0) {
        const head = fallAt(d);
        const tail = fallAt(clamp(d - TRAIL * (1 - clamp((fall - 1) / TRAIL_OUT))));
        const angle = Math.atan2(head.y - tail.y, head.x - tail.x);
        length = Math.hypot(head.x - tail.x, head.y - tail.y) - (w / 2) * 0.35;
        if (length > 1) {
          trail.style.transform = `translate3d(${tail.x}px, ${tail.y - TRAIL_H / 2}px, 0) rotate(${angle}rad) scaleX(${
            length / TRAIL_W
          })`;
          trail.style.opacity = String(streak);
        }
      }
      const streaking = length > 1;
      if (streaking !== trailOn) {
        trailOn = streaking;
        trail.style.visibility = trailOn ? "visible" : "hidden";
      }

      // Settled into the pill: one ring goes out from it, once. It plays by
      // the clock and ends unseen, so it can't stick; it's cancelled (and may
      // play again) once the globe's been scrolled back up out of the pill.
      if (d >= 1 && lastFall > 0 && lastFall < 1 && armed) {
        armed = false;
        rippling?.cancel();
        const { x: px, y: py } = pillMid();
        const place = `translate3d(${px - RIPPLE / 2}px, ${py - RIPPLE / 2}px, 0)`;
        rippling = ripple.animate(
          [
            { transform: `${place} scale(${PILL_H / RIPPLE})`, opacity: 0.9 },
            { transform: `${place} scale(1)`, opacity: 0 },
          ],
          { duration: RIPPLE_MS, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
        );
      } else if (d < 0.9 && !armed) {
        armed = true;
        rippling?.cancel();
        rippling = null;
      }
      lastFall = fall;

      // The light round it, and the ring it sends out to the thirteen
      haze.style.opacity = String(q < 1 ? 0 : span(p, 0.08, 0.4) * (1 - span(p, DROP[0], DROP[0] + 0.14)));
      const ring = q < 1 ? 0 : clamp((p - WAVE[0]) / (WAVE[1] - WAVE[0]));
      if (ring > 0 && ring < 1) {
        const size = lerp(w / g.wave, 1, easeOut(ring));
        wave.style.transform = `translate3d(${g.cx - g.wave / 2}px, ${g.cy - g.wave / 2}px, 0) scale(${size})`;
        wave.style.opacity = String(0.6 * Math.min(1, ring * 6) * (1 - ring));
      } else wave.style.opacity = "0";

      // The thirteen; the light only runs (and its animations only play) while it shows
      const live = q >= 1 && p > LIVE[0] && p < LIVE[3];
      if (live !== orbit.hasAttribute("data-live")) orbit.toggleAttribute("data-live", live);
      const pulse = clamp((p - LIVE[0]) / (LIVE[1] - LIVE[0])) * (1 - clamp((p - LIVE[2]) / (LIVE[3] - LIVE[2])));
      placeMarks(q < 1 ? 0 : p, w, pulse, x, y);
    };

    /** Reduced motion: the picture, still: the globe awake with the thirteen round it. */
    const settle = () => {
      if (!g) return;
      dockLift.set(0);
      veil.style.visibility = "hidden";
      haze.style.opacity = "1";
      wave.style.opacity = "0";
      look.w = g.wake;
      look.near = "pill";
      look.nearW = SPHERE;
      look.shown = true;
      level = 0.12;
      canvas.style.transform = `translate3d(${g.cx - g.canvas / 2}px, ${g.cy - g.canvas / 2}px, 0) scale(${g.wake / g.big})`;
      canvas.style.visibility = "visible";
      paint();
      placeMarks(SETTLED, g.wake, 0, g.cx, g.cy);
      render();
    };

    const measure = () => {
      lastZone = "";
      const s = stage.getBoundingClientRect();
      const n = net.getBoundingClientRect();
      const sw = stage.clientWidth;
      const sh = stage.clientHeight;
      // The screen's height with the browser's bars showing (the frame's 100svh)
      const svh = reduce ? window.innerHeight : frame.clientHeight;
      const half = (marks[0]?.offsetWidth || 36) / 2;
      const rx = Math.max(n.width / 2 - half - 2, 48);
      const ry = Math.max(n.height / 2 - half - 2, 48);
      const cx = n.left - s.left + n.width / 2;
      const cy = n.top - s.top + n.height / 2;
      // Big as it arrives (a phone's two-thirds across; a laptop's half its
      // height), then back enough that the nearest of the thirteen has a
      // filament's length to spare
      const big = Math.round(
        sw >= 1024
          ? Math.min(sw * 0.36, svh * 0.56, 560)
          : sw >= 768
            ? Math.min(sw * 0.6, svh * 0.4)
            : Math.min(sw * 0.72, svh * 0.42),
      );
      const wake = Math.round(Math.max(Math.min(big * 0.82, 2 * (Math.min(rx, ry) * NEAREST - half - 20)), 96));
      g = {
        big,
        canvas: Math.round(big * PAD),
        wake,
        cx,
        cy,
        rx,
        ry,
        half,
        far: Math.hypot(Math.max(cx, sw - cx), Math.max(cy, sh - cy)) + half * 2,
        wave: Math.round(2 * Math.max(rx, ry)),
        pin: Math.max(track.offsetHeight - stage.offsetHeight, 1),
      };
      // The canvas, at the biggest the globe gets, so it's only ever scaled down
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.style.width = canvas.style.height = `${g.canvas}px`;
      canvas.width = canvas.height = Math.round(g.canvas * dpr);
      // The light round the globe, and the ring it sends out
      const glow = Math.round(wake * 2.6);
      haze.style.width = haze.style.height = `${glow}px`;
      haze.style.transform = `translate3d(${cx - glow / 2}px, ${cy - glow / 2}px, 0)`;
      wave.style.width = wave.style.height = `${g.wave}px`;
      // Each filament's run of light, from the globe's rim to its mark, where the orbit settles
      spokes.forEach((spoke, k) => {
        if (!spoke) return;
        const tx = rx * REACH[k] * Math.cos(ANGLES[k]);
        const ty = ry * REACH[k] * Math.sin(ANGLES[k]);
        const r0 = wake / 2 + GAP;
        const run = Math.max(Math.hypot(tx, ty) - half - GAP - r0, 0);
        spoke.style.setProperty("--r0", `${r0}px`);
        spoke.style.setProperty("--len", `${run}px`);
        // Too short a run for a bead of light to travel
        spoke.toggleAttribute("data-short", run < MIN_RUN);
      });
      if (reduce) settle();
      else {
        render();
        if (look.shown) paint();
      }
    };

    measure();
    const resized = new ResizeObserver(measure);
    resized.observe(stage);
    resized.observe(net);
    const unsubscribe = scrollY.on("change", render);
    // A phone's bars coming and going change the screen's height, and with it the lift-off
    window.addEventListener("resize", render);
    const onVisibility = () => (document.hidden ? halt() : run());
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      halt();
      unsubscribe();
      resized.disconnect();
      window.removeEventListener("resize", render);
      document.removeEventListener("visibilitychange", onVisibility);
      dockLift.set(0);
      pillDock.set(0);
      // Back to hidden, so a run that starts over (reduced motion switched) starts clean
      rippling?.cancel();
      canvas.style.visibility = veil.style.visibility = trail.style.visibility = "";
      orbit.removeAttribute("data-live");
      for (const el of [...marks, ...spokes]) el?.style.removeProperty("opacity");
    };
  }, [reduce, scrollY, time]);

  return (
    <div ref={trackRef} className={styles.track} style={{ "--pill": `${PILL_H}px` } as CSSProperties}>
      <div ref={veilRef} aria-hidden="true" className={styles.veil} />

      <div ref={stageRef} className={styles.stage}>
        {/* The thirteen, wired to the globe, laid out by the script from the stage's corner */}
        <div ref={orbitRef} aria-hidden="true" className={styles.orbit}>
          <span ref={hazeRef} className={styles.haze} />
          <span ref={waveRef} className={styles.wave} />
          {platforms.map((platform, k) => {
            const hue = hueAttrs(platform.name);
            return (
              <span
                key={platform.name}
                ref={(el) => {
                  spokeRefs.current[k] = el;
                }}
                className={styles.spoke}
                data-hue={hue["data-hue"]}
                style={{ ...hue.style, "--k": k } as CSSProperties}
              >
                <i className={styles.line} />
                {/* Light in from the platform, in its colour; out from Vivid, in gold */}
                <i className={styles.wire}>
                  <i className={styles.pulse} data-out={k % 2 === 1 || undefined} />
                </i>
              </span>
            );
          })}
          {platforms.map((platform, k) => {
            const hue = hueAttrs(platform.name);
            return (
              <span
                key={platform.name}
                ref={(el) => {
                  markRefs.current[k] = el;
                }}
                className={styles.mark}
                data-hue={hue["data-hue"]}
                style={hue.style}
              >
                <Icon name={platform.icon} size={wide ? 24 : 20} tone="current" />
              </span>
            );
          })}
        </div>

        <div ref={frameRef} className={cn(styles.frame, "mx-auto w-full max-w-7xl px-4 md:px-6")}>
          <motion.h2
            id="vivid-meet"
            className={styles.meet}
            style={reduce ? undefined : { opacity: meetOpacity, y: meetY }}
          >
            <span className={styles.meetSmall}>Meet</span>
            <span className={styles.meetBig}>Vivid.</span>
          </motion.h2>
          <motion.div className={styles.claim} style={reduce ? undefined : { opacity: claimOpacity, y: claimY }}>
            <p className={styles.claimLine}>The intelligence that runs all of WorldStreet.</p>
            <p className={styles.claimFine}>
              It knows every platform, answers in plain words and, with Pro, watches prices for you and sends money
              once you say yes.
            </p>
          </motion.div>
          {/* The orbit's room: the script measures it, and the thirteen go round its middle */}
          <div ref={netRef} className={styles.net} />
          <motion.p className={styles.handoff} style={reduce ? undefined : { opacity: handoffOpacity, y: handoffY }}>
            <span className={styles.handoffLine}>Now it rides with you.</span>
            <span className={styles.handoffFine}>Ask Vivid from anywhere.</span>
          </motion.p>
          <motion.p className={styles.readout} style={reduce ? undefined : { opacity: readoutOpacity }}>
            <i aria-hidden="true" className={styles.live} />
            13 platforms · 1 wallet · always on
          </motion.p>
        </div>
      </div>

      {/* The globe: over the page while it flies (fixed to the screen), on the stage while it's held */}
      <div aria-hidden="true" className={styles.sky}>
        <i ref={trailRef} className={styles.trail} />
        <canvas ref={canvasRef} className={styles.globe} />
        <i ref={rippleRef} className={styles.ripple} />
      </div>
    </div>
  );
}
