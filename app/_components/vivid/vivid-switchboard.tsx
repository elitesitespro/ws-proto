"use client";

import { useEffect, useEffectEvent, useRef, useState, type CSSProperties } from "react";
import { useMediaQuery } from "@/lib/use-media-query";
import { usePauseOffscreen } from "@/lib/use-pause-offscreen";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Icon, type IconName } from "@/components/icon";
import { PlatformIcon, platformGlow } from "@/components/ui/platform-icon";
import { tick } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { hueAttrs, platformDetails, type ShowcasePlatformName } from "../platform-showcase-content";
import { FIRST_TURN, TURN_ACTIVE, TURN_IDLE, dotsFor, drawGlobe, globePoints, talking } from "./globe-draw";
import { HUB } from "@/lib/hub";
import { VIVID_URL } from "./vivid-links";
import styles from "./vivid-switchboard.module.css";

// Where the wallet lives: the hub's wallet page
const WALLET_URL = `${HUB}/wallet`;

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
    href: WALLET_URL,
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

// Every platform, round the globe on a phone
const PLATFORMS = Object.keys(platformDetails) as ShowcasePlatformName[];

// The globe's dots across its face
const BIG = 18;
// How long one route stays lit before the next, once the board's in view.
// Standing up it goes slower, and stops for good once you tap a question:
// from then it's yours to work.
const CYCLE_MS = 2800;
const CYCLE_NARROW_MS = 4200;
// Where the board stands up
const NARROW = "(max-width: 1023px)";
// How long the globe talks when a route lights, and the rings it gives off
const SPEAK_MS = 1300;
const RINGS = [80, 460];
const RING_LIFE = 1500;
// The wires meet the globe across this much of its side (radians either way
// of level), a little off its dots
const SPREAD = 0.62;
const WIRE_GAP = 10;
// Standing up, the lit wire runs down the questions' right-hand gutter (clear
// of the words) and round into the globe's right side past the ring of
// platforms, the first question's highest
const SIDE_IN = [1.15, 0.8, 0.45, 0.1];
const RING_GAP = 30;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

type Wires = { w: number; h: number; ins: string[]; outs: string[] };

/**
 * Vivid as the way through every platform. Questions come in from the left,
 * in people's own words; each runs into Vivid's globe and out to the right,
 * to the platform that answers it, in that platform's colour, with what
 * Vivid says. Everything's on the page at once, so nothing waits to be read:
 * one route at a time lights up as the globe talks it through.
 *
 * On a phone or a tablet the board stands up, and nothing about it is worked
 * by the scroll: the four questions, all readable at once, each a button with
 * a jack in the gutter at its right; under them the globe, with the platforms
 * round it, and under that the answer. The lit question's wire runs down the
 * gutter (never across the words) and round into the globe, the platform that
 * answers lights on the ring, and its answer shows. While it's in view it
 * moves on to the next question by itself, slowly, until you tap one.
 *
 * The globe here is just part of the diagram: Vivid arrived in the intro
 * before it (./vivid-intro) and rides along in the pill.
 */
export function VividSwitchboard() {
  const reduce = useReducedMotion();
  const boardRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const askRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  // The globe wakes while it's hovered
  const woken = useRef(false);
  // A route has just lit: the globe talks it through
  const spoke = useRef(false);

  const [wires, setWires] = useState<Wires | null>(null);
  const [active, setActive] = useState(0);
  const [pointed, setPointed] = useState<number | null>(null);
  // Once you've picked a question yourself, it stops moving on by itself
  const [chosen, setChosen] = useState(false);
  const [inView, setInView] = useState(false);
  const shown = pointed ?? active;
  const narrow = useMediaQuery(NARROW);
  usePauseOffscreen(boardRef);

  useEffect(() => {
    spoke.current = true;
  }, [shown]);

  const next = useEffectEvent(() => setActive((active + 1) % ROUTES.length));

  // While the board's well in view, the routes light in turn (a pointer over
  // one, or focus on it, holds it; a tap takes over for good)
  const cycling = inView && !reduce && pointed === null && !chosen;
  useEffect(() => {
    if (!cycling) return;
    const timer = window.setTimeout(next, narrow ? CYCLE_NARROW_MS : CYCLE_MS);
    return () => window.clearTimeout(timer);
  }, [cycling, active, narrow]);

  /** A question picked: it lights, and stays until you pick another. */
  const pick = (i: number) => {
    setChosen(true);
    if (i === active) return;
    setActive(i);
    tick();
  };

  // The wires, from where everything is laid out
  useEffect(() => {
    const board = boardRef.current;
    const slot = slotRef.current;
    if (!board || !slot) return;
    const wide = window.matchMedia("(min-width: 1024px)");
    const measure = () => {
      const box = board.getBoundingClientRect();
      const s = slot.getBoundingClientRect();
      const cx = s.left - box.left + s.width / 2;
      const cy = s.top - box.top + s.height / 2;
      if (!wide.matches) {
        // Standing up: from each question's jack straight down the gutter at
        // the questions' right, past the last of them, then round into the
        // globe's right side past the ring; out of its foot, down to the answer
        const r = s.width / 2 + RING_GAP;
        const asks = askRefs.current.map((el) => el?.getBoundingClientRect());
        const below = Math.max(...asks.map((a) => (a ? a.bottom - box.top : 0))) + 6;
        const card = cardRefs.current[0]?.getBoundingClientRect();
        const ins = ROUTES.map((_, i) => {
          const ask = asks[i];
          if (!ask) return "";
          const jx = ask.right - box.left - 14;
          const jy = ask.top - box.top + ask.height / 2;
          const a = SIDE_IN[i] ?? 0;
          const ex = cx + r * Math.cos(a);
          const ey = cy - r * Math.sin(a);
          return `M${jx} ${jy}L${jx} ${below}C${jx} ${below + (ey - below) * 0.7} ${ex + Math.cos(a) * 44} ${ey - Math.sin(a) * 44} ${ex} ${ey}`;
        });
        const out = card ? `M${cx} ${cy + r}L${cx} ${card.top - box.top - 8}` : "";
        return setWires({ w: box.width, h: box.height, ins, outs: ROUTES.map(() => out) });
      }
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
      setWires({ w: box.width, h: box.height, ins, outs });
    };
    const resized = new ResizeObserver(measure);
    for (const el of [board, slot, ...askRefs.current, ...cardRefs.current]) {
      if (el) resized.observe(el);
    }
    wide.addEventListener("change", measure);
    return () => {
      resized.disconnect();
      wide.removeEventListener("change", measure);
    };
  }, []);

  // The globe in its place, turning, and talking as each route lights
  useEffect(() => {
    const board = boardRef.current;
    const slot = slotRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!board || !slot || !canvas || !ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const big = globePoints(dotsFor(BIG));

    let dpr = 1;
    let side = 0;
    const fit = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      side = canvas.clientWidth;
      canvas.width = canvas.height = Math.round(side * dpr);
    };

    let turn = FIRST_TURN;
    let level = 0;
    let voiced = 0;
    let pace = 0;
    let speakUntil = 0;
    let rings: number[] = [];
    let raf = 0;
    let last = 0;

    const draw = (t: number) => {
      const dt = last ? Math.min(t - last, 100) : 16;
      last = t;
      // It comes on screen talking: the dock's question gets its answer
      if (spoke.current && !still) {
        spoke.current = false;
        speakUntil = t + SPEAK_MS;
        rings = RINGS.map((at) => t + at);
      }
      const speaking = t < speakUntil;
      voiced += ((speaking ? 1 : 0) - voiced) * (speaking ? 0.2 : 0.06);
      const wake = woken.current ? 1 : 0;
      level += (Math.max(talking(t) * voiced, wake * 0.35) - level) * 0.18;
      pace += (Math.max(voiced, wake) - pace) * 0.04;
      turn = (turn + dt / lerp(TURN_IDLE, TURN_ACTIVE, pace)) % 1;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const size = slot.clientWidth;
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
      const dot = (size / BIG) * 0.27;
      drawGlobe(ctx, big, { cx: c, cy: c, radius: size / 2 - dot * 1.4 - 0.5, dot, turn, level });
      if (still) return;
      // It runs while the board's in sight
      if (visible) raf = requestAnimationFrame(draw);
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
    };
    const refit = () => {
      fit();
      if (still) draw(performance.now());
    };
    refit();
    const resized = new ResizeObserver(refit);
    resized.observe(slot);
    window.addEventListener("resize", refit);
    // Off screen, it all stops; the routes only move on by themselves while
    // a good part of the board is in view
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        setInView(entry.intersectionRatio >= 0.4);
        if (visible) start();
      },
      { threshold: [0, 0.4] },
    );
    io.observe(board);
    return () => {
      stop();
      io.disconnect();
      resized.disconnect();
      window.removeEventListener("resize", refit);
    };
  }, []);

  // A pointer over a route, or focus on it, holds it, where they're laid
  // across (not a finger: that's a tap)
  const byFinger = (event: object) => "pointerType" in event && event.pointerType === "touch";
  const hold = (i: number) => (event: object) => {
    if (!byFinger(event) && !narrow) setPointed(i);
  };
  const release = (i: number) => (event: object) => {
    if (byFinger(event) || narrow) return;
    setActive(i);
    setPointed(null);
  };

  return (
    <div ref={boardRef} className={styles.board}>
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
        </svg>
      )}

      <p className={cn(styles.label, styles.labelAsk)}>You ask</p>
      <p className={cn(styles.label, styles.labelWhere)}>Vivid shows you where</p>

      <ol className={styles.routes}>
        {ROUTES.map((route, i) => (
          <li
            key={route.ask}
            className={styles.route}
            data-on={i === shown || undefined}
            style={{ "--row": i + 1 } as CSSProperties}
            onPointerEnter={hold(i)}
            onPointerLeave={release(i)}
          >
            {/* A question: tap it (or click it) to light its route */}
            <button
              ref={(el) => {
                askRefs.current[i] = el;
              }}
              type="button"
              data-ask
              aria-pressed={i === shown}
              className={styles.ask}
              onClick={() => pick(i)}
            >
              <span className="sr-only">You ask: </span>“{route.ask}”
            </button>
            <a
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              href={route.href}
              target="_blank"
              rel="noopener"
              data-route-card
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
      <div ref={slotRef} className={styles.slot}>
        {/* Standing up, every platform goes round it, the one it's sending
            you to lit */}
        <span
          aria-hidden="true"
          className={styles.orbit}
          data-all={ROUTES[shown].everywhere || undefined}
          style={{ "--n": PLATFORMS.length } as CSSProperties}
        >
          {/* Each platform's app icon, in its own colours, kept upright as the ring turns */}
          {PLATFORMS.map((name, k) => (
            <i
              key={name}
              data-on={ROUTES[shown].place === name || undefined}
              style={{ "--k": k, "--glow": platformGlow(name) } as CSSProperties}
            >
              <PlatformIcon name={name} size={22} className={styles.orbitIcon} />
            </i>
          ))}
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
    </div>
  );
}
