"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlatformViewShell } from "./platform-view-shell";
import styles from "./platform-views.module.css";

export function ForexPlatformView() {
  const [pair, setPair] = useState(0);
  const pairs = ["EUR / USD", "GBP / USD", "AUD / USD"];
  return (
    <PlatformViewShell
      name="Forex"
      title={
        <>
          A world in motion.
          <br />
          <span>See the bigger picture.</span>
        </>
      }
      controls={
        <>
          {pairs.map((n, i) => (
            <Button
              key={n}
              variant="ghost"
              aria-pressed={pair === i}
              onClick={() => setPair(i)}
            >
              {n.replaceAll(" ", "")}
            </Button>
          ))}
        </>
      }
    >
      <div className={styles.panel}>
        <div className={styles.row}>
          <strong>{pairs[pair]}</strong>
          <span className={styles.muted}>24H · Sample</span>
        </div>
        <div className={styles.row}>
          <strong className={styles.large}>
            {["1.0846", "1.2732", "0.6581"][pair]}
          </strong>
          <span className={styles.accent}>
            +{["0.24", "0.18", "0.32"][pair]}%
          </span>
        </div>
        <div className={styles.marketChart} aria-hidden="true" />
        <div className={styles.sessions}>
          <span>Tokyo</span>
          <span>London</span>
          <span>New York</span>
        </div>
      </div>
    </PlatformViewShell>
  );
}
