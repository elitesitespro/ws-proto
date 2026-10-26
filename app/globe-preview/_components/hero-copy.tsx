"use client";

import type { ComponentProps, CSSProperties, MouseEvent, RefObject } from "react";
import Link from "next/link";
import { useLenis } from "lenis/react";
import { motion, type MotionStyle, type MotionValue } from "motion/react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { GlobeHeadline } from "./globe-headline";
import { GlobeScrollCue } from "./globe-scroll-cue";
import styles from "./hero-copy.module.css";

/** A part's place in the entrance: it rises in this many beats after the first. */
const at = (step: number) => ({ "--rise": step }) as CSSProperties;
// How long Explore takes to carry you down to the platforms (s)
const GLIDE = 5;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

type HeroCopyProps = {
  /** The copy's box, which the globe's cards keep clear of. */
  copyRef: RefObject<HTMLDivElement | null>;
  /** How the copy fades and lifts away as the statement arrives. */
  opacity: MotionValue<number>;
  y: MotionValue<number>;
  /** How the scroll cue fades, a little sooner. */
  cueOpacity: MotionValue<number>;
} & Pick<ComponentProps<typeof GlobeHeadline>, "onWordChange" | "paused" | "waiting">;

/**
 * The hero's copy on the left, over the globe, and the scroll cue under it.
 * As the loader opens onto the hero they arrive in order: the welcome, the
 * headline's line, its word and bar, the paragraph, each button, then the
 * cue, each rising out of a soft blur (hero-copy.module.css).
 * On a phone it's centred: the words and Explore at the top (the menu has
 * the account), the planet and its cards under them, and a word on how to
 * play with it at the foot.
 * Explore carries you down the page to the platforms, through the statement
 * and the dive on the way, as if you'd scrolled it.
 */
export function HeroCopy({ copyRef, opacity, y, cueOpacity, onWordChange, paused, waiting }: HeroCopyProps) {
  const lenis = useLenis();
  const explore = (event: MouseEvent<HTMLAnchorElement>) => {
    const to = document.getElementById("discover");
    // Without Lenis, the link's own jump
    if (!to || !lenis) return;
    event.preventDefault();
    // Past Lenis's own handling of in-page links, which would rush it
    event.stopPropagation();
    // To where the section pins, under the header, its heading up
    lenis.scrollTo(to, { offset: -80, duration: GLIDE, easing: easeInOut });
  };

  return (
    <>
      <motion.div
        ref={copyRef}
        style={{ opacity, y }}
        className={cn(
          "relative z-10 mx-auto flex w-full max-w-7xl flex-col items-start gap-3 px-3 pb-24 md:px-6 md:pb-0",
          styles.copy,
        )}
      >
        <div className={cn("flex flex-col items-start gap-3", styles.lead)}>
          <p className={cn("text-sm leading-[24px] font-medium text-muted", styles.rise, styles.welcome)} style={at(0)}>
            Welcome to the new economy.
          </p>
          {/* Steps 1 and 2: the line, then the word and its bar */}
          <GlobeHeadline onWordChange={onWordChange} paused={paused} waiting={waiting} rise={1} />
          <p className={cn("max-w-[420px] text-sm leading-[24px] text-muted", styles.rise, styles.line)} style={at(3)}>
            Connect, create, discover and earn. All in one connected world.
          </p>
        </div>
        <div className={cn("pointer-events-auto flex flex-col gap-2 pt-1 sm:flex-row", styles.actions)}>
          <a
            href="#discover"
            onClick={explore}
            className={cn(buttonVariants({ variant: "default", size: "lg" }), "px-3", styles.rise)}
            style={at(4)}
          >
            Explore WorldStreet
          </a>
          <Link
            href="/create-account"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "px-3", styles.rise, styles.second)}
            style={at(5)}
          >
            Create your account
          </Link>
        </div>
        <p className={cn(styles.hint, styles.rise)} style={at(6)}>
          Spin the globe, or tap a city
        </p>
      </motion.div>
      <motion.div style={{ opacity: cueOpacity, ...at(6) } as MotionStyle} className={styles.cue}>
        <GlobeScrollCue />
      </motion.div>
    </>
  );
}
