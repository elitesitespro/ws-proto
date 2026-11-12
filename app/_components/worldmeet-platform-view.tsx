import type { ReactNode } from "react";
import Image from "next/image";
import { PlatformViewShell } from "./platform-view-shell";
import styles from "./worldmeet-platform-view.module.css";

/**
 * WorldMeet, which WorldCall became, in its own white and gold: its mark and
 * line over the call (worldmeet/): the one you can run on a desktop, a still
 * of it on a phone.
 */
export function WorldmeetPlatformView({ children }: { children: ReactNode }) {
  return (
    <PlatformViewShell
      name="WorldMeet"
      glass="light"
      eyebrow={
        <span className={styles.brand}>
          <Image src="/assets/worldmeet/mark.svg" alt="" width={28} height={28} unoptimized />
          WorldMeet
        </span>
      }
      title={
        <>
          <span className={styles.lead}>Family in London. Team in Lagos.</span>
          <span className={styles.link}>
            One{" "}
            <span className={styles.marked}>
              link.
              {/* A hand-drawn gold squiggle under the word, as on worldstreetgold.com */}
              <svg aria-hidden="true" viewBox="0 0 120 24" preserveAspectRatio="none" className={styles.squiggle}>
                <path d="M3 14 C 15 4, 25 4, 33 13 S 51 22, 61 12 S 81 3, 91 12 S 109 21, 117 10" pathLength={1} />
              </svg>
            </span>
          </span>
        </>
      }
    >
      {children}
    </PlatformViewShell>
  );
}
