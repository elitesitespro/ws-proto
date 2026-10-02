import { stagger, type Variants } from "motion/react";

function revealTransition(delay = 0) {
  return {
    y: { type: "spring", duration: 0.75, bounce: 0.4, delay },
    opacity: { duration: 0.3, ease: "easeOut", delay },
  } as const;
}

export const revealItem: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: revealTransition(),
  },
};

export const revealMutedItem: Variants = {
  hidden: { opacity: 0, y: "110%" },
  visible: { opacity: 0.7, y: "0%", transition: revealTransition() },
};

export const revealTitle: Variants = {
  hidden: { opacity: 0, y: "110%" },
  visible: { opacity: 1, y: "0%", transition: revealTransition() },
};

export const revealHeading: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: stagger(0.7) } },
};

export const revealAccordionItem: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: revealTransition(index * 0.08),
  }),
};
