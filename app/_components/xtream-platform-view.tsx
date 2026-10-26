"use client";

import Image from "next/image";
import { PlatformViewShell } from "./platform-view-shell";
import { XtreamBattle } from "./xtream/xtream-battle";
import styles from "./xtream-platform-view.module.css";

/**
 * Xtream, in its own dark and heat (xtream.worldstreetgold.com): its chilli
 * mark, its line ("Go live. Get backed. Get paid."), and a battle you can
 * play: two rooms, one clock, and the gifts that decide it.
 */
export function XtreamPlatformView() {
  return (
    <PlatformViewShell
      name="XStream"
      glass="dark"
      eyebrow={
        <span className={styles.brand}>
          <Image src="/assets/xtream/mark.webp" alt="" width={37} height={28} />
          Xtream
          <span className={styles.live}>Live battle · 8.1K watching</span>
        </span>
      }
      title={
        <>
          Go live. Get backed. <span className={styles.heat}>Get paid.</span>
        </>
      }
    >
      <XtreamBattle />
    </PlatformViewShell>
  );
}
