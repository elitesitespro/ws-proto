import { Icon } from "@/components/icon";
import { PlatformViewShell } from "./platform-view-shell";
import { ForexDesk } from "./forex/forex-desk";
import styles from "./forex-platform-view.module.css";

/**
 * Forex (portal.worldstreetgold.com), as worldstreetgold.com dresses it:
 * warm paper, ink and yellow, its line, and a desk to try: a moving chart,
 * the sessions on the real clock, and an order ticket with take-profit and
 * stop-loss. Sample figures only.
 */
export function ForexPlatformView() {
  return (
    <PlatformViewShell
      name="Forex"
      glass="light"
      eyebrow={
        <span className={styles.brand}>
          <span className={styles.mark}>
            <Icon name="candlestick-chart" size={16} tone="current" />
          </span>
          Forex
          <span className={styles.when}>Mon 08:00 · London opens</span>
        </span>
      }
      title={
        <>
          Trade the pairs
          <br />
          that move <span className={styles.world}>the world.</span>
        </>
      }
    >
      <ForexDesk />
    </PlatformViewShell>
  );
}
