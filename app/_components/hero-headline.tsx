"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { FilmSlate, ChartLineUp, ShoppingBag, GameController, GraduationCap } from "@phosphor-icons/react";

const features = [
  { word: "Streaming", Icon: FilmSlate },
  { word: "Trading", Icon: ChartLineUp },
  { word: "Shopping", Icon: ShoppingBag },
  { word: "Gaming", Icon: GameController },
  { word: "Learning", Icon: GraduationCap },
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

  const { word, Icon } = features[index];

  return (
    <h1 ref={headingRef} id="hero-heading" className="flex w-full flex-col items-center text-center text-3xl leading-[56px] font-semibold tracking-tight md:text-4xl md:leading-[64px] md:tracking-tighter">
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
            <span className="absolute right-full mr-2 flex size-[40px] shrink-0 items-center justify-center rounded-[8px] bg-[#292230] text-[#C0AEFF] md:size-[48px]">
              <Icon size={28} weight="duotone" />
            </span>
            <span>{word}</span>
          </motion.span>
        </AnimatePresence>
      </span>
    </h1>
  );
}
