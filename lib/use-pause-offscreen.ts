"use client";

import { useEffect, type RefObject } from "react";

/** How many sleeping sections hold each element (sections nest: Vivid's intro and its switchboard sit in Vivid). */
const holds = new Map<Element, number>();

function hold(element: Element) {
  const n = holds.get(element) ?? 0;
  holds.set(element, n + 1);
  if (!n) element.setAttribute("data-held", "");
}

function release(element: Element) {
  const n = holds.get(element) ?? 0;
  if (n > 1) return void holds.set(element, n - 1);
  holds.delete(element);
  element.removeAttribute("data-held");
}

/**
 * Holds a section's looping animations still while it's well off the screen
 * (app/globals.css pauses whatever's marked data-held). Left running, a
 * bulb's pulse or a wire's flow two screens away still repaints every
 * frame, and on a phone that's frames the scroll is missing.
 *
 * Only the elements animating are marked, never the whole section: a mark on
 * the section that paused everything under it made the browser restyle every
 * element in it each time it went to sleep or woke (all 1,300 of the street's,
 * against the dozen that animate), and a fast fling crosses those edges again
 * and again, right where one part of the page hands over to the next. The
 * section itself carries data-asleep, which nothing styles.
 */
export function usePauseOffscreen(ref: RefObject<Element | null>, blocks?: string) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    // A section several screens tall is awake from end to end while any of it
    // shows, so the parts of it matching `blocks` each sleep on their own too
    // (an element is held while anything round it sleeps)
    const stops = [element, ...(blocks ? element.querySelectorAll(blocks) : [])].map(pauseOffscreen);
    return () => stops.forEach((stop) => stop());
  }, [ref, blocks]);
}

function pauseOffscreen(element: Element) {
  const held = new Set<Element>();
  let asleep = false;
  const wake = () => {
    asleep = false;
    for (const el of held) release(el);
    held.clear();
  };
  const take = (target: EventTarget | Element | null | undefined) => {
    if (!(target instanceof Element) || held.has(target)) return;
    held.add(target);
    hold(target);
  };
  // An animation that starts while the section sleeps is held too: a panel
  // or a backdrop mounted out of sight (the dial settling on a platform as
  // the page flies past, the loader's warm-up) or a light switched on from
  // the script. Only the ones running at the moment it fell asleep used to
  // be caught, and the rest restyled on every frame from screens away.
  const onStart = (event: Event) => {
    if (asleep) take(event.target);
  };
  element.addEventListener("animationstart", onStart);
  const observer = new IntersectionObserver(
    ([entry]) => {
      entry.target.toggleAttribute("data-asleep", !entry.isIntersecting);
      if (entry.isIntersecting) return wake();
      if (asleep) return;
      asleep = true;
      for (const animation of element.getAnimations({ subtree: true })) {
        take((animation.effect as KeyframeEffect | null)?.target);
      }
    },
    // Awake a little before it scrolls in
    { rootMargin: "25% 0px" },
  );
  observer.observe(element);
  return () => {
    observer.disconnect();
    element.removeEventListener("animationstart", onStart);
    wake();
  };
}
