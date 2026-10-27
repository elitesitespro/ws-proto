"use client";

import { useEffect, type RefObject } from "react";

/**
 * Marks a section `data-asleep` while it's well off the screen, so its
 * looping animations hold still (app/globals.css pauses them). Left
 * running, a bulb's pulse or a wire's flow two screens away still
 * repaints every frame, and on a phone that's frames the scroll is
 * missing.
 */
export function usePauseOffscreen(ref: RefObject<Element | null>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.target.toggleAttribute("data-asleep", !entry.isIntersecting),
      // Awake a little before it scrolls in
      { rootMargin: "25% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
}
