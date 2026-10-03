import type { Transition } from "motion/react";

/** The earlier FAQ reveal curve: a quick rise that settles softly. */
export const softLandingCubicEase = [0.22, 1, 0.36, 1] as const;

/** A quiet glide with a gradual start and stop for hover states. */
export const gentleGlideCubicEase = [0.4, 0, 0.2, 1] as const;

export const softLandingRevealTransition = {
  type: "tween",
  duration: 0.65,
  ease: softLandingCubicEase,
} as const satisfies Transition;
