"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimationControls, useInView, useReducedMotion } from "motion/react";

export function HeroGradientBackground() {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const inView = useInView(backgroundRef, { amount: 0.1 });
  const reducedMotion = useReducedMotion();
  const controls = useAnimationControls();
  const hasEntered = useRef(false);

  useEffect(() => {
    if (reducedMotion) {
      controls.set({ opacity: 1, maskImage: "none" });
      return;
    }

    if (!inView) {
      controls.set({ opacity: 0 });
      return;
    }

    // The hero is the first section: subsequent entries come from below.
    const angle = hasEntered.current ? 0 : 180;
    hasEntered.current = true;
    const hiddenMask = `linear-gradient(${angle}deg, #000 -25%, transparent 0%)`;
    const visibleMask = `linear-gradient(${angle}deg, #000 100%, transparent 125%)`;
    controls.set({ opacity: 1, maskImage: hiddenMask });
    void controls.start({
      maskImage: visibleMask,
      transition: { duration: 1.6, ease: [.22, 1, .36, 1] },
    });

    return () => controls.stop();
  }, [controls, inView, reducedMotion]);

  return (
    <motion.div ref={backgroundRef} initial={{ opacity: 0 }} animate={controls} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div
        className="absolute inset-0"
        style={{ backgroundImage: "linear-gradient(180deg, #FFF08C 0%, #FFE278 60%, #E87631 100%)" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgba(7,4,5,0.12)_70%,rgba(7,4,5,0.5)_82%,rgba(7,4,5,0.86)_92%,#070405_100%)]" />
    </motion.div>
  );
}
