import { PlatformViewShell } from "./platform-view-shell";
import { WorldstoreDeal } from "./worldstore/worldstore-deal";
import styles from "./worldstore-platform-view.module.css";

/**
 * WorldStore (shop.worldstreetgold.com), in its own dark and gold: its W, its
 * line from worldstreetgold.com, then a deal you can run from offer to
 * escrow to the seller being paid (worldstore/).
 */
export function WorldstorePlatformView() {
  return (
    <PlatformViewShell
      name="WorldStore"
      glass="dark"
      eyebrow={
        <span className={styles.brand}>
          <span className={styles.mark}>
            {/* The WorldStreet W, in ink on the gold tile, as in the app's header */}
            <svg viewBox="0 0 82 56" aria-hidden="true">
              <path d="M40.9 25.2 27.6 49 4 7h26.7l10.2 18.2Z" />
              <path d="M77.9 7 54.3 49 40.9 25.2 51.2 7h26.7Z" />
            </svg>
          </span>
          WorldStore
          <span className={styles.when}>Wed 14:20 · A tote from Lekki</span>
        </span>
      }
      title={
        <>
          Buy it. Sell it.{" "}
          <span className={styles.marked}>
            Safely.
            {/* The drawn zigzag under it, as on worldstreetgold.com */}
            <svg aria-hidden="true" viewBox="0 0 120 24" preserveAspectRatio="none" className={styles.stroke}>
              <path d="M3 8 L40 18 L62 9 L84 18 L117 6" pathLength={1} />
            </svg>
          </span>
        </>
      }
    >
      <WorldstoreDeal />
    </PlatformViewShell>
  );
}
