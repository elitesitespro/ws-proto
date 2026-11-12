import { useId } from "react";
import s from "./platform-still.module.css";

/** A steady random sequence, so a still's chart is the same every time it's drawn */
function steady(seed: number) {
  let n = seed;
  return () => {
    n = (n * 1664525 + 1013904223) % 4294967296;
    return n / 4294967296;
  };
}

/**
 * A price's path from one figure to another (illustrative): it drifts there
 * with the small wanderings a market has, and lands on the figure exactly.
 * `rough` is how far it wanders, as a share of the whole move.
 */
export function drift(seed: number, count: number, from: number, to: number, rough = 0.2): number[] {
  const next = steady(seed);
  let wander = 0;
  return Array.from({ length: count }, (_, i) => {
    const at = i / (count - 1);
    wander = wander * 0.72 + (next() - 0.5) * 2 * 0.5;
    // Pinned at both ends, free in between
    const free = Math.min(1, i / 2, (count - 1 - i) / 2);
    const eased = at * at * (3 - 2 * at) * 0.6 + at * 0.4;
    return from + (to - from) * (eased + wander * rough * free);
  });
}

export type Candle = { o: number; h: number; l: number; c: number };

/** The same path as candles: each opens where the last closed */
export function candlesOf(seed: number, count: number, from: number, to: number, rough = 0.2): Candle[] {
  const closes = drift(seed, count + 1, from, to, rough);
  const next = steady(seed + 7);
  const wick = Math.abs(to - from) * 0.09;
  return closes.slice(1).map((c, i) => {
    const o = closes[i];
    return { o, c, h: Math.max(o, c) + next() * wick, l: Math.min(o, c) - next() * wick };
  });
}

/** A smooth line through the points that never overshoots them (monotone cubic) */
function curve(points: readonly (readonly [number, number])[]) {
  const n = points.length;
  const slope = points.slice(1).map(([x, y], i) => (y - points[i][1]) / (x - points[i][0]));
  const lean = points.map((_, i) => {
    if (i === 0) return slope[0];
    if (i === n - 1) return slope[n - 2];
    const a = slope[i - 1];
    const b = slope[i];
    return a * b <= 0 ? 0 : (2 * a * b) / (a + b);
  });
  let d = `M${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const third = (x1 - x0) / 3;
    d += ` C${(x0 + third).toFixed(2)} ${(y0 + lean[i] * third).toFixed(2)} ${(x1 - third).toFixed(2)} ${(y1 - lean[i + 1] * third).toFixed(2)} ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  }
  return d;
}

/**
 * A still's line chart: the values from first to last as one smooth line
 * over a soft fill, on faint rules, with a dot where it stands now. It
 * stretches to whatever room its still gives it. `mark` draws a dashed
 * level across it (even odds, say); `ticks` name the times along its foot.
 */
export function StillChart({
  values,
  mark,
  ticks,
}: {
  values: readonly number[];
  mark?: { at: number; label: string };
  ticks?: readonly string[];
}) {
  const fade = useId();
  const all = mark ? [...values, mark.at] : values;
  const low = Math.min(...all);
  const high = Math.max(...all);
  const air = (high - low || 1) * 0.14;
  const y = (v: number) => ((high + air - v) / (high - low + air * 2)) * 100;
  const line = curve(values.map((v, i) => [(i / (values.length - 1)) * 100, y(v)] as const));
  return (
    <>
      <div className={`${s.plot} ${s.grow}`} aria-hidden="true">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id={fade} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" className={s.fadeFrom} />
              <stop offset="1" className={s.fadeTo} />
            </linearGradient>
          </defs>
          <path d={`${line} L100 100 L0 100 Z`} fill={`url(#${fade})`} />
          <path d={line} className={s.line} />
        </svg>
        {mark && (
          <span className={s.mark} style={{ top: `${y(mark.at).toFixed(2)}%` }}>
            <b>{mark.label}</b>
          </span>
        )}
        <i className={s.head} style={{ top: `${y(values[values.length - 1]).toFixed(2)}%` }} />
      </div>
      {ticks && (
        <div className={s.ticks} aria-hidden="true">
          {ticks.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
      )}
    </>
  );
}

/**
 * A still's candle chart, as a trading desk draws one: the candles, the
 * price now, and an order's take profit and stop loss as dashed levels with
 * their tags down the right.
 */
export function StillCandles({
  candles,
  levels,
}: {
  candles: readonly Candle[];
  levels: readonly { at: number; label: string; kind: "tp" | "sl" | "now" }[];
}) {
  const all = [...candles.flatMap((k) => [k.h, k.l]), ...levels.map((l) => l.at)];
  const low = Math.min(...all);
  const high = Math.max(...all);
  const air = (high - low) * 0.1;
  const y = (v: number) => ((high + air - v) / (high - low + air * 2)) * 100;
  const w = 100 / candles.length;
  return (
    <div className={`${s.plot} ${s.candles} ${s.grow}`} aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        {candles.map((k, i) => {
          const x = i * w + w / 2;
          return (
            <g key={i} className={k.c >= k.o ? s.up : s.down}>
              <line x1={x} x2={x} y1={y(k.h)} y2={y(k.l)} vectorEffect="non-scaling-stroke" />
              <rect x={x - w * 0.32} width={w * 0.64} y={y(Math.max(k.o, k.c))} height={Math.max(1.2, Math.abs(y(k.o) - y(k.c)))} rx="0.4" />
            </g>
          );
        })}
      </svg>
      {levels.map((level) => (
        <span key={level.kind} className={s.level} data-kind={level.kind} style={{ top: `${y(level.at).toFixed(2)}%` }}>
          <b className="tabular-nums">{level.label}</b>
        </span>
      ))}
    </div>
  );
}
