"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Icon, type IconName } from "@/components/icon";

const features: readonly { word: string; icon: IconName }[] = [
  { word: "Streaming", icon: "clapperboard" },
  { word: "Trading", icon: "trending-up" },
  { word: "Shopping", icon: "shopping-bag" },
  { word: "Gaming", icon: "gamepad" },
  { word: "Learning", icon: "graduation" },
];

export function HeroHeadline() {
  const [index, setIndex] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const inView = useInView(headingRef);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!inView || reducedMotion) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((value) => (value + 1) % features.length);
    }, 2500);
    return () => window.clearInterval(timer);
  }, [inView, reducedMotion]);

  const { word, icon } = features[index];

  return (
    <h1 ref={headingRef} id="hero-heading" className="flex w-full flex-col items-center text-center text-3xl leading-[56px] font-normal md:text-4xl md:leading-[64px]">
      <span className="block w-full whitespace-nowrap text-2xl sm:text-3xl md:text-4xl">Your world of</span>
      <span className="sr-only"> Streaming, Trading, Shopping, Gaming and Learning.</span>
      <span aria-hidden="true" className="relative flex h-[64px] w-full items-center justify-center overflow-hidden md:h-[80px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={word}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : .4, ease: [.16, 1, .3, 1] }}
            className="relative flex items-center justify-center"
          >
            <span className="cx-itile cx-itile--glass absolute right-full mr-2 shrink-0 rounded-icon [--tile:40px] md:[--tile:48px]">
              <Icon name={icon} size={28} />
            </span>
            <span>{word}</span>
          </motion.span>
        </AnimatePresence>
      </span>
    </h1>
  );
}
