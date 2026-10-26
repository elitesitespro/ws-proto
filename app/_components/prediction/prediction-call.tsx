"use client";

import { useEffect, useEffectEvent, useId, useState, type CSSProperties } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Icon, type IconName } from "@/components/icon";
import styles from "./prediction-call.module.css";

type Side = "yes" | "no";
type Call = { side: Side; stake: number; at: number };

// A question from each of Prediction's topics, each with the last week of the
// crowd's chance of yes, four readings a day (illustrative). A chance of p%
// pays 1/p times the stake, as on prediction.worldstreetgold.com.
const MARKETS: readonly {
  id: string;
  topic: string;
  icon: IconName;
  ask: string;
  closes: string;
  calls: number;
  week: readonly number[];
}[] = [
  {
    id: "sport",
    topic: "Sport",
    icon: "trophy",
    ask: "Will the Super Eagles beat Cameroon on Saturday?",
    closes: "Sat 17:00",
    calls: 3412,
    week: [49, 50, 49, 51, 52, 51, 53, 52, 54, 53, 55, 54, 53, 55, 56, 55, 57, 56, 55, 57, 58, 57, 56, 58, 59, 58, 57, 58],
  },
  {
    id: "music",
    topic: "Music",
    icon: "music",
    ask: "Does a new entry go straight to #1 on Monday’s chart?",
    closes: "Mon 09:00",
    calls: 1876,
    week: [38, 39, 37, 38, 36, 37, 35, 36, 34, 35, 36, 34, 33, 34, 32, 33, 34, 32, 31, 32, 33, 31, 30, 31, 32, 31, 30, 31],
  },
  {
    id: "politics",
    topic: "Politics",
    icon: "landmark",
    ask: "Will the Senate pass the budget before December?",
    closes: "30 Nov",
    calls: 2290,
    week: [52, 51, 49, 50, 48, 47, 49, 46, 45, 47, 46, 44, 45, 43, 44, 46, 45, 43, 42, 44, 43, 45, 44, 42, 43, 44, 45, 44],
  },
];

const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const chanceOf = (side: Side, yes: number) => (side === "yes" ? yes : 100 - yes);

/** The week as points across a 100 × 100 box, `lo` at the foot and `hi` at the top. */
function plot(values: readonly number[], lo: number, hi: number) {
  return values.map((v, i) => [(i / (values.length - 1)) * 100, ((hi - v) / (hi - lo)) * 100] as const);
}

/**
 * Prediction's questions, one topic at a time: the crowd's chance of yes
 * over the week, moving live, and a ticket to make your own call on it, yes
 * or no, with what it pays if you're right. Once made, your call sits on the
 * chart so you can watch the crowd move towards it or away.
 */
export function PredictionCall() {
  const reduced = useReducedMotion();
  const fade = useId();
  const [shown, setShown] = useState(MARKETS[0].id);
  const [weeks, setWeeks] = useState<Record<string, readonly number[]>>(() =>
    Object.fromEntries(MARKETS.map((m) => [m.id, m.week])),
  );
  const [side, setSide] = useState<Side>("yes");
  const [stake, setStake] = useState(20);
  const [calls, setCalls] = useState<Record<string, Call | undefined>>({});

  // The crowd keeps calling: every market drifts a point at a time, never far
  // from where its week ended
  const drift = useEffectEvent(() => {
    setWeeks(
      Object.fromEntries(
        MARKETS.map((m) => {
          const values = weeks[m.id];
          const last = values[values.length - 1];
          const from = m.week[m.week.length - 1];
          const step = Math.random() < 0.35 ? 0 : Math.random() < 0.5 ? -1 : 1;
          return [m.id, [...values.slice(1), Math.min(from + 6, Math.max(from - 6, last + step))]];
        }),
      ),
    );
  });
  useEffect(() => {
    if (reduced) return;
    const timer = setInterval(drift, 2400);
    return () => clearInterval(timer);
  }, [reduced]);

  const market = MARKETS.find((m) => m.id === shown)!;
  const values = weeks[market.id];
  const yes = values[values.length - 1];
  const today = yes - values[values.length - 5];
  const call = calls[market.id];

  // The chart spans the week, even odds and your call, with a little air
  const lo = Math.min(...values, 50, call?.at ?? 50) - 6;
  const hi = Math.max(...values, 50, call?.at ?? 50) + 6;
  const points = plot(values, lo, hi);
  const line = points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  const level = (v: number) => `${(((hi - v) / (hi - lo)) * 100).toFixed(2)}%`;

  const chance = chanceOf(side, yes);
  const payout = (stake * 100) / chance;
  // How far the crowd has come towards your side since you called it
  const moved = call ? (call.side === "yes" ? yes - call.at : call.at - yes) : 0;

  return (
    <div className={styles.stage}>
      <section className={styles.market} aria-label="The crowd’s chance">
        <div className={styles.topics} role="group" aria-label="Topic">
          {MARKETS.map((m) => (
            <button key={m.id} type="button" aria-pressed={m.id === shown} onClick={() => setShown(m.id)}>
              <Icon name={m.icon} size={20} tone="current" />
              {m.topic}
            </button>
          ))}
        </div>
        <h4 key={market.id} className={styles.ask}>
          {market.ask}
        </h4>
        <p className={styles.now}>
          <strong className="tabular-nums">{yes}%</strong>
          <span>chance of yes</span>
          <span className={`${styles.today} tabular-nums`} data-way={today > 0 ? "up" : today < 0 ? "down" : undefined}>
            {today ? `${today > 0 ? "+" : "−"}${Math.abs(today)} today` : "Steady today"}
          </span>
        </p>
        <div className={styles.chart} aria-hidden="true">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id={fade} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#7bc6ce" stopOpacity="0.32" />
                <stop offset="1" stopColor="#7bc6ce" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="0" x2="100" y1={level(50)} y2={level(50)} className={styles.even} />
            <path d={`${line} L100 100 L0 100 Z`} fill={`url(#${fade})`} />
            <path d={line} className={styles.line} />
            {call && <line x1="0" x2="100" y1={level(call.at)} y2={level(call.at)} className={styles.mine} />}
          </svg>
          <span className={styles.evenLabel} style={{ top: level(50) }}>
            50%
          </span>
          {call && (
            <span className={styles.mineLabel} style={{ top: level(call.at) }}>
              You: {call.side} at {chanceOf(call.side, call.at)}%
            </span>
          )}
          <i className={styles.head} style={{ top: level(yes) }} />
        </div>
        <p className={styles.foot}>
          <span className="tabular-nums">{market.calls.toLocaleString("en-US")} calls this week</span>
          <span>Closes {market.closes}</span>
        </p>
      </section>

      <section className={styles.ticket} aria-label="Your call">
        <header className={styles.ticketHead}>
          <strong>Your call</strong>
          <span>{market.topic}</span>
        </header>
        {call ? (
          <div key={market.id} className={styles.made}>
            <span className={styles.badge} data-side={call.side}>
              <Icon name="check" size={20} tone="current" />
            </span>
            <strong>
              You called {call.side} at {chanceOf(call.side, call.at)}%
            </strong>
            <p>
              Pays <b className="tabular-nums">{usd((call.stake * 100) / chanceOf(call.side, call.at))}</b> if you’re
              right. It settles when the question closes, {market.closes}.
            </p>
            <p className={styles.moved} data-way={moved > 0 ? "up" : moved < 0 ? "down" : undefined}>
              {moved === 0
                ? "The crowd hasn’t moved since your call"
                : `The crowd has moved ${Math.abs(moved)} ${Math.abs(moved) === 1 ? "point" : "points"} ${moved > 0 ? "your way" : "away from you"}`}
            </p>
            <button type="button" className={styles.again} onClick={() => setCalls({ ...calls, [market.id]: undefined })}>
              Make another call
            </button>
          </div>
        ) : (
          <>
            <div className={styles.sides} role="group" aria-label="Your answer">
              {(["yes", "no"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  data-side={s}
                  aria-pressed={side === s}
                  aria-label={`${s === "yes" ? "Yes" : "No"}: ${chanceOf(s, yes)}% chance, pays ${(100 / chanceOf(s, yes)).toFixed(2)} times`}
                  onClick={() => setSide(s)}
                >
                  <span>{s === "yes" ? "Yes" : "No"}</span>
                  <strong className="tabular-nums">{chanceOf(s, yes)}%</strong>
                  <small className="tabular-nums">Pays {(100 / chanceOf(s, yes)).toFixed(2)}x</small>
                </button>
              ))}
            </div>
            <label className={styles.stake}>
              <span>
                Stake <b className="tabular-nums">${stake}</b>
              </span>
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={stake}
                onChange={(event) => setStake(Number(event.target.value))}
                style={{ "--fill": `${((stake - 5) / 95) * 100}%` } as CSSProperties}
              />
            </label>
            <p className={styles.payout}>
              <span>If you’re right</span>
              <strong className="tabular-nums">{usd(payout)}</strong>
              <small className="tabular-nums">
                {usd(payout - stake)} more than your ${stake}
              </small>
            </p>
            <button
              type="button"
              className={styles.go}
              onClick={() => setCalls({ ...calls, [market.id]: { side, stake, at: yes } })}
            >
              Call {side} for ${stake}
            </button>
          </>
        )}
        <p className={styles.adults}>18+. Only play with what you can afford to lose.</p>
      </section>
    </div>
  );
}
