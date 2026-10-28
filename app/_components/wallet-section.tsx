"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react";
import { cn } from "cn";
import { HUB } from "@/lib/hub";
import { usePauseOffscreen } from "@/lib/use-pause-offscreen";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Icon } from "@/components/icon";
import { buttonVariants } from "@/components/ui/button";
import { DashboardPreview } from "./dashboard/dashboard-preview";
import { Flag, WorldStreetMark } from "./dashboard/dashboard-art";
import { RevealWords } from "./street/reveal-words";
import styles from "./wallet-section.module.css";

// The currencies on show, and a disc for the rest
const FLAGS = ["USD", "GBP", "EUR", "NGN", "GHS", "KES"] as const;
// Each disc drops into the stack in turn
const pop: Variants = {
  hidden: { opacity: 0, x: -12, scale: 0.6 },
  shown: (i: number) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 420, damping: 22, delay: 0.1 + i * 0.07 },
  }),
};
// Then the way into the real wallet rises in after them
const rise: Variants = {
  hidden: { opacity: 0, y: 8 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1], delay: 0.2 + FLAGS.length * 0.07 } },
};
// A circle this big (in vmax) covers the screen from any point on it
const COVER = 142;
// Once the circle's this far open, the wallet comes alive
const ALIVE = 0.6;

export type WalletReveal = {
  /** Where the circle opens, on the screen (CSS lengths). */
  x: string;
  y: string;
  /** How far up the page the wallet starts, so it's in place behind what's above. */
  overlap: string;
  /** How far you scroll while it opens. */
  room: string;
};

/**
 * The wallet, on WorldStreet gold: what the street ends at. The new
 * dashboard tips up into view as you scroll to it, and money lands in it.
 *
 * With `reveal` it sits pinned behind the end of what's above it, and opens
 * out of it through a growing circle as you scroll (./street/street-to-wallet).
 */
export function WalletSection({
  reveal,
  vividHref,
}: {
  reveal?: WalletReveal;
  /** Where the dashboard's Ask Vivid goes on this page. */
  vividHref?: string;
} = {}) {
  const sectionRef = useRef<HTMLElement>(null);
  usePauseOffscreen(sectionRef);
  const roomRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // Opening: 0 as it pins, 1 once the circle covers the screen
  const { scrollYProgress: opening } = useScroll({ target: roomRef, offset: ["start start", "end start"] });
  // The circle's radius in px (a vmax is this many), so its clip and its rim
  // are the same circle
  const vmax = useMotionValue(0);
  useEffect(() => {
    const size = () => vmax.set(Math.max(window.innerWidth, window.innerHeight) / 100);
    size();
    window.addEventListener("resize", size);
    return () => window.removeEventListener("resize", size);
  }, [vmax]);
  const radius = useTransform([opening, vmax], ([p, v]: number[]) => COVER * p ** 1.2 * v);
  const clipPath = useTransform([opening, radius], ([p, r]: number[]) =>
    p >= 1 ? "none" : `circle(${r.toFixed(1)}px at ${reveal?.x ?? "50%"} ${reveal?.y ?? "50%"})`,
  );
  // A gold rim just inside the circle's edge, so it reads as a circle even
  // where the dark dashboard fills it; it fades as the circle fills the screen.
  // Circles drawn at its radius, a fine line and a soft light in from it:
  // only the rim's drawn again as it grows, not a blurred shadow its size.
  const rimLine = useTransform(radius, (r) => Math.max(r - 1, 0));
  const rimLight = useTransform(radius, (r) => Math.max(r - 9, 0));
  const rimHaze = useTransform(radius, (r) => Math.max(r - 22, 0));
  const rimOpacity = useTransform(opening, [0, 0.04, 0.6, 0.95], [0, 1, 1, 0]);
  // The dashboard waits lower down, so the circle opens on gold, and rises
  // into its place as the circle grows
  const lift = useTransform(opening, [0, 0.85], ["30svh", "0svh"]);
  const [alive, setAlive] = useState(!reveal);
  useMotionValueEvent(opening, "change", (p) => {
    if (p >= ALIVE && !alive) setAlive(true);
  });

  // The heading comes up a word at a time: as it scrolls in, or as the
  // circle opens, all there by the time the dashboard has risen into place
  // (it's live before the circle's done, so it can be stopped at and used)
  const { scrollYProgress: headingIn } = useScroll({ target: headingRef, offset: ["start 90%", "end 55%"] });
  const openingWords = useTransform(opening, [0.35, 0.82], [0, 1]);
  // The dashboard lies back, then tips up to face you as it rises
  const { scrollYProgress: rising } = useScroll({ target: screenRef, offset: ["start end", "start 30%"] });
  const rotateX = useTransform(rising, [0, 1], [26, 0]);
  const scale = useTransform(rising, [0, 1], [0.86, 1]);
  const y = useTransform(rising, [0, 1], [80, 0]);
  // The big W behind drifts slower than the page
  const { scrollYProgress: passing } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const markY = useTransform(passing, [0, 1], ["-12%", "18%"]);

  const section = (
    <motion.section
      ref={sectionRef}
      id="wallet"
      aria-labelledby="wallet-heading"
      className={styles.section}
      data-reveal={reveal ? "" : undefined}
      style={reveal ? { clipPath } : undefined}
    >
      <div aria-hidden="true" className={styles.backdrop}>
        <i className={styles.glowA} />
        <i className={styles.glowB} />
        <motion.span className={styles.mark} style={reduce ? undefined : { y: markY }}>
          <WorldStreetMark />
        </motion.span>
      </div>
      {reveal && (
        <motion.span aria-hidden="true" className={styles.rim} style={{ left: reveal.x, top: reveal.y, opacity: rimOpacity }}>
          <svg>
            <motion.circle r={rimHaze} />
            <motion.circle r={rimLight} />
            <motion.circle r={rimLine} />
          </svg>
        </motion.span>
      )}

      <div className="relative mx-auto w-full max-w-7xl px-4 md:px-6">
        <header className={styles.head}>
          <p className={styles.eyebrow}>
            <Icon name="wallet" size={20} />
            Universal wallet
          </p>
          <h2
            ref={headingRef}
            id="wallet-heading"
            className="text-xl leading-[44px] font-normal tracking-[-0.03em] md:text-3xl md:leading-[56px]"
          >
            <RevealWords
              text="One wallet. Every currency. Every WorldStreet platform."
              progress={reveal ? openingWords : headingIn}
            />
          </h2>
          <motion.div
            className={styles.ways}
            initial={reduce ? false : "hidden"}
            {...(reveal
              ? { animate: alive ? "shown" : "hidden" }
              : { whileInView: "shown", viewport: { once: true, amount: 0.8 } })}
          >
            <p className={styles.currencies}>
              <span className={styles.discs} aria-hidden="true">
                {FLAGS.map((currency, i) => (
                  <motion.span key={currency} className={styles.disc} custom={i} variants={pop}>
                    <Flag currency={currency} />
                  </motion.span>
                ))}
                <motion.span className={`${styles.disc} ${styles.more}`} custom={FLAGS.length} variants={pop}>
                  <Icon name="plus" size={20} tone="current" />
                </motion.span>
              </span>
              <span className="sr-only">Dollars, pounds, euros, naira, cedis, shillings and more:</span>
              Hold, send, convert
            </p>
            {/* The real one: Home in the hub, where this dashboard lives (a new visitor sets up first) */}
            <motion.a
              href={`${HUB}/welcome`}
              variants={rise}
              className={cn(buttonVariants(), "cx-btn--arrow", styles.open)}
            >
              Open your wallet
              <Icon name="arrow-right" size={20} tone="current" />
            </motion.a>
          </motion.div>
        </header>

        <div ref={screenRef} className={styles.screen}>
          <motion.div style={reveal ? { y: lift } : undefined}>
            <motion.div style={reduce ? undefined : { rotateX, scale, y }} className={styles.tilt}>
              <DashboardPreview live={alive} vividHref={vividHref} />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );

  if (!reveal) {
    return (
      <>
        <div ref={roomRef} hidden />
        {section}
      </>
    );
  }
  // Pinned for the room it opens over, then on with the page
  return (
    <div
      className={styles.track}
      style={{ marginTop: reveal.overlap, "--room": reveal.room } as CSSProperties}
    >
      <div ref={roomRef} aria-hidden="true" className={styles.room} />
      {section}
      <div aria-hidden="true" className={styles.roomAfter} />
    </div>
  );
}
