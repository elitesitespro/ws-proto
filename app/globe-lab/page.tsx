"use client";

import { useEffect, useRef } from "react";
import { NightGlobe, type NightGlobeHandle } from "@/components/globe/night-globe";

// A bench for the globe: one planet filling the screen, set from the query
// string, so each state of the sunrise and the dive can be screenshotted.
//   day, clouds   0 to 1
//   radius, x, y  the placement (as GlobePlacement); lens 0 flat, 1 perspective
//   spin          extra turn in radians
//   still         holds the clock at 0 (as under reduced motion), for exact comparisons
// The handle is on window.globe, and the place under the pointer on window.place.

// Under ?still the globe sees reduced motion, so its loop never runs and every
// frame is drawn at time 0. Set before the globe's own effect reads it.
if (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("still")) {
  const real = window.matchMedia.bind(window);
  window.matchMedia = (query: string) => {
    if (!query.includes("prefers-reduced-motion")) return real(query);
    const list = real(query);
    return Object.defineProperty(list, "matches", { value: true });
  };
}

export default function GlobeLabPage() {
  const globe = useRef<NightGlobeHandle>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const num = (key: string, fallback: number) => {
      const n = Number(q.get(key) ?? NaN);
      return Number.isFinite(n) ? n : fallback;
    };
    const placed = ["x", "y", "radius", "lens"].some((key) => q.has(key));
    const apply = () => {
      const g = globe.current;
      if (!g) return;
      g.frame(placed ? { x: num("x", 0.5), y: num("y", 0.5), radius: num("radius", 0.36), lens: num("lens", 0) } : null);
      g.daylight(num("day", 0));
      g.clouds(num("clouds", 0));
      g.spin(num("spin", 0));
    };
    apply();
    // For poking at from the console (and timing states against each other)
    (window as unknown as { globe?: NightGlobeHandle | null }).globe = globe.current;
    // Again as the images arrive, so a screenshot shows the settled state
    const timers = [60, 400, 1200, 2500, 4000].map((ms) => setTimeout(apply, ms));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <main className="fixed inset-0 z-50 bg-background">
      <NightGlobe
        ref={globe}
        // The place under the pointer, for checking locate() against project()
        onHoverPlace={(place) => ((window as unknown as { place?: unknown }).place = place)}
      />
    </main>
  );
}
