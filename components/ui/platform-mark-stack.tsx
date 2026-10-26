"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import { motion, type Transition } from "motion/react";
import { cn } from "cn";
import { Icon } from "@/components/icon";
import styles from "./platform-mark-stack.module.css";

// The glyphs scale with the line but never drop below the system's 20px floor
const GLYPH = { "--size": "max(20px, 0.56em)" } as CSSProperties;

/** WorldMeet's globe, as on its app icon (worldstreet/worldcall, public/icon.svg). */
function MeetGlobe() {
  return (
    <svg viewBox="0 0 32 32" className={styles.globe} aria-hidden="true">
      <g fill="none" stroke="#1C1917" strokeLinecap="round">
        <circle cx="16" cy="16" r="8.5" strokeWidth="2" />
        <path d="M7.8 16c2.2-2.6 4.4-2.6 6.2 0s4 2.6 6.2 0 2.9-1.6 4 0" strokeWidth="2" />
        <path d="M16 7.5c-2.6 2.4-3.6 5.3-3.6 8.5s1 6.1 3.6 8.5" strokeWidth="1.6" opacity=".55" />
      </g>
    </svg>
  );
}

// Front to back, each in its own look: WorldSpace leads with its real mark,
// then Xtream's chilli, WorldMeet's globe, Vision's play and Arcade's gamepad
// (the same marks their panels on the dial wear), light and dark in turn
const MARKS: readonly { name: string; look: string; art: ReactNode }[] = [
  {
    name: "WorldSpace",
    look: styles.worldspace,
    art: <Image src="/assets/worldspace/mark.webp" alt="" width={48} height={30} className={styles.cloud} />,
  },
  {
    name: "Xtream",
    look: styles.xtream,
    art: <Image src="/assets/xtream/mark.webp" alt="" width={40} height={30} className={styles.chilli} />,
  },
  { name: "WorldMeet", look: styles.worldmeet, art: <MeetGlobe /> },
  { name: "Vision", look: styles.vision, art: <Icon name="play" tone="current" style={GLYPH} /> },
  { name: "Arcade", look: styles.arcade, art: <Icon name="gamepad" tone="current" style={GLYPH} /> },
];

const STEP = 0.52; // em from one tile to the next
// How often the next platform takes the front (0 to keep WorldSpace there)
const CYCLE_MS = 3600;

/** A place in the fan, front to back: each a step along, a little smaller and turned a little further. */
const fan = (slot: number) => ({ x: `${(slot * STEP).toFixed(2)}em`, rotate: -6 + slot * 4, scale: 1 - slot * 0.05 });
// Tucked away: small, tilted back, low and blurred. Landed: in place, solid.
const TUCKED = { opacity: 0, scale: 0.3, rotate: -30, y: "0.5em", filter: "blur(6px)" };
const LANDED = { opacity: 1, scale: 1, rotate: 0, y: "0em", filter: "blur(0px)" };
/** In, front to back, on a springy overshoot; the fade and the blur clear without one. */
const popIn = (slot: number): Transition => {
  const delay = slot * 0.075;
  return {
    default: { type: "spring", visualDuration: 0.45, bounce: 0.5, delay },
    opacity: { duration: 0.18, ease: "easeOut", delay },
    filter: { duration: 0.3, ease: "easeOut", delay },
  };
};
/** Out again, back to front and quicker, with no bounce. */
const tuckAway = (slot: number): Transition => {
  const delay = (MARKS.length - 1 - slot) * 0.03;
  return {
    default: { type: "spring", visualDuration: 0.3, bounce: 0, delay },
    opacity: { duration: 0.2, ease: "easeIn", delay: delay + 0.08 },
  };
};
const SHUFFLE: Transition = { type: "spring", visualDuration: 0.7, bounce: 0.2 };

type PlatformMarkStackProps = {
  /** Pops the tiles in, one after another; false tucks them away again. */
  shown: boolean;
  className?: string;
};

/**
 * A few of the network's platforms as a small stack of app icons, to sit
 * inline in a line of text (decorative: the words carry the meaning). They
 * pop in on cue, overshooting into a gentle fan, and while they're up the
 * stack slowly cycles, so each platform takes its turn at the front: the
 * front tile slips round to the back, the rest step forward. Under reduced
 * motion they're simply there, and stay still.
 */
export function PlatformMarkStack({ shown, className }: PlatformMarkStackProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const [turn, setTurn] = useState(0);

  useEffect(() => {
    if (!shown) {
      // Once they've gone, line them up behind WorldSpace again for the next pop
      const reset = window.setTimeout(() => setTurn(0), 600);
      return () => window.clearTimeout(reset);
    }
    const root = rootRef.current;
    if (!CYCLE_MS || !root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Only while it's on screen and the tab is in view
    let onScreen = true;
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
    });
    observer.observe(root);
    const timer = window.setInterval(() => {
      if (onScreen && !document.hidden) setTurn((t) => t + 1);
    }, CYCLE_MS);
    return () => {
      window.clearInterval(timer);
      observer.disconnect();
    };
  }, [shown]);

  return (
    <span
      ref={rootRef}
      aria-hidden="true"
      className={cn(styles.stack, className)}
      style={{ "--step": `${STEP}em`, "--gaps": MARKS.length - 1 } as CSSProperties}
    >
      {MARKS.map((mark, i) => {
        const slot = (((i - turn) % MARKS.length) + MARKS.length) % MARKS.length;
        return (
          <motion.span
            key={mark.name}
            className={styles.slot}
            // The front tile on top; the one slipping round to the back passes behind the rest
            style={{ zIndex: MARKS.length - slot }}
            initial={false}
            animate={fan(slot)}
            transition={SHUFFLE}
          >
            <motion.span
              className={cn(styles.tile, mark.look)}
              initial={false}
              animate={shown ? LANDED : TUCKED}
              transition={shown ? popIn(slot) : tuckAway(slot)}
            >
              {mark.art}
            </motion.span>
          </motion.span>
        );
      })}
    </span>
  );
}
