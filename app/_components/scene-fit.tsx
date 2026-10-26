"use client";

import { useEffect, useRef, type ReactNode } from "react";

// It's never drawn smaller than this
const SMALLEST = 0.7;

/**
 * A platform preview's scene. Where the screen's too short for all of it (a
 * small phone, or one with its browser's bars showing), it's drawn a little
 * smaller to fit, instead of running down into the way in below it. It
 * fits again as the scene changes: a step in its demo, or the screen turning.
 */
export function SceneFit({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = ref.current;
    if (!scene) return;
    let frame = 0;
    const fit = () => {
      frame = 0;
      // How far it runs at full size, against the room it has
      scene.style.removeProperty("--fit");
      const need = scene.scrollHeight;
      const room = scene.clientHeight;
      if (need > room + 4) scene.style.setProperty("--fit", String(Math.max(room / need, SMALLEST)));
    };
    const soon = () => {
      if (!frame) frame = requestAnimationFrame(fit);
    };
    fit();
    const resized = new ResizeObserver(soon);
    resized.observe(scene);
    // Not every style change: only what changes what's in it
    const changed = new MutationObserver(soon);
    for (const child of scene.children) {
      changed.observe(child, { subtree: true, childList: true, characterData: true, attributeFilter: ["class", "hidden"] });
    }
    return () => {
      cancelAnimationFrame(frame);
      resized.disconnect();
      changed.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
