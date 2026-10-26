"use client";

import { ReactLenis } from "lenis/react";

/**
 * Smooth scrolling for the whole page (Lenis, on the window). It only eases
 * the scroll: the page still scrolls natively underneath, so sticky sections
 * and anything reading the scroll (motion's useScroll) carry on as before.
 * Lenis follows the visitor's reduced-motion setting on its own: there the
 * scroll tracks the wheel 1:1 and jumps go straight to their target.
 * A scrolling area inside the page that should scroll on its own takes
 * data-lenis-prevent.
 */
export function SmoothScroll() {
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
