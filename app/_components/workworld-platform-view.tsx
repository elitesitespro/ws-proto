import { Icon } from "@/components/icon";
import { PlatformViewShell } from "./platform-view-shell";
import { WorldworkFinder } from "./workworld/worldwork-finder";
import styles from "./workworld-platform-view.module.css";

/**
 * WorkWorld, which the product calls Worldwork (work.worldstreetgold.com):
 * its black and white, its line, and the directory you can use, a trade's
 * providers closest first, to call yourself.
 */
export function WorkworldPlatformView() {
  return (
    <PlatformViewShell
      name="WorkWorld"
      glass="dark"
      eyebrow={
        <span className={styles.brand}>
          <span className={styles.mark}>
            <Icon name="wrench" size={16} tone="current" />
          </span>
          Worldwork
          <span className={styles.when}>Mon 07:25 · The gate hinge snapped</span>
        </span>
      }
      title={
        <>
          Find someone who
          <br />
          does the thing you{" "}
          <span className={styles.marked}>
            need.
            {/* The white zigzag under it, as on worldstreetgold.com */}
            <svg aria-hidden="true" viewBox="0 0 120 24" preserveAspectRatio="none" className={styles.stroke}>
              <path d="M4 8 L36 19 L60 9 L84 19 L116 6" pathLength={1} />
            </svg>
          </span>
        </>
      }
    >
      <WorldworkFinder />
    </PlatformViewShell>
  );
}
