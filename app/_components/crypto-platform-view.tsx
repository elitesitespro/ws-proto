"use client";

import { useId, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChartNoAxesCombined,
  Gem,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlatformViewShell } from "./platform-view-shell";
import styles from "./crypto-platform-view.module.css";

const assets = [
  {
    name: "Bitcoin",
    short: "BTC",
    symbol: "₿",
    price: "$67,240",
    move: "+2.8%",
    down: false,
    points:
      "0,110 24,102 48,108 72,86 96,92 120,66 144,76 168,56 192,68 216,44 240,50 264,28 288,38 312,18 336,30 360,12 384,24 408,8 432,18 456,6 480,14",
  },
  {
    name: "Ethereum",
    short: "ETH",
    symbol: "Ξ",
    price: "$3,520",
    move: "+1.4%",
    down: false,
    points:
      "0,100 24,88 48,94 72,110 96,92 120,98 144,78 168,84 192,64 216,72 240,50 264,60 288,42 312,54 336,36 360,46 384,22 408,34 432,18 456,28 480,20",
  },
  {
    name: "Solana",
    short: "SOL",
    symbol: "◎",
    price: "$174",
    move: "−0.6%",
    down: true,
    points:
      "0,28 24,38 48,24 72,44 96,36 120,56 144,48 168,70 192,62 216,78 240,60 264,72 288,82 312,70 336,94 360,82 384,102 408,90 432,108 456,94 480,100",
  },
];

export function CryptoPlatformView() {
  const [asset, setAsset] = useState(0);
  const gradient = useId().replaceAll(":", "");
  const selected = assets[asset];
  const Direction = selected.down ? ArrowDownRight : ArrowUpRight;

  return (
    <PlatformViewShell
      name="Crypto"
      title={
        <>
          Your next move.
          <br />
          <span>In full view.</span>
        </>
      }
    >
      <div className={styles.market}>
        <div className={styles.topline}>
          <span>
            <ChartNoAxesCombined size={20} aria-hidden="true" /> Market pulse
          </span>
          <span className={styles.sample}>Sample prices · 24h</span>
        </div>
        <div className={styles.quote} aria-live="polite" aria-atomic="true">
          <div>
            <span className={styles.assetName}>
              {selected.name} <span>/ USD</span>
            </span>
            <strong className={styles.price}>{selected.price}</strong>
          </div>
          <span
            className={`${styles.change} ${selected.down ? styles.down : ""}`}
          >
            <Direction size={20} aria-hidden="true" /> {selected.move}
          </span>
        </div>
        <div className={`${styles.chart} ${selected.down ? styles.down : ""}`}>
          <svg
            key={selected.short}
            viewBox="0 0 480 128"
            preserveAspectRatio="none"
            role="img"
            aria-label={`${selected.name}: illustrative 24-hour ${selected.down ? "decline" : "gain"}`}
          >
            <defs>
              <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity=".24" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 32H480M0 64H480M0 96H480"
              stroke="currentColor"
              opacity=".12"
            />
            <polygon
              points={`0,128 ${selected.points} 480,128`}
              fill={`url(#${gradient})`}
            />
            <polyline
              className={styles.trace}
              points={selected.points}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              pathLength="1"
            />
          </svg>
          <div className={styles.axis}>
            <span>24 hours ago</span>
            <span>Now</span>
          </div>
        </div>
        <div className={styles.assets} aria-label="Choose an asset">
          {assets.map((item, index) => (
            <Button
              key={item.short}
              variant="ghost"
              className={styles.asset}
              aria-label={`Show ${item.name}`}
              aria-pressed={asset === index}
              onClick={() => setAsset(index)}
            >
              <span className={styles.assetIdentity}>
                <span className={styles.symbol} aria-hidden="true">
                  {item.short === "ETH" ? <Gem size={20} /> : item.symbol}
                </span>
                {item.short}
              </span>
              <span className={styles.assetPrice}>{item.price}</span>
              <span className={item.down ? styles.down : styles.gain}>
                {item.move}
              </span>
            </Button>
          ))}
        </div>
      </div>
    </PlatformViewShell>
  );
}
