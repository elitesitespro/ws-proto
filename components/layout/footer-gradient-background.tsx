"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { GrainyGradient } from "@/components/ui/grainy-gradient";

export function FooterGradientBackground() {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(backgroundRef, { amount: 0.15 });
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      ref={backgroundRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: reduceMotion || isInView ? 1 : 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 1.1, delay: 0.35, ease: "easeInOut" }
      }
    >
      <GrainyGradient
        variant="yellow"
        seed="worldstreet-footer"
        className="h-full w-full rounded-none"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#070405_0%,rgba(7,4,5,0.86)_25%,rgba(7,4,5,0.5)_60%,transparent_100%)]" />
    </motion.div>
  );
}
