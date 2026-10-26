import { Icon } from "@/components/icon";
import { PlatformViewShell } from "./platform-view-shell";
import { CryptoDesk } from "./crypto/crypto-desk";
import styles from "./crypto-platform-view.module.css";

/**
 * Crypto as worldstreetgold.com shows it ("Pillar 02"): the night sky, its
 * gold, its line, and a desk you can trade on: a sample portfolio moving
 * live and a ticket for spot or perpetual futures.
 */
export function CryptoPlatformView() {
  return (
    <PlatformViewShell
      name="Crypto"
      glass="dark"
      eyebrow={
        <span className={styles.brand}>
          <span className={styles.mark}>
            <Icon name="bitcoin" size={16} tone="current" />
          </span>
          Crypto
          <span className={styles.always}>24/7</span>
          <span className={styles.when}>The market never closes</span>
        </span>
      }
      title={
        <>
          Own the coins,
          <br />
          <span className={styles.quiet}>not just the chart.</span>
        </>
      }
    >
      <CryptoDesk />
    </PlatformViewShell>
  );
}
