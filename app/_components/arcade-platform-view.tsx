import { Icon } from "@/components/icon";
import { PlatformViewShell } from "./platform-view-shell";
import { ArcadeDuel } from "./arcade/arcade-duel";
import styles from "./arcade-platform-view.module.css";

/**
 * Arcade on cream and ink in its own lime green, with a yellow streak: its
 * mark and line, then a Trivia Duel against the Street Bot you can play,
 * beside your card on the weekly board.
 */
export function ArcadePlatformView() {
  return (
    <PlatformViewShell
      name="Arcade"
      glass="light"
      eyebrow={
        <span className={styles.brand}>
          <span className={styles.mark}>
            <Icon name="gamepad" size={16} tone="current" />
          </span>
          Arcade
          <span className={styles.when}>Tue 22:10 · One more round</span>
        </span>
      }
      title={
        <>
          Play for the streak.
          <br />
          Stay for the{" "}
          <span className={styles.marked}>
            rank.
            {/* A hand-drawn W under it in Arcade's green */}
            <svg aria-hidden="true" viewBox="0 0 120 24" preserveAspectRatio="none" className={styles.stroke}>
              <path d="M3 6 L31 19 L59 7 L88 19 L117 5" pathLength={1} />
            </svg>
          </span>
        </>
      }
    >
      <ArcadeDuel />
    </PlatformViewShell>
  );
}
