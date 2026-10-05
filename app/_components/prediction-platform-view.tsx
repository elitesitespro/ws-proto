"use client";

import { useId, useState } from "react";
import {
  ArrowUpRight,
  Bitcoin,
  Check,
  Music2,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import styles from "./prediction-platform-view.module.css";

const markets = [
  {
    category: "Crypto",
    Icon: Bitcoin,
    question: "Will Bitcoin hit $100k this year?",
    short: "Bitcoin to $100k",
    odds: 72,
    change: "+8",
    volume: "$248k",
    people: "1,842",
    path: "M0 82 L24 76 L48 81 L72 62 L96 68 L120 53 L144 59 L168 39 L192 48 L216 29 L240 34 L264 17 L288 22 L320 8",
  },
  {
    category: "Sport",
    Icon: Trophy,
    question: "Will the home team win the final?",
    short: "Home team takes the title",
    odds: 64,
    change: "+5",
    volume: "$186k",
    people: "1,206",
    path: "M0 86 L24 76 L48 66 L72 71 L96 59 L120 65 L144 48 L168 53 L192 36 L216 44 L240 26 L264 32 L288 22 L320 17",
  },
  {
    category: "Music",
    Icon: Music2,
    question: "Will the next album reach 1B streams?",
    short: "The next billion-stream album",
    odds: 81,
    change: "+12",
    volume: "$92k",
    people: "864",
    path: "M0 92 L24 89 L48 75 L72 80 L96 60 L120 68 L144 46 L168 52 L192 31 L216 36 L240 18 L264 24 L288 9 L320 4",
  },
] as const;

export function PredictionPlatformView() {
  const [selected, setSelected] = useState(0);
  const [choice, setChoice] = useState<"Yes" | "No" | null>(null);
  const gradientId = useId();
  const market = markets[selected];
  function selectMarket(index: number) {
    setSelected(index);
    setChoice(null);
  }

  return (
    <article className={styles.view} aria-label="Prediction market preview">
      <header className={styles.intro}>
        <p className={styles.kicker}>
          <span />A world of possibilities
        </p>
        <h3>
          The future.
          <br />
          <span>What’s your call?</span>
        </h3>
        <p className={styles.description}>
          Big moments. Different opinions. Pick your side.
        </p>
      </header>

      <div className={styles.categories} aria-label="Preview market categories">
        {markets.map(({ category, Icon }, index) => (
          <Button
            key={category}
            variant="ghost"
            size="sm"
            aria-pressed={selected === index}
            onClick={() => selectMarket(index)}
            className={styles.category}
          >
            <Icon size={20} aria-hidden="true" />
            {category}
          </Button>
        ))}
      </div>

      <Card className={styles.market}>
        <div className={styles.marketTop}>
          <span className={styles.marketLabel}>
            <market.Icon size={24} aria-hidden="true" />
            The big question
          </span>
          <span className={styles.sample}>Market preview</span>
        </div>
        <h4>{market.question}</h4>
        <div className={styles.chartRow}>
          <div className={styles.odds}>
            <strong>
              {market.odds}
              <span>%</span>
            </strong>
            <span>Chance of yes</span>
          </div>
          <div className={styles.chart}>
            <span className={styles.change}>
              <TrendingUp size={20} aria-hidden="true" />
              {market.change} pts today
            </span>
            <svg
              key={selected}
              viewBox="0 0 320 104"
              role="img"
              aria-label={`Illustrative rising odds chart for ${market.category}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop stopColor="#c8f06b" stopOpacity=".35" />
                  <stop offset="1" stopColor="#c8f06b" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={`${market.path} L320 104 L0 104 Z`}
                fill={`url(#${gradientId})`}
              />
              <path
                className={styles.chartLine}
                d={market.path}
                fill="none"
                stroke="#c8f06b"
                strokeWidth="3"
                vectorEffect="non-scaling-stroke"
                pathLength="1"
              />
            </svg>
            <div className={styles.chartLabels}>
              <span>24 hours ago</span>
              <span>Now</span>
            </div>
          </div>
        </div>
        <div className={styles.split} aria-hidden="true">
          <span style={{ width: `${market.odds}%` }} />
        </div>
        <div className={styles.outcomes}>
          {(["Yes", "No"] as const).map((outcome) => (
            <Button
              key={outcome}
              size="lg"
              aria-pressed={choice === outcome}
              onClick={() => setChoice(outcome)}
              className={outcome === "Yes" ? styles.yes : styles.no}
            >
              <span>
                {choice === outcome ? (
                  <Check size={20} aria-hidden="true" />
                ) : null}
                {outcome}
              </span>
              <span>
                {outcome === "Yes" ? market.odds : 100 - market.odds}%
              </span>
            </Button>
          ))}
        </div>
        <div className={styles.marketFooter} aria-live="polite">
          <span>
            {choice
              ? `${choice} selected · Preview only`
              : `${market.volume} volume`}
          </span>
          <span>{market.people} predictions</span>
        </div>
      </Card>

      <div className={styles.moreMarkets} aria-label="More example markets">
        {markets.map(
          ({ short, odds, Icon }, index) =>
            index !== selected && (
              <button
                className={styles.miniMarket}
                key={short}
                onClick={() => selectMarket(index)}
              >
                <Icon size={24} aria-hidden="true" />
                <span>{short}</span>
                <strong>
                  {odds}%<ArrowUpRight size={20} aria-hidden="true" />
                </strong>
              </button>
            ),
        )}
      </div>
      <footer className={styles.footer}>
        <a
          className={`${buttonVariants({ size: "lg" })} ${styles.explore}`}
          href="https://prediction.worldstreetgold.com/"
          target="_blank"
          rel="noreferrer"
        >
          Explore markets
          <ArrowUpRight size={20} aria-hidden="true" />
        </a>
        <p>Preview · 18+</p>
      </footer>
    </article>
  );
}
