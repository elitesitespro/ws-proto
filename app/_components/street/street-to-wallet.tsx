"use client";

import { useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { WalletSection } from "../wallet-section";
import { ANCHOR, END_GAP, PULL_UP, StreetSection } from "./street-section";

// How far you scroll while the wallet opens out of the street's end
const ROOM = "90svh";
// Where the road ends on the screen while the street is pinned: the car's
// line, and its parking spot just short of the end
const END_Y = `calc(${ANCHOR * 100}svh + ${PULL_UP}px)`;

/**
 * The street, then the wallet behind it. When the car pulls up at the end of
 * the street, the street holds, and a circle opens from the road's end as
 * you scroll: the wallet, seen through it, until it fills the screen. Then
 * the wallet scrolls on as any section does. (With reduced motion the two
 * just follow one another.)
 */
export function StreetToWallet() {
  const reduce = useReducedMotion();
  const [endX, setEndX] = useState<number | null>(null);
  const open = !reduce;

  return (
    <>
      <div className="relative">
        <StreetSection pinned={open} onRoadEnd={setEndX} />
        {/* Room for the street to stay pinned while the wallet opens */}
        {open && <div aria-hidden="true" style={{ height: ROOM }} />}
      </div>
      <WalletSection
        vividHref="#vivid"
        reveal={
          open
            ? {
                x: endX === null ? "50%" : `${endX}px`,
                y: END_Y,
                // The wallet starts where the street pins, so it's pinned in
                // place behind it for the same stretch
                overlap: `calc(${-ANCHOR * 100}svh - ${PULL_UP + END_GAP}px - ${ROOM})`,
                room: ROOM,
              }
            : undefined
        }
      />
    </>
  );
}
