import Image from "next/image";
import { PlatformViewShell } from "./platform-view-shell";
import { WorldhealthConsult } from "./worldhealth/worldhealth-consult";
import styles from "./worldhealth-platform-view.module.css";

/**
 * WorldHealth (health.worldstreetgold.com), in its own white and teal: its
 * heart mark, its line, and a consultation you can book, from telling Vivid
 * how you feel to the call itself. Not for emergencies.
 */
export function WorldhealthPlatformView() {
  return (
    <PlatformViewShell
      name="WorldHealth"
      glass="light"
      eyebrow={
        <span className={styles.brand}>
          <Image src="/assets/worldhealth/mark.svg" alt="" width={28} height={28} unoptimized />
          WorldHealth
          <span className={styles.when}>Sun 10:00 · Headache, day three</span>
        </span>
      }
      title={
        <>
          See a doctor,{" "}
          <span className={styles.marked}>
            anywhere.
            {/* The teal zigzag under it, as on worldstreetgold.com */}
            <svg aria-hidden="true" viewBox="0 0 120 24" preserveAspectRatio="none" className={styles.stroke}>
              <path d="M4 8 L36 19 L64 9 L92 19 L116 7" pathLength={1} />
            </svg>
          </span>
        </>
      }
    >
      <WorldhealthConsult />
    </PlatformViewShell>
  );
}
