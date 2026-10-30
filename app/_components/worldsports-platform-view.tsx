import { Icon } from "@/components/icon";
import { PlatformViewShell } from "./platform-view-shell";
import { WorldsportsShare } from "./worldsports/worldsports-share";
import styles from "./worldsports-platform-view.module.css";

/**
 * WorldSports, coming soon (no address yet), as worldstreetgold.com dresses
 * it: its trophy on the pitch's green, its line, and a player share to buy
 * on the pitch. Players and prices are illustrative; 18+.
 */
export function WorldsportsPlatformView() {
  return (
    <PlatformViewShell
      name="WorldSports"
      glass="dark"
      eyebrow={
        <span className={styles.brand}>
          <span className={styles.mark}>
            <Icon name="trophy" size={18} tone="current" />
          </span>
          WorldSports
          <span className={styles.soon}>Coming soon</span>
          <span className={styles.when}>Sat 16:00 · next season</span>
        </span>
      }
      title={
        <>
          Own sport
          <br />
          like stock.
        </>
      }
    >
      <WorldsportsShare />
    </PlatformViewShell>
  );
}
