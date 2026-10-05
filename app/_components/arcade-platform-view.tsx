"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlatformViewShell, MiniStat } from "./platform-view-shell";
import styles from "./platform-views.module.css";
import { Trophy } from "lucide-react";

export function ArcadePlatformView() {
  const [answer, setAnswer] = useState<string | null>(null);
  return (
    <PlatformViewShell
      name="Arcade"
      title={
        <>
          One more round.
          <br />
          <span>Make it yours.</span>
        </>
      }
      extra={
        <>
          <MiniStat value="Play" label="Try a daily challenge" />
          <MiniStat value="Compete" label="Bring your friends" />
        </>
      }
    >
      <div className={`${styles.panel} ${styles.arcade}`}>
        <div className={styles.row}>
          <span className={styles.badge}>Quick challenge</span>
          <span className={styles.secondaryDetail}>01 / 01</span>
        </div>
        <div className={styles.game}>
          <div className={styles.gameEmblem}>
            <span className={styles.gameOrbit} aria-hidden="true" />
            <Trophy />
            <span className={styles.gameLevel}>Ready, set, play.</span>
          </div>
          <div className={styles.question}>
            <strong>Which planet is known as the Red Planet?</strong>
            <div className={styles.answers}>
              {["Mars", "Venus"].map((a) => (
                <Button
                  key={a}
                  aria-pressed={answer === a}
                  onClick={() => setAnswer(a)}
                >
                  {a}
                </Button>
              ))}
            </div>
            <p aria-live="polite">
              {answer
                ? answer === "Mars"
                  ? "Correct. Nicely played!"
                  : "Try again. Think red."
                : "Your next win starts here."}
            </p>
          </div>
        </div>
      </div>
    </PlatformViewShell>
  );
}
