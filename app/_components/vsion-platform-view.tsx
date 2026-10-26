"use client";

import { Icon } from "@/components/icon";
import { PlatformViewShell } from "./platform-view-shell";
import { VisionParty } from "./vision/vision-party";
import styles from "./vsion-platform-view.module.css";

/**
 * Vision (vision.worldstreetgold.com), in its own gold on near-black: its
 * line from worldstreetgold.com, a watch party you can run, and tonight's
 * originals on a drifting wall.
 */
export function VsionPlatformView() {
  return (
    <PlatformViewShell
      name="Vsion"
      glass="dark"
      eyebrow={
        <span className={styles.brand}>
          <span className={styles.mark}>
            <Icon name="play" size={16} tone="current" />
          </span>
          Vision
          <span className={styles.when}>Fri 21:00 · Watch party starts</span>
        </span>
      }
      title={
        <>
          Our films. Our shows.
          <br />
          <span className={styles.marked}>
            Watched together.
            {/* The gold zigzag under it, as on worldstreetgold.com */}
            <svg aria-hidden="true" viewBox="0 0 120 24" preserveAspectRatio="none" className={styles.stroke}>
              <path d="M3 8 L40 18 L62 9 L84 18 L117 6" pathLength={1} />
            </svg>
          </span>
        </>
      }
    >
      <VisionParty />
    </PlatformViewShell>
  );
}
