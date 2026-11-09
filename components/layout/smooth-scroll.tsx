"use client";

import { ReactLenis } from "lenis/react";
import { useMediaQuery } from "@/lib/use-media-query";

/**
 * Smooth scrolling for the whole page (Lenis, on the window). It only eases
 * the scroll: the page still scrolls natively underneath, so sticky sections
 * and anything reading the scroll (motion's useScroll) carry on as before.
 * Lenis follows the visitor's reduced-motion setting on its own: there the
 * scroll tracks the wheel 1:1 and jumps go straight to their target.
 * A scrolling area inside the page that should scroll on its own takes
 * data-lenis-prevent.
 *
 * Only with a mouse or trackpad: a finger's scroll is the browser's own (Lenis
 * leaves touch alone), so on a phone it would only add a handler reading the
 * scroll on every scroll event, a forced layout each time, for nothing. There,
 * useLenis() is undefined and its callers glide natively instead.
 */
export function SmoothScroll() {
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)");
  if (!fine) return null;
  return (
    <ReactLenis
      root
      options={{
        autoRaf: true,
        // How quickly the page catches up with the wheel: lower is silkier, higher is snappier
        lerp: 0.1,
        // In-page #links glide there too
        anchors: true,
        // Following a link stops any glide still under way
        stopInertiaOnNavigate: true,
      }}
    />
  );
}
