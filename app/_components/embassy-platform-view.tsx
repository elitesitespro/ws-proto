import { Icon } from "@/components/icon";
import { EmbassyTrip } from "./embassy/embassy-trip";
import { PlatformViewShell } from "./platform-view-shell";
import styles from "./embassy-platform-view.module.css";

/**
 * E-Embassy (embassy.worldstreetgold.com), as worldstreetgold.com dresses it:
 * its mark in passport blue, its line in a serif, and a trip to follow, from
 * the passport to the visa approved.
 */
export function EmbassyPlatformView() {
  return (
    <PlatformViewShell
      name="E-Embassy"
      glass="dark"
      eyebrow={
        <span className={styles.brand}>
          <span className={styles.mark}>
            <Icon name="id-card" size={18} tone="current" />
          </span>
          E-Embassy
          <span className={styles.when}>Mon 08:52 · Visa desk, Lagos</span>
        </span>
      }
      title={
        <span className={styles.serif}>
          The world is
          <br />
          closer than you think.
        </span>
      }
    >
      <EmbassyTrip />
    </PlatformViewShell>
  );
}
