"use client";

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { HUB, isHubLink } from "@/lib/hub";
import { BrandLoader } from "@/components/ui/brand-loader";
import styles from "./hub-handoff.module.css";

type Leaving = { href: string; x: number; y: number; to: number };

/** How long the hub has to take over before the page lifts the stone again (a navigation the browser dropped). */
const GIVE_UP_MS = 10_000;
/** A browser lets an unused connection go after about ten seconds, so a warm-up older than this is cold again. */
const WARM_MS = 8_000;

let warmedAt = -WARM_MS;
/** Open the connection to the hub ahead of the visit (DNS, TLS), at most once while it's still warm. */
function warmUp() {
  const now = performance.now();
  if (now - warmedAt < WARM_MS) return;
  warmedAt = now;
  const hint = document.createElement("link");
  hint.rel = "preconnect";
  hint.href = HUB;
  document.head.append(hint);
  window.setTimeout(() => hint.remove(), WARM_MS);
}

/** A link into the hub that opens in this tab, under whatever was pointed at. */
function hubLinkAt(target: EventTarget | null) {
  const link = target instanceof Element ? target.closest<HTMLAnchorElement>("a[href]") : null;
  if (!link || (link.target && link.target !== "_self") || link.hasAttribute("download")) return null;
  return isHubLink(link.href) ? link : null;
}

/** Off to the hub, once. */
function go(gone: RefObject<boolean>, href: string) {
  if (gone.current) return;
  gone.current = true;
  window.location.assign(href);
}

/**
 * Into the hub. A link that leads there (lib/hub.ts: onboarding, Home, Vivid)
 * and opens in this tab doesn't cut straight to it: the hub's stone grows
 * out of what was pressed, in a circle with a gold rim (the way the wallet
 * opens out of the street), and the hub loads behind it on the same colour
 * (its onboarding and Home are on #0C0A09), the hub's W loader drawing
 * itself in the middle until the hub paints. The connection to the hub is
 * opened as a pointer or focus comes to such a link, and again on the press,
 * so it's warm by the time the circle has closed. Links that open a new tab,
 * and clicks with a modifier key, are left to the browser. Under reduced
 * motion the stone fades in and the hub is asked for at once. Coming back
 * with the browser's back button, from its page cache, the landing is as it
 * was left.
 */
export function HubHandoff() {
  const [leaving, setLeaving] = useState<Leaving | null>(null);
  const gone = useRef(false);

  useEffect(() => {
    const onIntent = (event: Event) => {
      if (hubLinkAt(event.target)) warmUp();
    };
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = hubLinkAt(event.target);
      if (!link) return;
      event.preventDefault();
      warmUp();
      // From the finger or the pointer; from a key, the middle of the link
      let { clientX: x, clientY: y } = event;
      if (event.detail === 0) {
        const box = link.getBoundingClientRect();
        x = box.left + box.width / 2;
        y = box.top + box.height / 2;
      }
      // Out past the farthest corner, rim and all
      const to = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 48;
      gone.current = false;
      setLeaving({ href: link.href, x, y, to });
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) go(gone, link.href);
    };
    // Back from the hub: the page cache kept the stone up
    const onShow = (event: PageTransitionEvent) => {
      if (event.persisted) setLeaving(null);
    };
    document.addEventListener("pointerover", onIntent, { passive: true });
    document.addEventListener("focusin", onIntent);
    document.addEventListener("click", onClick);
    window.addEventListener("pageshow", onShow);
    return () => {
      document.removeEventListener("pointerover", onIntent);
      document.removeEventListener("focusin", onIntent);
      document.removeEventListener("click", onClick);
      window.removeEventListener("pageshow", onShow);
    };
  }, []);

  // Off once it's covered, or not long after should the animation never say so
  useEffect(() => {
    if (!leaving) return;
    const late = window.setTimeout(() => go(gone, leaving.href), 700);
    const giveUp = window.setTimeout(() => setLeaving(null), GIVE_UP_MS);
    return () => {
      window.clearTimeout(late);
      window.clearTimeout(giveUp);
    };
  }, [leaving]);

  if (!leaving) return null;
  return (
    <div
      aria-hidden="true"
      className={styles.veil}
      style={{ "--x": `${leaving.x}px`, "--y": `${leaving.y}px`, "--to": `${leaving.to}px` } as CSSProperties}
      // The circle's own end, not the mark's inside it
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) go(gone, leaving.href);
      }}
    >
      {/* The hub's loader, where the hub draws its own, so the wait for it reads as the hub already loading */}
      <BrandLoader label={null} className={styles.loader} />
    </div>
  );
}
