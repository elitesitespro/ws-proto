"use client";

import { useEffect, useRef, type ReactNode } from "react";

// It's never drawn smaller than this
const SMALLEST = 0.7;
// A changing scene is fitted again at most this often (ms). Its demos change
// every few hundred ms, and fitting each change at once, every frame, cost
// more than the rest of the scroll on a phone.
const AT_MOST = 200;

/**
 * A platform preview's scene. Where the screen's too short for all of it (a
 * small phone, or one with its browser's bars showing), it's drawn a little
 * smaller to fit, instead of running down into the way in below it. It
 * fits again as the scene changes: a step in its demo, or the screen turning.
 *
 * It's measured at full size (a scene that fills its box lays out
 * differently when drawn smaller, so the drawn size can't be scaled back).
 * Unfitted, that's a read and nothing else; fitted, the zoom comes off for
 * the read and goes back on, each a restyle of the scene, so it's done at
 * most every AT_MOST ms, and a ticking number's text doesn't call for it.
 */
export function SceneFit({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = ref.current;
    if (!scene) return;
    let timer = 0;
    const fit = () => {
      timer = 0;
      // How far it runs at full size, against the room it has
      const fitted = scene.style.getPropertyValue("--fit");
      if (fitted) scene.style.removeProperty("--fit");
      const need = scene.scrollHeight;
      const room = scene.clientHeight;
      if (need > room + 4) scene.style.setProperty("--fit", Math.max(room / need, SMALLEST).toFixed(3));
    };
    const soon = () => {
      if (!timer) timer = window.setTimeout(fit, AT_MOST);
    };
    fit();
    const resized = new ResizeObserver(soon);
    resized.observe(scene);
    // Not every style change: only what changes what's in it
    const changed = new MutationObserver(soon);
    for (const child of scene.children) {
      changed.observe(child, { subtree: true, childList: true, attributeFilter: ["class", "hidden"] });
    }
    return () => {
      window.clearTimeout(timer);
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
