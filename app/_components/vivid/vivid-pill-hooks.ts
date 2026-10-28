"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useMediaQuery } from "@/lib/use-media-query";
import { HERO, INSIDE, SECTION_ORDER, type KeyedAsk } from "./vivid-pill-questions";

/** Where on the screen "the section you're reading" is measured: a line 45% of the way down. */
const LINE = 0.45;
/** How often the placeholder rolls on to the next question (ms). */
const ROLL_MS = 4200;
/** From the hero's loader opening to the last of its parts in place (ms): the welcome, the headline, the line, the
 *  buttons and the cue, each 700ms, 85ms after the one before. */
const ENTRANCE = 1400;

/** The site footer: the last <footer> on the page (the layout renders it after the page). */
function siteFooter() {
  const all = document.getElementsByTagName("footer");
  return all[all.length - 1] ?? null;
}

/**
 * The part of the page across the line 45% down the screen, by its id in
 * SECTION_ORDER (HERO above the first). An IntersectionObserver on a 1%
 * band watches it, so nothing is measured while the page scrolls: it only
 * answers when a section crosses the line. A part whose box isn't where it
 * shows (the wallet, pinned behind the street long before it opens out of
 * it) marks where it does with data-vivid-part="<id>".
 */
export function useSectionInView() {
  const [id, setId] = useState<string>(HERO);
  useEffect(() => {
    const keys = new Map<Element, string>();
    for (const key of SECTION_ORDER) {
      const el =
        key === "footer"
          ? siteFooter()
          : (document.querySelector(`[data-vivid-part="${key}"]`) ?? document.getElementById(key));
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
  }, []);
  return id;
}

/**
 * The hero's entrance is over: its loader has opened onto it (data-loading
 * gone from its wrapper, globe-preview-section.tsx) and its parts have risen
 * in, the last about ENTRANCE ms later (hero-copy.module.css). A
 * MutationObserver hears the loader go. With no loader on the page, or
 * without motion, a moment later or at once.
 */
export function useHeroEntered(reduce: boolean) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    let timer = 0;
    const enter = () => {
      timer = window.setTimeout(() => setEntered(true), reduce ? 0 : ENTRANCE);
    };
    const loader = document.querySelector("[data-loading]");
    if (!loader) {
      enter();
      return () => window.clearTimeout(timer);
    }
    const watcher = new MutationObserver(() => {
      if (loader.hasAttribute("data-loading")) return;
      watcher.disconnect();
      enter();
    });
    watcher.observe(loader, { attributes: true, attributeFilter: ["data-loading"] });
    return () => {
      watcher.disconnect();
      window.clearTimeout(timer);
    };
  }, [reduce]);
  return entered;
}

/**
 * How the pill rides through each part of the page:
 * - open: the foot of the screen is free there. It's the pill, tucking into
 *   the thumb as you scroll down and opening as you scroll back up, or the
 *   first time you stop in a part it hasn't opened in yet.
 * - tuck: the part has things at the foot (the street's exits and captions,
 *   the Explore button under a laptop's dial). Just the thumb, its questions
 *   following along, until it's tapped.
 * - aside: the part needs the foot, or has a Vivid of its own: below 1024px
 *   the dial turns along the foot, and the wallet's dashboard has its own Ask
 *   Vivid, which Vivid's intro lifts out. It sinks out of sight, and comes
 *   back up after.
 */
export type Stance = "open" | "tuck" | "aside";
const STANCE: Partial<Record<string, Stance>> = {
  discover: "tuck",
  street: "tuck",
  connect: "tuck",
  entertainment: "tuck",
  lifestyle: "tuck",
  markets: "tuck",
  wallet: "aside",
};

export function useStance(section: string): Stance {
  // The dial's row at the foot (platform-timeline-section.module.css), unless it's laid out as a list instead (a
  // short screen, or reduced motion)
  const dialAtFoot = useMediaQuery(
    "(max-width: 1023px) and (min-height: 561px) and (prefers-reduced-motion: no-preference)",
  );
  if (section === "discover" && dialAtFoot) return "aside";
  return STANCE[section] ?? "open";
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
