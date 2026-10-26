import { Icon } from "@/components/icon";
import { PlatformViewShell } from "./platform-view-shell";
import { PredictionCall } from "./prediction/prediction-call";
import styles from "./prediction-platform-view.module.css";

/**
 * Prediction: its target mark and name, then a question from each of its
 * topics with the crowd's chance moving live, and your own call to make on
 * it, every outcome with its % chance. For adults 18 and over.
 */
export function PredictionPlatformView() {
  return (
    <PlatformViewShell
      name="Prediction"
      glass="light"
      eyebrow={
        <span className={styles.brand}>
          <span className={styles.mark}>
            <Icon name="target" size={20} tone="current" />
          </span>
          Prediction
          <span className={styles.live}>3 questions live</span>
        </span>
      }
      title={
        <>
          Call it before
          <br />
          it happens.
        </>
      }
    >
      <PredictionCall />
    </PlatformViewShell>
  );
}
