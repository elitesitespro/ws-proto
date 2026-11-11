"use client";

import { useEffect, useRef, type ReactNode } from "react";

// It's never drawn smaller than this (still readable on a phone)
const SMALLEST = 0.66;
// A changing scene is fitted again at most this often (ms). Its demos change
// every few hundred ms, and fitting each change at once, every frame, cost
// more than the rest of the scroll on a phone.
const AT_MOST = 200;
// And once more this long after the last change (ms), when whatever it set
// off has settled: a card easing open, a row sliding in
const SETTLE = 520;

/**
 * A platform preview's scene. Where the screen's too short for all of it (a
 * small phone, or one with its browser's bars showing), it's drawn a little
 * smaller to fit, instead of running down into the way in below it. It
 * fits again as the scene changes: a step in its demo, a picture or the
 * font arriving, or the screen turning.
 *
 * It's measured at full size (a scene that fills its box lays out
 * differently when drawn smaller, so the drawn size can't be scaled back).
 * Unfitted, that's a read and nothing else; fitted, the zoom comes off for
 * the read and goes back on, each a restyle of the scene, so it's done at
 * most every AT_MOST ms (the first change after a quiet spell at once), and
 * a ticking number's text doesn't call for it.
 *
 * A scene that still wouldn't fit at SMALLEST is marked data-cut, and held
 * to its own box (platform-views.module.css): never under the way in.
 */
export function SceneFit({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = ref.current;
    if (!scene) return;
    let timer = 0;
    let settle = 0;
    let last = 0;
    const fit = () => {
      window.clearTimeout(timer);
      timer = 0;
      last = performance.now();
      // How far it runs at full size, against the room it has
      const fitted = scene.style.getPropertyValue("--fit");
      if (fitted) scene.style.removeProperty("--fit");
      const need = scene.scrollHeight;
      const room = scene.clientHeight;
      let scale = need > room + 4 ? Math.max(room / need, SMALLEST) : 1;
      let cut = false;
      if (scale < 1) {
        scene.style.setProperty("--fit", scale.toFixed(3));
        // Drawn smaller it's wider in its own terms, so what's sized by its
        // width (a row of square tiles, a picture) comes out taller than the
        // share predicted: take off what's still over, three times at most
        for (let i = 0; i < 3; i++) {
          const drawn = scene.scrollHeight;
          if (drawn <= room + 2) break;
          if (scale <= SMALLEST) {
            cut = true;
            break;
          }
          scale = Math.max((scale * room) / drawn, SMALLEST);
          scene.style.setProperty("--fit", scale.toFixed(3));
        }
        if (!cut && scale <= SMALLEST) cut = scene.scrollHeight > room + 2;
      }
      if (cut !== scene.hasAttribute("data-cut")) scene.toggleAttribute("data-cut", cut);
    };
    // A change after a quiet spell is fitted straight away (a mutation's
    // callback runs before the frame paints, so a card that just grew is
    // never drawn under the way in); one hard on another's heels waits out
    // the rest of AT_MOST
    const soon = () => {
      if (!timer) {
        const since = performance.now() - last;
        if (since >= AT_MOST) fit();
        else timer = window.setTimeout(fit, AT_MOST - since);
      }
      window.clearTimeout(settle);
      settle = window.setTimeout(fit, SETTLE);
    };
    // First fitted by the ResizeObserver's opening report, which comes once the page is laid out and before it's
    // painted. Fitted here, as the scene went on, the read made the browser restyle and lay out the whole page
    // there and then, with the rest of that frame still to come (the dial puts a scene on as it turns).
    const resized = new ResizeObserver(soon);
    resized.observe(scene);
    // Not every style change: only what changes what's in it
    const changed = new MutationObserver(soon);
    changed.observe(scene, { subtree: true, childList: true, attributeFilter: ["class", "hidden"] });
    // A picture loading in (load doesn't bubble, so it's caught on the way down), or the font
    scene.addEventListener("load", soon, true);
    document.fonts?.addEventListener("loadingdone", soon);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(settle);
      resized.disconnect();
      changed.disconnect();
      scene.removeEventListener("load", soon, true);
      document.fonts?.removeEventListener("loadingdone", soon);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
