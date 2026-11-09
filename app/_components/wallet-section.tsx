"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react";
import { cn } from "cn";
import { ACCOUNT_LINKS } from "@/components/layout/nav-links";
import { usePauseOffscreen } from "@/lib/use-pause-offscreen";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Icon } from "@/components/icon";
import { buttonVariants } from "@/components/ui/button";
import { DashboardPreview } from "./dashboard/dashboard-preview";
import { Flag, WorldStreetMark } from "./dashboard/dashboard-art";
import { RevealWords } from "./street/reveal-words";
import { useScrollTimeline } from "./street/use-scroll-timeline";
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
// It grows as the opening's share to this power, slow out of the road's end
const EASE = 1.2;
// Its keyframes, where the browser runs it with the scroll: these steps of the opening
const STEPS = [0, 0.08, 0.2, 0.35, 0.5, 0.65, 0.8, 1];
// The dashboard waits this far down, and has risen into place by this far through
const LIFT = "30svh";
const RISEN = 0.85;
// Once the gold has all but filled the screen, the wallet comes alive (its
// dashboard's own goings-on start then, not while the circle's still growing)
const ALIVE = 0.9;

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
 * The circle and the dashboard's rise are keyframes the browser runs with the
 * scroll itself where it can (so they keep step with a flung page however
 * busy the page is), and follow the scroll by script where it can't.
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
  // Whether the browser runs the opening with the scroll (then the circle
  // and the rise are its keyframes, on the room's view of the page)
  const timed = useScrollTimeline();
  const name = `wallet${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const at = `at ${reveal?.x ?? "50%"} ${reveal?.y ?? "50%"}`;
  // By script: the circle's radius in px (a vmax is this many)
  const vmax = useMotionValue(0);
  useEffect(() => {
    if (timed) return;
    const size = () => vmax.set(Math.max(window.innerWidth, window.innerHeight) / 100);
    size();
    window.addEventListener("resize", size);
    return () => window.removeEventListener("resize", size);
  }, [vmax, timed]);
  const clipPath = useTransform([opening, vmax], ([p, v]: number[]) =>
    p >= 1 ? "none" : `circle(${(COVER * p ** EASE * v).toFixed(1)}px ${at})`,
  );
  // The dashboard waits lower down, so the circle opens on gold, and rises
  // into its place as the circle grows
  const lift = useTransform(opening, [0, RISEN], [LIFT, "0svh"]);
  const [alive, setAlive] = useState(!reveal);
  const sectionOpen = useRef(false);
  useMotionValueEvent(opening, "change", (p) => {
    if (p >= ALIVE && !alive) setAlive(true);
    // Once it's all open the circle's off: the wallet scrolls on unclipped
    const open = p >= 0.999;
    if (open !== sectionOpen.current && sectionRef.current) {
      sectionOpen.current = open;
      sectionRef.current.toggleAttribute("data-open", open);
    }
  });
  // The opening's keyframes, for the browser to run with the scroll: the
  // circle out of the road's end, and the dashboard rising into place
  const frames = reveal
    ? `@keyframes ${name}-open{${STEPS.map((p) => `${(p * 100).toFixed(0)}%{clip-path:circle(${(COVER * p ** EASE).toFixed(2)}vmax ${at})}`).join("")}}` +
      `@keyframes ${name}-rise{0%{translate:0 ${LIFT}}${RISEN * 100}%,100%{translate:0 0}}`
    : "";
  const run = (key: string): CSSProperties => ({
    animationName: `${name}-${key}`,
    animationDuration: "auto",
    animationTimingFunction: "linear",
    animationFillMode: "both",
    animationTimeline: `--${name}`,
    animationRange: "exit 0% exit 100%",
  });
  // Never held still off the screen (sections asleep hold their looping
  // animations, app/globals.css), or the opening would lose its place
  const riseRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!timed) return;
    for (const el of [sectionRef.current, riseRef.current]) el?.style.setProperty("animation-play-state", "running", "important");
  }, [timed]);

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
      style={reveal ? (timed ? run("open") : { clipPath }) : undefined}
    >
      <div aria-hidden="true" className={styles.backdrop}>
        <i className={styles.glowA} />
        <i className={styles.glowB} />
        <motion.span className={styles.mark} style={reduce ? undefined : { y: markY }}>
          <WorldStreetMark />
        </motion.span>
      </div>

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
            {/* The real one: Home in the hub, where this dashboard lives, through creating an account */}
            <motion.a
              href={ACCOUNT_LINKS.join}
              variants={rise}
              className={cn(buttonVariants(), "cx-btn--arrow", styles.open)}
            >
              Open your wallet
              <Icon name="arrow-right" size={20} tone="current" />
            </motion.a>
          </motion.div>
        </header>

        <div ref={screenRef} className={styles.screen}>
          <motion.div ref={riseRef} style={reveal ? (timed ? run("rise") : { y: lift }) : undefined}>
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
  // Pinned for the room it opens over, then on with the page. The room's
  // view of the page runs the opening, for everything in the track.
  return (
    <div
      className={styles.track}
      style={{ marginTop: reveal.overlap, "--room": reveal.room, timelineScope: `--${name}` } as CSSProperties}
    >
      {timed && <style>{frames}</style>}
      <div ref={roomRef} aria-hidden="true" className={styles.room} style={{ viewTimeline: `--${name} block` }} />
      {/* Where the wallet starts for Vivid's pill (vivid-pill-hooks.ts), which steps out of the way of the
          dashboard's own Ask Vivid: as the circle starts to open, not as this box comes up behind the street */}
      <div aria-hidden="true" data-vivid-part="wallet" className={styles.part} />
      {section}
      <div aria-hidden="true" className={styles.roomAfter} />
    </div>
  );
}
