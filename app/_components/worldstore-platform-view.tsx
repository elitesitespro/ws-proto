"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlatformViewShell, MiniStat } from "./platform-view-shell";
import styles from "./platform-views.module.css";
import type { CSSProperties } from "react";
import { Heart, ShoppingBag } from "lucide-react";

export function WorldstorePlatformView() {
  const [color, setColor] = useState(0);
  const [saved, setSaved] = useState(false);
  const colors = ["#bca57d", "#829575", "#d7b0aa"];
  return (
    <PlatformViewShell
      name="WorldStore"
      title={
        <>
          Small finds.
          <br />
          <span>Big personality.</span>
        </>
      }
      extra={
        <>
          <MiniStat value="Discover" label="Meet local sellers" />
          <MiniStat value="Sell" label="Give your ideas a shop" />
        </>
      }
    >
      <div className={`${styles.panel} ${styles.shop}`}>
        <div className={styles.product}>
          <div
            className={styles.tote}
            style={{ "--bag-color": colors[color] } as CSSProperties}
          >
            <ShoppingBag aria-hidden="true" />
          </div>
        </div>
        <div className={styles.productCopy}>
          <span className={`${styles.accent} ${styles.compactHide}`}>
            The everyday edit
          </span>
          <strong>Everyday tote</strong>
          <span className={styles.large}>₦45,000</span>
          <div className={styles.swatches}>
            {colors.map((c, i) => (
              <button
                key={c}
                style={{ background: c }}
                aria-label={["Sand", "Sage", "Rose"][i]}
                aria-pressed={color === i}
                onClick={() => setColor(i)}
              />
            ))}
          </div>
          <Button
            className={styles.reaction}
            aria-pressed={saved}
            onClick={() => setSaved(!saved)}
          >
            <Heart size={20} fill={saved ? "currentColor" : "none"} />
            {saved ? "Saved" : "Save"}
          </Button>
        </div>
      </div>
    </PlatformViewShell>
  );
}
