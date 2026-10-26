"use client";

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { animate } from "motion/react";
import { cn } from "cn";
import type { GlobePlacement, NightGlobeHandle } from "@/components/globe/night-globe";
import { ARCS, EARTH_DOTS, HUB } from "./hero-loader-earth";
import styles from "./hero-loader.module.css";

// Once the scripts are running, what's left to wait on: the fonts and the
// planet's image. Short of them the ring creeps on, never quite arriving;
// after GIVE_UP_MS it stops waiting (say the image failed) and just fades.
const GIVE_UP_MS = 9000;
// The handover: the real planet fades up under the dots (LIGHT_MS), then
// flies to its place in the hero (FLIGHT seconds) as the dark opens round it
const LIGHT_MS = 600;
const FLIGHT = 1.1;
// Keys that would scroll the page while it's held at the top
const SCROLL_KEYS = new Set([" ", "PageDown", "PageUp", "End", "Home", "ArrowDown", "ArrowUp"]);

// The land's dots in three depths: stroke width (in the box's units) and
// opacity, dim and lit, smaller and fainter towards the limb
const DEPTHS = [
  { key: "centre", width: 2.3, dim: 0.26, lit: 1 },
  { key: "mid", width: 2, dim: 0.2, lit: 0.8 },
  { key: "limb", width: 1.6, dim: 0.13, lit: 0.5 },
] as const;
// Where the light spreads from: Lagos, as a share of the box
const HUB_AT = { "--hub-x": `${(HUB[0] + 100) / 2}%`, "--hub-y": `${(HUB[1] + 100) / 2}%` } as CSSProperties;

type Phase = "loading" | "lit" | "opening" | "fading" | "done";
/** The dots' planet: the globe's box, the planet's centre and radius on the screen, and it as a placement in the box. */
type Spot = { box: DOMRect; x: number; y: number; r: number; place: GlobePlacement };

type HeroLoaderProps = {
  globe: RefObject<NightGlobeHandle | null>;
  /** The globe's box. */
  stage: RefObject<HTMLElement | null>;
  /** Where the planet sits in the hero: the globe's placements. */
  hero: { wide: GlobePlacement; narrow: GlobePlacement };
  /** Whether the planet is showing yet (the globe's onReady). */
  globeReady: boolean;
  /** The dark is opening onto the hero: its copy can come in. */
  onOpen: () => void;
  /** The planet is in its place and the loader gone. */
  onDone: () => void;
};

/** One layer of the land's dots, drawn from the paths defined once in the loader. */
function EarthDots({ layer, style }: { layer: "dim" | "lit"; style?: CSSProperties }) {
  return (
    <svg viewBox="-100 -100 200 200" className={cn(styles.earth, styles[layer])} style={style}>
      {DEPTHS.map((depth) => (
        <use key={depth.key} href={`#hero-loader-${depth.key}`} opacity={depth[layer]} />
      ))}
    </svg>
  );
}

/**
 * What the hero shows while the page loads: the planet in gold dots, lit
 * from Lagos outwards, arcs running out to cities, and its edge filling
 * with the progress. The progress is real: the scripts running, the fonts,
 * and the globe's image (the hero waits on nothing else). Before the
 * scripts run, CSS creeps it along (hero-loader.module.css).
 *
 * Loaded, it hands over to the real globe, waiting underneath in the same
 * place at the same size: the dots fade into its lights, then it flies to
 * its place in the hero as the dark opens out round it, and the hero's copy
 * comes in. Under reduced motion, or back down the page (a reload), it
 * simply fades.
 */
export function HeroLoader({ globe, stage, hero, globeReady, onOpen, onDone }: HeroLoaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const discRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  // Read by the running loader, so changes don't restart it
  const latest = useRef({ globeReady, hero, onOpen, onDone });
  useEffect(() => {
    latest.current = { globeReady, hero, onOpen, onDone };
  }, [globeReady, hero, onOpen, onDone]);

  useEffect(() => {
    const root = rootRef.current;
    const disc = discRef.current;
    const ring = ringRef.current;
    if (!root || !disc || !ring) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const started = performance.now();
    let fonts = false;
    document.fonts.ready.then(() => (fonts = true));
    let real = 0;
    let last = started;
    let frame = 0;
    let timer = 0;
    let flight: { stop: () => void } | null = null;

    const measure = (): Spot | null => {
      const box = stage.current?.getBoundingClientRect();
      const d = disc.getBoundingClientRect();
      if (!box?.height || !d.width) return null;
      const r = d.width / 2;
      const x = d.left + r;
      const y = d.top + r;
      return { box, x, y, r, place: { x: (x - box.left) / box.width, y: (y - box.top) / box.height, radius: r / box.height } };
    };
    // The real planet waits under the dots, the same size in the same place
    const frameUnderDots = () => {
      const spot = measure();
      if (spot && !reduce) globe.current?.frame(spot.place);
    };

    // Held at the top of the page until the hero has opened
    const hold = (event: Event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    const holdKeys = (event: KeyboardEvent) => {
      if (SCROLL_KEYS.has(event.key)) event.preventDefault();
    };
    window.addEventListener("wheel", hold, { capture: true, passive: false });
    window.addEventListener("touchmove", hold, { capture: true, passive: false });
    window.addEventListener("keydown", holdKeys, { capture: true });
    window.addEventListener("resize", frameUnderDots);
    const release = () => {
      window.removeEventListener("wheel", hold, { capture: true });
      window.removeEventListener("touchmove", hold, { capture: true });
      window.removeEventListener("keydown", holdKeys, { capture: true });
      window.removeEventListener("resize", frameUnderDots);
    };

    const settle = () => {
      globe.current?.frame(null);
      release();
      setPhase("done");
      latest.current.onDone();
    };

    const fade = () => {
      globe.current?.frame(null);
      latest.current.onOpen();
      setPhase("fading");
      timer = window.setTimeout(settle, 400);
    };

    const fly = () => {
      const spot = measure();
      if (!spot) return fade();
      const { box, place: from } = spot;
      const to = latest.current.hero[box.width < 768 ? "narrow" : "wide"];
      const endX = box.left + to.x * box.width;
      const endY = box.top + to.y * box.height;
      const endR = to.radius * box.height;
      // Far enough out for the opening to clear every corner of the screen
      const corners = [
        [0, 0],
        [innerWidth, 0],
        [0, innerHeight],
        [innerWidth, innerHeight],
      ];
      const cover = Math.max(...corners.map(([cx, cy]) => Math.hypot(cx - endX, cy - endY)));
      let opened = false;
      setPhase("opening");
      flight = animate(0, 1, {
        duration: FLIGHT,
        ease: [0.65, 0, 0.35, 1],
        onUpdate: (k) => {
          const place = {
            x: from.x + (to.x - from.x) * k,
            y: from.y + (to.y - from.y) * k,
            radius: from.radius + (to.radius - from.radius) * k,
          };
          globe.current?.frame(place);
          const x = box.left + place.x * box.width;
          const y = box.top + place.y * box.height;
          const r = place.radius * box.height;
          // The ring rides the planet's edge as it sets off, and fades as the
          // planet's own gold edge takes over (it would trail it by a frame)
          ring.style.left = `${x - r}px`;
          ring.style.top = `${y - r}px`;
          ring.style.width = ring.style.height = `${2 * r}px`;
          ring.style.opacity = String(1 - Math.min(k / 0.25, 1));
          // The dark opens out round the planet, wider and softer as it goes
          root.style.setProperty("--hole-x", `${x}px`);
          root.style.setProperty("--hole-y", `${y}px`);
          root.style.setProperty("--hole-r", `${r - 1 + (cover - endR) * k * k}px`);
          root.style.setProperty("--hole-soft", `${1 + 240 * k}px`);
          if (!opened && k > 0.25) {
            opened = true;
            latest.current.onOpen();
          }
        },
        onComplete: settle,
      });
    };

    const finish = () => {
      // Into the hero only with the planet showing, from the top of the page, with motion
      if (reduce || !latest.current.globeReady || window.scrollY > 4) return fade();
      setPhase("lit");
      timer = window.setTimeout(fly, LIGHT_MS);
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const waited = now - started;
      const ready = latest.current.globeReady;
      const all = (fonts && ready) || waited > GIVE_UP_MS;
      // The scripts running are a third of it, the fonts a tenth, the planet the rest
      const done = 0.3 + (fonts ? 0.1 : 0) + (ready ? 0.6 : 0);
      const target = all ? 1 : done + (1 - done) * 0.5 * (1 - Math.exp(-waited / 3000));
      real += (target - real) * Math.min(dt * (all ? 6 : 2.5), 1);
      if (all && real > 0.995) real = 1;
      root.style.setProperty("--load-real", real.toFixed(4));
      if (real < 1) frame = requestAnimationFrame(tick);
      else finish();
    };

    frame = requestAnimationFrame((now) => {
      frameUnderDots();
      last = now;
      frame = requestAnimationFrame(tick);
    });

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      flight?.stop();
      release();
    };
  }, [globe, stage]);

  if (phase === "done") return null;

  return (
    <div ref={rootRef} role="status" data-phase={phase} className={styles.loader}>
      <span className="sr-only">Loading WorldStreet</span>
      <div aria-hidden="true" className={styles.veil} />
      <div ref={discRef} aria-hidden="true" className={styles.disc}>
        {/* The land's dots, once, for both layers */}
        <svg width="0" height="0" className="absolute">
          <defs>
            {DEPTHS.map((depth) => (
              <path
                key={depth.key}
                id={`hero-loader-${depth.key}`}
                d={EARTH_DOTS[depth.key]}
                fill="none"
                strokeWidth={depth.width}
                strokeLinecap="round"
              />
            ))}
          </defs>
        </svg>
        <EarthDots layer="dim" />
        <EarthDots layer="lit" style={HUB_AT} />
        <svg viewBox="-100 -100 200 200" className={styles.earth}>
          {ARCS.map((arc, i) => (
            <g key={arc.city} style={{ "--load-at": 0.12 + i * 0.09 } as CSSProperties}>
              <path d={arc.d} pathLength={1} className={styles.arc} />
              <circle cx={arc.to[0]} cy={arc.to[1]} r={1.8} className={styles.city} />
            </g>
          ))}
          <circle cx={HUB[0]} cy={HUB[1]} r={5} className={styles.hubGlow} />
          <circle cx={HUB[0]} cy={HUB[1]} r={2.2} className={styles.hub} />
        </svg>
      </div>
      <div ref={ringRef} aria-hidden="true" className={styles.ring}>
        <div className={styles.glint} />
        <svg viewBox="-100 -100 200 200">
          <circle r={100} className={styles.track} />
          <circle r={100} pathLength={1} transform="rotate(-90)" className={styles.progress} />
          <g className={styles.head}>
            <circle cy={-100} r={2.4} />
          </g>
        </svg>
      </div>
      <p aria-hidden="true" className={styles.caption}>
        <span className={styles.name}>WorldStreet</span>
        <span className={styles.count} />
      </p>
      {/* Without scripts there's nothing to wait for */}
      <noscript>
        <style>{`.${styles.loader}{display:none}[data-loading] *{animation-play-state:running!important}`}</style>
      </noscript>
    </div>
  );
}
