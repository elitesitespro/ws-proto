"use client";

import { useRef, useState, type CSSProperties } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Icon } from "@/components/icon";
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
  const roomRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // Opening: 0 as it pins, 1 once the circle covers the screen
  const { scrollYProgress: opening } = useScroll({ target: roomRef, offset: ["start start", "end start"] });
  const radius = (p: number) => COVER * p ** 1.2;
  const clipPath = useTransform(opening, (p) =>
    p >= 1 ? "none" : `circle(${radius(p).toFixed(2)}vmax at ${reveal?.x ?? "50%"} ${reveal?.y ?? "50%"})`,
  );
  // A gold rim just inside the circle's edge, so it reads as a circle even
  // where the dark dashboard fills it; it fades as the circle fills the screen
  const rimSize = useTransform(opening, (p) => `${(2 * radius(p)).toFixed(2)}vmax`);
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
        <motion.span
          aria-hidden="true"
          className={styles.rim}
          style={{ left: reveal.x, top: reveal.y, width: rimSize, height: rimSize, opacity: rimOpacity }}
        />
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
          <motion.p
            className={styles.currencies}
            initial={reduce ? false : "hidden"}
            {...(reveal
              ? { animate: alive ? "shown" : "hidden" }
              : { whileInView: "shown", viewport: { once: true, amount: 0.8 } })}
          >
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
          </motion.p>
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
