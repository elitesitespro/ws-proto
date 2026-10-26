"use client";

import { Fragment, useState, type ReactNode, type RefObject } from "react";
import { motion, useMotionTemplate, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { PlatformMarkStack } from "@/components/ui/platform-mark-stack";

const statement =
  "WorldStreet isn’t one platform trying to do everything. It’s a network of purpose-built platforms designed to work together.";
const words = statement.split(" ");
// Each word's reveal overlaps the next ones, so the line lights up as a wave rather than word by word
const WINDOW = 0.2;
const SPREAD = 1 - WINDOW;
// The platforms' app icons pop in beside "platforms" as it finishes lighting,
// and tuck away again a little before it dims, so they don't flicker on the edge
const PLATFORMS = words.indexOf("platforms");
const POP_IN = (PLATFORMS / (words.length - 1)) * SPREAD + WINDOW * 0.75;
const POP_OUT = POP_IN - 0.04;

/** One word coming through: up out of a soft blur into full white, the blur
 *  clearing a beat before the word is fully lit. Under reduced motion the
 *  words just sit lit. */
function RevealWord({ children, index, progress }: { children: ReactNode; index: number; progress: MotionValue<number> }) {
  const start = (index / (words.length - 1)) * SPREAD;
  const end = start + WINDOW;
  const opacity = useTransform(progress, [start, end], [0.16, 1]);
  const blur = useTransform(progress, [start, start + WINDOW * 0.7], [10, 0], { clamp: true });
  const y = useTransform(progress, [start, end], [16, 0]);
  const filter = useMotionTemplate`blur(${blur}px)`;

  return (
    <motion.span
      className="inline-block motion-reduce:[filter:none]! motion-reduce:[transform:none]! motion-reduce:opacity-100!"
      style={{ opacity, filter, y }}
    >
      {children}
    </motion.span>
  );
}

type GlobeIntroProps = {
  /** The section, for the stage to follow its scroll. */
  sectionRef: RefObject<HTMLElement | null>;
  /** How far the statement has lit, 0 to 1. */
  reveal: MotionValue<number>;
  /** How far it has gone as the page moves on, 0 to 1: it lifts away into a blur. */
  leave: MotionValue<number>;
};

/**
 * The statement after the hero, centred over the globe as it settles low and
 * dim behind it. The section holds on screen while the page scrolls through
 * it, and the words light up in a wave as it goes (a stack of the platforms'
 * app icons popping in beside "platforms"), then lifts away into a blur as
 * the globe rises past it.
 */
export function GlobeIntro({ sectionRef, reveal, leave }: GlobeIntroProps) {
  const opacity = useTransform(leave, [0, 1], [1, 0]);
  const y = useTransform(leave, [0, 1], [0, -48]);
  const blur = useTransform(leave, [0, 1], [0, 12]);
  const filter = useMotionTemplate`blur(${blur}px)`;
  // A switch, not scrubbed with the scroll, so the icons pop rather than slide
  const [popped, setPopped] = useState(false);
  useMotionValueEvent(reveal, "change", (v) => {
    if (v >= POP_IN) setPopped(true);
    else if (v < POP_OUT) setPopped(false);
  });

  return (
    <section
      ref={sectionRef}
      aria-labelledby="globe-intro-heading"
      className="pointer-events-none relative h-[240svh] text-foreground motion-reduce:h-auto"
    >
      <div className="sticky top-0 flex h-svh items-center justify-center px-3 motion-reduce:static motion-reduce:h-auto motion-reduce:py-12 md:px-6">
        <motion.h2
          id="globe-intro-heading"
          style={{ opacity, y, filter }}
          className="mx-auto max-w-[1120px] text-center motion-reduce:opacity-100! motion-reduce:[filter:none]! motion-reduce:[transform:none]! text-xl leading-[44px] font-medium md:text-3xl md:leading-[56px] md:font-normal xl:text-4xl xl:leading-[68px]"
        >
          {words.map((word, index) => (
            <Fragment key={`${index}-${word}`}>
              {index > 0 ? " " : null}
              {index === PLATFORMS ? (
                // The word and its icons hold together on one line; the icons
                // sit outside the word's own blur, as they make their own entrance
                <span className="inline-flex items-center whitespace-nowrap align-baseline">
                  <RevealWord index={index} progress={reveal}>
                    {word}
                  </RevealWord>
                  <PlatformMarkStack shown={popped} />
                </span>
              ) : (
                <RevealWord index={index} progress={reveal}>
                  {word}
                </RevealWord>
              )}
            </Fragment>
          ))}
        </motion.h2>
      </div>
    </section>
  );
}
