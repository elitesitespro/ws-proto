"use client";

import { useEffect, useEffectEvent, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { useMotionValue, useScroll } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Icon, type IconName } from "@/components/icon";
import { tick } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { hueAttrs, platformDetails, type ShowcasePlatformName } from "../platform-showcase-content";
import { FIRST_TURN, TURN_ACTIVE, TURN_IDLE, acrossFor, dotsFor, drawGlobe, globePoints, talking } from "./globe-draw";
import { dockLift } from "./vivid-handoff";
import { VIVID_URL } from "./vivid-links";
import styles from "./vivid-switchboard.module.css";

// Where the wallet lives: the hub, at the live site
const HUB_URL = "https://www.worldstreetgold.com/";

type Route = {
  /** What you ask, in your own words. */
  ask: string;
  /** Where Vivid points you, and what it says. */
  place: string;
  icon: IconName;
  hue: { "data-hue": string; style?: CSSProperties };
  answer: string;
  href: string;
  /** Only Vivid Pro does this. */
  pro?: boolean;
  /** It works on every platform: they all light round the globe. */
  everywhere?: boolean;
};

// What people ask, and where Vivid sends them: one each from money, health
// and markets, and one only Pro does. The first is the one the dashboard's
// dock was asking as its globe lifted off. Every answer is no more than
// Vivid does: it explains, and shows you where things are (and on Pro,
// watches prices); it never says what to buy or sell.
const ROUTES: readonly Route[] = [
  {
    ask: "How do I add money?",
    place: "Wallet",
    icon: "wallet",
    hue: { "data-hue": "gold" },
    answer: "Tap Add money on your wallet card, pick a currency and pay. The same money works on every platform.",
    href: HUB_URL,
    everywhere: true,
  },
  {
    ask: "I need to see a doctor today.",
    place: "WorldHealth",
    icon: "heart-pulse",
    hue: hueAttrs("WorldHealth"),
    answer: "WorldHealth has doctors online, so you can see one from your phone. It isn’t for emergencies.",
    href: platformDetails.WorldHealth.href,
  },
  {
    ask: "What’s a pip?",
    place: "Forex",
    icon: "chart-up",
    hue: hueAttrs("Forex"),
    answer: "The smallest move a currency pair’s price makes: 0.0001 for most pairs. You’ll find Forex under Trade.",
    href: platformDetails.Forex.href,
  },
  {
    ask: "Tell me if Bitcoin drops below $60,000.",
    place: "Crypto",
    icon: "bitcoin",
    hue: hueAttrs("Crypto"),
    answer: "I’ll watch the price for you, and tell you the moment it does.",
    href: platformDetails.Crypto.href,
    pro: true,
  },
];

// All thirteen, round the globe on a phone
const PLATFORMS = Object.keys(platformDetails) as ShowcasePlatformName[];

// The dock's globe, and the big one's dots across its face
const DOCK = 40;
// The globe lifts off once the dock's this far down the screen
const DOCK_SEEN = 0.72;
const BIG = 18;
// How long one route stays lit before the next, once the globe has landed
// (on a phone, where the next one slides in, long enough to read the answer)
const CYCLE_MS = 2800;
const CYCLE_NARROW_MS = 5200;
// Where the routes are a row you swipe through the globe, not laid across
const NARROW = "(max-width: 1023px)";
const watchNarrow = (change: () => void) => {
  const query = window.matchMedia(NARROW);
  query.addEventListener("change", change);
  return () => query.removeEventListener("change", change);
};
// How long the globe talks when a route lights, and the rings it gives off
const SPEAK_MS = 1300;
const RINGS = [80, 460];
const RING_LIFE = 1500;
// The wires meet the globe across this much of its side (radians either way
// of level), a little off its dots
const SPREAD = 0.62;
const WIRE_GAP = 10;

const clamp = (v: number) => Math.min(Math.max(v, 0), 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

type Wires = { w: number; h: number; ins: string[]; outs: string[]; stem: string };

/**
 * Vivid as the way through all thirteen platforms. Questions come in from
 * the left, in people's own words; each runs into Vivid's globe and out to
 * the right, to the platform that answers it, in that platform's colour,
 * with what Vivid says. Everything's on the page at once, so nothing waits
 * to be read: one route at a time lights up as the globe talks it through.
 * Your own question comes in from below. On a phone the board stands up:
 * each route's question sits over the globe and its answer under it, and
 * you swipe them through.
 *
 * The globe is the dashboard's: as this comes up the screen it lifts off
 * the dock (../vivid-handoff) and flies down into its place here, growing.
 */
export function VividSwitchboard() {
  const reduce = useReducedMotion();
  const boardRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const composerRef = useRef<HTMLFormElement>(null);
  const routesRef = useRef<HTMLOListElement>(null);
  const askRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  // The globe wakes while it's hovered, or while you're typing to it
  const woken = useRef(false);
  // A route has just lit: the globe talks it through
  const spoke = useRef(false);
  // Starts the globe's drawing, if it's stopped
  const kick = useRef<(() => void) | null>(null);

  const [wires, setWires] = useState<Wires | null>(null);
  const [active, setActive] = useState(0);
  const [pointed, setPointed] = useState<number | null>(null);
  const [typing, setTyping] = useState(false);
  const [landed, setLanded] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const shown = pointed ?? active;
  const narrow = useSyncExternalStore(watchNarrow, () => window.matchMedia(NARROW).matches, () => false);
  // On a phone: you've swiped or tapped, so the routes stay where you put them
  const [held, setHeld] = useState(false);
  // The route the row's gliding to, while it does
  const steering = useRef<number | null>(null);

  // The flight, 0 to 1: from when the dock's in sight, low on the screen
  // (or this half a screen off, if it's further), to when the globe's place
  // here is in the middle of it
  const { scrollY } = useScroll();
  const flight = useMotionValue(0);
  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;
    const follow = () => {
      const vh = window.innerHeight;
      const s = slot.getBoundingClientRect();
      const to = s.top + s.height / 2 - vh / 2;
      const dock = document.querySelector("[data-vivid-dock]")?.getBoundingClientRect();
      const from = Math.min(dock ? dock.top + dock.height / 2 - vh * DOCK_SEEN : to, to - vh / 2);
      // Both measured from where the page is now
      const q = clamp(-from / (to - from));
      flight.set(q);
      if (!reduce) dockLift.set(q);
      // In the air, it's drawn even before the board's in sight
      if (q > 0 && q < 1) kick.current?.();
    };
    follow();
    const unsubscribe = scrollY.on("change", follow);
    window.addEventListener("resize", follow);
    return () => {
      unsubscribe();
      window.removeEventListener("resize", follow);
      dockLift.set(0);
    };
  }, [scrollY, flight, reduce]);

  useEffect(() => {
    spoke.current = true;
  }, [shown]);

  /** Light route `i`; on a phone, the row glides it in under the globe. */
  const go = (i: number) => {
    setActive(i);
    const row = routesRef.current;
    const slide = row?.children[i] as HTMLElement | undefined;
    if (!row || !slide || !window.matchMedia(NARROW).matches) return;
    steering.current = i;
    row.scrollTo({ left: slide.offsetLeft - (row.firstElementChild as HTMLElement).offsetLeft, behavior: "smooth" });
  };
  const next = useEffectEvent(() => go((active + 1) % ROUTES.length));

  // Once it's here and on screen, the routes light in turn (hovering or
  // focusing one holds it; on a phone, swiping or tapping stops it)
  const cycling = landed && onScreen && !reduce && pointed === null && !typing && !(narrow && held);
  useEffect(() => {
    if (!cycling) return;
    const timer = window.setTimeout(next, narrow ? CYCLE_NARROW_MS : CYCLE_MS);
    return () => window.clearTimeout(timer);
  }, [cycling, narrow, active]);

  // Swiped along the row: the route under the globe lights
  const swiped = () => {
    const row = routesRef.current;
    const first = row?.firstElementChild as HTMLElement | null;
    if (!row || !first || !narrow) return;
    const step = first.offsetWidth + parseFloat(getComputedStyle(row).columnGap || "0");
    const at = Math.min(Math.max(Math.round(row.scrollLeft / step), 0), ROUTES.length - 1);
    if (steering.current !== null) {
      if (at === steering.current) steering.current = null;
      return;
    }
    if (at === active) return;
    setActive(at);
    tick();
  };

  // The wires, from where everything is laid out (only where the board is
  // laid out across: on a phone the routes stack, and their own lines join them)
  useEffect(() => {
    const board = boardRef.current;
    const slot = slotRef.current;
    if (!board || !slot) return;
    const wide = window.matchMedia("(min-width: 1024px)");
    const measure = () => {
      if (!wide.matches) return setWires(null);
      const box = board.getBoundingClientRect();
      const s = slot.getBoundingClientRect();
      const cx = s.left - box.left + s.width / 2;
      const cy = s.top - box.top + s.height / 2;
      const r = s.width / 2 + WIRE_GAP;
      const ins: string[] = [];
      const outs: string[] = [];
      ROUTES.forEach((_, i) => {
        const ask = askRefs.current[i]?.getBoundingClientRect();
        const card = cardRefs.current[i]?.getBoundingClientRect();
        if (!ask || !card) return;
        // Top route meets the globe high on its side, the last low
        const a = SPREAD * (ROUTES.length > 1 ? 1 - (2 * i) / (ROUTES.length - 1) : 0);
        const [cos, sin] = [Math.cos(a), Math.sin(a)];
        // In: from the end of the question, level, curving to meet the globe square on
        const x0 = ask.right - box.left + 20;
        const y0 = ask.top - box.top + ask.height / 2;
        const ex = cx - r * cos;
        const ey = cy - r * sin;
        const reach = ex - x0;
        ins.push(
          `M${x0} ${y0}C${x0 + reach * 0.55} ${y0} ${ex - cos * reach * 0.35} ${ey - sin * reach * 0.35} ${ex} ${ey}`,
        );
        // Out: the same, mirrored, to the platform
        const ox = cx + r * cos;
        const x1 = card.left - box.left - 20;
        const y1 = card.top - box.top + card.height / 2;
        const out = x1 - ox;
        outs.push(
          `M${ox} ${ey}C${ox + cos * out * 0.35} ${ey - sin * out * 0.35} ${x1 - out * 0.55} ${y1} ${x1} ${y1}`,
        );
      });
      // Your own question, straight up into it
      const box2 = composerRef.current?.getBoundingClientRect();
      const stem = box2 ? `M${cx} ${box2.top - box.top - 14}L${cx} ${cy + r}` : "";
      setWires({ w: box.width, h: box.height, ins, outs, stem });
    };
    const resized = new ResizeObserver(measure);
    for (const el of [board, slot, composerRef.current, ...askRefs.current, ...cardRefs.current]) {
      if (el) resized.observe(el);
    }
    wide.addEventListener("change", measure);
    return () => {
      resized.disconnect();
      wide.removeEventListener("change", measure);
    };
  }, []);

  // The globe: flying down from the dock (on a canvas over the page), then
  // in its place (on its own), turning, and talking as each route lights
  useEffect(() => {
    const board = boardRef.current;
    const slot = slotRef.current;
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    const ctx = canvas?.getContext("2d");
    const octx = overlay?.getContext("2d");
    if (!board || !slot || !canvas || !overlay || !ctx || !octx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // The dock's globe, dot for dot, and the bigger one it grows into
    const across = acrossFor(DOCK);
    const small = globePoints(dotsFor(across));
    const big = globePoints(dotsFor(BIG));

    let dpr = 1;
    let side = 0;
    const fit = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      overlay.width = Math.round(overlay.clientWidth * dpr);
      overlay.height = Math.round(overlay.clientHeight * dpr);
      side = canvas.clientWidth;
      canvas.width = canvas.height = Math.round(side * dpr);
    };

    let turn = FIRST_TURN;
    let level = 0;
    let voiced = 0;
    let pace = 0;
    let speakUntil = 0;
    let rings: number[] = [];
    let here = false;
    let dirty = false;
    let raf = 0;
    let last = 0;

    /** The globe `width` across at x, y: the dock's coarse dots giving way to the fine ones as it grows. */
    const globe = (g: CanvasRenderingContext2D, x: number, y: number, width: number) => {
      const handover = clamp((width - DOCK) / 60);
      for (const [pts, dots, fade] of [
        [small, across, 1 - handover],
        [big, BIG, handover],
      ] as const) {
        if (fade <= 0) continue;
        const dot = (width / dots) * 0.27;
        drawGlobe(g, pts, { cx: x, cy: y, radius: width / 2 - dot * 1.4 - 0.5, dot, turn, level, fade });
      }
    };

    const draw = (t: number) => {
      const dt = last ? Math.min(t - last, 100) : 16;
      last = t;
      const q = still ? 1 : flight.get();
      const flying = q > 0 && q < 1;
      const arrived = q >= 1;
      if (arrived !== here) {
        here = arrived;
        setLanded(arrived);
        // It lands talking: the dock's question gets its answer
        if (arrived) spoke.current = true;
      }
      if (spoke.current && here && !still) {
        spoke.current = false;
        speakUntil = t + SPEAK_MS;
        rings = RINGS.map((at) => t + at);
      }
      const speaking = t < speakUntil;
      voiced += ((speaking ? 1 : 0) - voiced) * (speaking ? 0.2 : 0.06);
      const wake = woken.current ? 1 : 0;
      level += (Math.max(talking(t) * voiced, wake * 0.35) - level) * 0.18;
      pace += (Math.max(flying ? 1 : 0, voiced, wake) - pace) * 0.04;
      turn = (turn + dt / lerp(TURN_IDLE, TURN_ACTIVE, pace)) % 1;

      if (dirty) {
        octx.setTransform(1, 0, 0, 1, 0, 0);
        octx.clearRect(0, 0, overlay.width, overlay.height);
        dirty = false;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const size = slot.clientWidth;

      if (flying) {
        // From the dock, wherever the page has it now, to its place here
        const s = slot.getBoundingClientRect();
        const dock = document.querySelector("[data-vivid-dock]")?.getBoundingClientRect();
        const from = dock?.width
          ? { x: dock.left + dock.width / 2, y: dock.top + dock.height / 2, w: dock.width }
          : { x: overlay.clientWidth / 2, y: overlay.clientHeight + DOCK, w: DOCK };
        const k = easeInOut(q);
        octx.setTransform(dpr, 0, 0, dpr, 0, 0);
        globe(octx, lerp(from.x, s.left + s.width / 2, k), lerp(from.y, s.top + s.height / 2, k), lerp(from.w, size, k));
        dirty = true;
      } else if (arrived) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const c = side / 2;
        // Rings off it as it starts to talk
        ctx.strokeStyle = "#eab308";
        ctx.lineWidth = 1;
        for (const at of rings) {
          const age = t - at;
          if (age < 0 || age > RING_LIFE) continue;
          const p = age / RING_LIFE;
          ctx.globalAlpha = (1 - p) ** 2 * 0.45;
          ctx.beginPath();
          ctx.arc(c, c, (size / 2) * (1.02 + 0.42 * easeInOut(p)), 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        globe(ctx, c, c, size);
      }
      if (still) return;
      // It runs while the board's in sight or the globe's in the air
      if (visible || flying) raf = requestAnimationFrame(draw);
      else stop();
    };

    let visible = false;
    const start = () => {
      if (raf || still) return;
      last = 0;
      raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      if (dirty) {
        octx.setTransform(1, 0, 0, 1, 0, 0);
        octx.clearRect(0, 0, overlay.width, overlay.height);
        dirty = false;
      }
    };
    kick.current = start;
    const refit = () => {
      fit();
      if (still) draw(performance.now());
    };
    refit();
    const resized = new ResizeObserver(refit);
    resized.observe(slot);
    window.addEventListener("resize", refit);
    // Off screen (and not in the air), it all stops
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      setOnScreen(visible);
      if (visible) start();
    });
    io.observe(board);
    return () => {
      kick.current = null;
      stop();
      io.disconnect();
      resized.disconnect();
      window.removeEventListener("resize", refit);
    };
  }, [flight]);

  // A pointer over a route, or focus on it, holds it (not a finger: that's
  // a swipe or a tap)
  const byFinger = (event: object) => "pointerType" in event && event.pointerType === "touch";
  const hold = (i: number) => (event: object) => {
    if (!byFinger(event)) setPointed(i);
  };
  const release = (i: number) => (event: object) => {
    if (byFinger(event)) return;
    setActive(i);
    setPointed(null);
  };

  return (
    <div ref={boardRef} className={styles.board}>
      <canvas ref={overlayRef} aria-hidden="true" className={styles.overlay} />
      {wires && (
        <svg
          aria-hidden="true"
          className={styles.wires}
          width={wires.w}
          height={wires.h}
          viewBox={`0 0 ${wires.w} ${wires.h}`}
        >
          {wires.ins.map((d, i) => (
            <path key={`in-${i}`} d={d} className={styles.wire} data-on={i === shown || undefined} />
          ))}
          {wires.outs.map((d, i) => (
            <path key={`out-${i}`} d={d} className={styles.wire} data-on={i === shown || undefined} />
          ))}
          {wires.stem && <path d={wires.stem} className={styles.wire} data-on={typing || undefined} />}
        </svg>
      )}

      <p className={cn(styles.label, styles.labelAsk)}>You ask</p>
      <p className={cn(styles.label, styles.labelWhere)}>Vivid shows you where</p>

      <ol
        ref={routesRef}
        className={styles.routes}
        onScroll={swiped}
        onPointerDown={(event) => {
          if (event.pointerType !== "touch") return;
          // A finger takes over, even mid-glide
          steering.current = null;
          setHeld(true);
        }}
      >
        {ROUTES.map((route, i) => (
          <li
            key={route.ask}
            className={styles.route}
            data-on={i === shown || undefined}
            onPointerEnter={hold(i)}
            onPointerLeave={release(i)}
          >
            <p
              ref={(el) => {
                askRefs.current[i] = el;
              }}
              className={styles.ask}
            >
              <span className="sr-only">You ask: </span>“{route.ask}”
            </p>
            <a
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              href={route.href}
              target="_blank"
              rel="noopener"
              {...route.hue}
              className={styles.card}
              onFocus={hold(i)}
              onBlur={release(i)}
            >
              <span aria-hidden="true" className={styles.tile}>
                <Icon name={route.icon} size={20} tone="current" />
              </span>
              <span className={styles.place}>
                <span className="sr-only">Vivid points you to </span>
                {route.place}
                {route.pro && <span className={styles.pro}>Pro</span>}
              </span>
              <span className={styles.answer}>{route.answer}</span>
              <Icon name="arrow-up-right" size={20} tone="current" className={styles.go} />
            </a>
          </li>
        ))}
      </ol>
      {/* On a phone: which route's under the globe, filling while it waits
          for the next. Tap one to go to it (the routes' own links are the
          way through for a keyboard or a screen reader). */}
      <div aria-hidden="true" className={styles.dots}>
        {ROUTES.map((route, i) => (
          <button
            key={route.ask}
            type="button"
            tabIndex={-1}
            data-on={i === active || undefined}
            onClick={() => {
              setHeld(true);
              go(i);
            }}
          >
            {i === active && cycling && <i style={{ animationDuration: `${CYCLE_NARROW_MS}ms` }} />}
          </button>
        ))}
      </div>

      <div ref={slotRef} className={styles.slot}>
        {/* On a phone, the question runs down into the globe and out to the answer */}
        <i aria-hidden="true" className={cn(styles.feed, styles.feedIn)} />
        <i aria-hidden="true" className={cn(styles.feed, styles.feedOut)} />
        {/* And every platform goes round it, the one it's sending you to lit */}
        <span aria-hidden="true" className={styles.orbit} data-all={ROUTES[shown].everywhere || undefined}>
          {PLATFORMS.map((name, k) => {
            const hue = hueAttrs(name);
            return (
              <i
                key={name}
                data-hue={hue["data-hue"]}
                data-on={ROUTES[shown].place === name || undefined}
                style={{ ...hue.style, "--k": k } as CSSProperties}
              />
            );
          })}
        </span>
        <canvas ref={canvasRef} aria-hidden="true" className={styles.canvas} />
        <a
          href={VIVID_URL}
          target="_blank"
          rel="noopener"
          aria-label="Open Vivid"
          className={styles.globeLink}
          onPointerEnter={() => (woken.current = true)}
          onPointerLeave={() => (woken.current = false)}
        >
          <span className={styles.tip}>Open Vivid</span>
        </a>
      </div>

      {/* Your own question opens Vivid with it typed in its box (?q=) */}
      <form
        ref={composerRef}
        id="vivid-question"
        action={VIVID_URL}
        method="get"
        target="_blank"
        className={styles.composer}
        onFocus={() => {
          woken.current = true;
          setTyping(true);
        }}
        onBlur={() => {
          woken.current = false;
          setTyping(false);
        }}
      >
        <label className="sr-only" htmlFor="vivid-ask">
          Ask Vivid anything
        </label>
        <input
          id="vivid-ask"
          name="q"
          required
          autoComplete="off"
          placeholder="Ask your own question…"
          className={styles.input}
        />
        <button type="submit" className={styles.send} aria-label="Ask Vivid">
          <Icon name="arrow-up" size={20} tone="current" />
        </button>
      </form>
      <p className={styles.fine}>Free with your account. Vivid AI can make mistakes, so check anything important.</p>
    </div>
  );
}
