"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { HERO, INSIDE, SECTION_ORDER, type KeyedAsk } from "./vivid-pill-questions";

/** Where on the screen "the section you're reading" is measured: a line 45% of the way down. */
const LINE = 0.45;
/** How often the placeholder rolls on to the next question (ms). */
const ROLL_MS = 4200;

/** The site footer: the last <footer> on the page (the layout renders it after the page). */
function siteFooter() {
  const all = document.getElementsByTagName("footer");
  return all[all.length - 1] ?? null;
}

/**
 * The part of the page across the line 45% down the screen, by its id in
 * SECTION_ORDER (HERO above the first). An IntersectionObserver on a 1%
 * band watches it, so nothing is measured while the page scrolls: it only
 * answers when a section crosses the line. Only while `active`.
 */
export function useSectionInView(active: boolean) {
  const [id, setId] = useState<string>(HERO);
  useEffect(() => {
    if (!active) return;
    const keys = new Map<Element, string>();
    for (const key of SECTION_ORDER) {
      const el = key === "footer" ? siteFooter() : document.getElementById(key);
      if (el) keys.set(el, key);
    }
    const under = new Set<string>();
    const pick = () => {
      let best: string | null = null;
      for (const key of SECTION_ORDER) if (under.has(key)) best = key;
      if (best) {
        const next = best;
        // Between two districts, the street itself is under the line: keep the district you were on
        setId((prev) => (INSIDE[prev] === next ? prev : next));
        return;
      }
      // Nothing under the line: above the first section it's the globe at the top, otherwise a gap, so keep
      const first = document.getElementById(SECTION_ORDER[0]);
      if (first && first.getBoundingClientRect().top > window.innerHeight * LINE) setId(HERO);
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const key = keys.get(entry.target);
          if (!key) continue;
          if (entry.isIntersecting) under.add(key);
          else under.delete(key);
        }
        pick();
      },
      { rootMargin: `-${LINE * 100}% 0px -${100 - LINE * 100 - 1}% 0px` },
    );
    keys.forEach((_, el) => io.observe(el));
    return () => io.disconnect();
  }, [active]);
  return id;
}

/* The platform on the dial: the hue the dial's section wears (data-hue on
   #discover). A MutationObserver hears it change, so it costs nothing until
   the dial turns. */
const dialHue = () => document.getElementById("discover")?.dataset.hue ?? null;
const watchDial = (onChange: () => void) => {
  const dial = document.getElementById("discover");
  if (!dial) return () => {};
  const watcher = new MutationObserver(onChange);
  watcher.observe(dial, { attributes: true, attributeFilter: ["data-hue"] });
  return () => watcher.disconnect();
};

export function useDialPlatform() {
  return useSyncExternalStore(watchDial, dialHue, () => null);
}

/** The questions, one at a time, rolling on every few seconds while `running`; back to the first when they change. */
export function useRollingQuestion(ask: KeyedAsk, running: boolean) {
  const { key, qs } = ask;
  const [roll, setRoll] = useState({ key, n: 0 });
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setRoll((r) => (r.key === key ? { key, n: r.n + 1 } : { key, n: 1 }));
    }, ROLL_MS);
    return () => window.clearInterval(timer);
  }, [key, running]);
  const n = (roll.key === key ? roll.n : 0) % qs.length;
  return { q: qs[n], key: `${key}-${n}` };
}
