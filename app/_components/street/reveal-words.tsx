"use client";

import { Fragment } from "react";
import { motion, useMotionTemplate, useTransform, type MotionValue } from "motion/react";

/**
 * Text that comes up a word at a time as `progress` runs from `from` to `to`:
 * each word rises out of a blur, faint to solid, so it reads at the pace you
 * scroll. With reduced motion it's all there from the start.
 */
export function RevealWords({
  text,
  progress,
  from = 0,
  to = 1,
}: {
  text: string;
  progress: MotionValue<number>;
  from?: number;
  to?: number;
}) {
  const words = text.split(" ");
  // Each word takes this share of the span, overlapping the next few
  const share = Math.min(1, 3 / words.length);
  const span = to - from;
  return (
    <>
      {words.map((word, i) => {
        const start = from + (span * (1 - share) * i) / Math.max(words.length - 1, 1);
        return (
          <Fragment key={i}>
            {i > 0 ? " " : null}
            <Word progress={progress} start={start} end={start + span * share}>
              {word}
            </Word>
          </Fragment>
        );
      })}
    </>
  );
}

function Word({
  children,
  progress,
  start,
  end,
}: {
  children: string;
  progress: MotionValue<number>;
  start: number;
  end: number;
}) {
  const opacity = useTransform(progress, [start, end], [0.12, 1]);
  const y = useTransform(progress, [start, end], ["0.3em", "0em"]);
  const blur = useTransform(progress, [start, end], [6, 0]);
  const filter = useMotionTemplate`blur(${blur}px)`;

  return (
    <motion.span
      className="inline-block motion-reduce:[filter:none]! motion-reduce:[transform:none]! motion-reduce:opacity-100!"
      style={{ opacity, y, filter }}
    >
      {children}
    </motion.span>
  );
}
