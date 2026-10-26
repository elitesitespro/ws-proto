"use client";

import { useEffect, useEffectEvent, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Icon } from "@/components/icon";
import styles from "./forex-desk.module.css";

type Side = "buy" | "sell";
type Pair = { id: string; base: string; quote: string; price: number; pip: number; digits: number; change: number };
type Candle = { o: number; h: number; l: number; c: number };
type Position = { pair: Pair; side: Side; entry: number; tp: number; sl: number; amount: number };
type Result = { hit: "tp" | "sl" | "closed"; pips: number; usd: number };

// Pairs and prices as worldstreetgold.com shows them (illustrative)
const PAIRS: readonly Pair[] = [
  { id: "eurusd", base: "eur", quote: "usd", price: 1.1355, pip: 0.0001, digits: 4, change: 0.11 },
  { id: "gbpusd", base: "gbp", quote: "usd", price: 1.3247, pip: 0.0001, digits: 4, change: -0.08 },
  { id: "usdjpy", base: "usd", quote: "jpy", price: 148.62, pip: 0.01, digits: 2, change: 0.21 },
  { id: "eurgbp", base: "eur", quote: "gbp", price: 0.8572, pip: 0.0001, digits: 4, change: 0.04 },
];
const FRAMES = ["15m", "1H", "4H", "1D"] as const;
const CANDLES = 30;
const MIN = 50;
// The market's three sessions, in GMT hours
const SESSIONS = [
  { name: "Tokyo", from: 0, to: 9 },
  { name: "London", from: 8, to: 17 },
  { name: "New York", from: 13, to: 22 },
] as const;

const label = (p: Pair) => `${p.base.toUpperCase()}/${p.quote.toUpperCase()}`;
const fixed = (p: Pair, n: number) => n.toFixed(p.digits);
const signed = (n: number, digits = 0) => `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(digits)}`;

// A steady random sequence, so the first chart is the same on the server
// and in the browser
function seeded(text: string) {
  let a = [...text].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619), 2166136261) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const wobble = (rand: () => number) => rand() + rand() + rand() - 1.5;

/** Candles ending on the pair's price, rougher for the longer frames */
function series(pair: Pair, frame: number): Candle[] {
  const rand = seeded(pair.id + frame);
  const size = pair.pip * [5, 9, 16, 30][frame];
  const out: Candle[] = [];
  let close = 0;
  for (let i = 0; i < CANDLES; i++) {
    const o = close;
    const c = o + wobble(rand) * size * 1.6 + size * 0.12;
    out.push({ o, c, h: Math.max(o, c) + rand() * size * 0.7, l: Math.min(o, c) - rand() * size * 0.7 });
    close = c;
  }
  const shift = pair.price - close;
  return out.map((k) => ({ o: k.o + shift, h: k.h + shift, l: k.l + shift, c: k.c + shift }));
}

// The time in GMT, for the sessions (the browser's own clock)
const subscribe = (tick: () => void) => {
  const timer = setInterval(tick, 20000);
  return () => clearInterval(timer);
};
const gmtNow = () => {
  const d = new Date();
  return d.getUTCDay() * 1440 + d.getUTCHours() * 60 + d.getUTCMinutes();
};

/**
 * A forex desk in miniature, as worldstreetgold.com draws it: the pair's
 * chart moving, the three sessions on the real clock, and an order ticket
 * with take-profit and stop-loss set before you enter. Place a sample order
 * and it plays out on the chart until one of them is hit. Sample figures
 * only; trading carries risk.
 */
export function ForexDesk() {
  const [pair, setPair] = useState(PAIRS[0]);
  const [frame, setFrame] = useState(1);
  const [candles, setCandles] = useState(() => series(PAIRS[0], 1));
  const [side, setSide] = useState<Side>("buy");
  const [futures, setFutures] = useState(false);
  const [amount, setAmount] = useState(MIN);
  const [tpPips, setTpPips] = useState(65);
  const [slPips, setSlPips] = useState(45);
  const [position, setPosition] = useState<Position | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [ticks, setTicks] = useState(0);
  const minute = useSyncExternalStore(subscribe, gmtNow, () => -1);

  const price = candles[candles.length - 1].c;
  const dir = (s: Side) => (s === "buy" ? 1 : -1);
  const levels = position ?? {
    tp: price + dir(side) * tpPips * pair.pip,
    sl: price - dir(side) * slPips * pair.pip,
  };
  const pips = position ? ((price - position.entry) / pair.pip) * dir(position.side) : 0;
  const usd = position ? position.amount * ((price / position.entry - 1) * dir(position.side)) : 0;

  function settle(hit: Result["hit"], at: number) {
    if (!position) return;
    const up = dir(position.side);
    setResult({
      hit,
      pips: ((at - position.entry) / pair.pip) * up,
      usd: position.amount * (at / position.entry - 1) * up,
    });
    setPosition(null);
  }

  // The market moves; with a sample position open it's sped up, so it plays
  // out in seconds rather than hours
  const tick = useEffectEvent(() => {
    const last = candles[candles.length - 1];
    const step = wobble(Math.random) * pair.pip * (position ? 9 : 3.2);
    const c = last.c + step;
    const fresh = (ticks + 1) % (position ? 4 : 6) === 0;
    const next = fresh
      ? [...candles.slice(1), { o: last.c, c, h: Math.max(last.c, c), l: Math.min(last.c, c) }]
      : [...candles.slice(0, -1), { ...last, c, h: Math.max(last.h, c), l: Math.min(last.l, c) }];
    setCandles(next);
    setTicks(ticks + 1);
    if (!position) return;
    const up = dir(position.side);
    const hit = (c - position.tp) * up >= 0 ? "tp" : (c - position.sl) * up <= 0 ? "sl" : null;
    if (hit) settle(hit, hit === "tp" ? position.tp : position.sl);
  });
  useEffect(() => {
    const timer = setInterval(tick, position ? 420 : 900);
    return () => clearInterval(timer);
  }, [position]);

  const choose = (p: Pair) => {
    setPair(p);
    setCandles(series(p, frame));
    setResult(null);
  };
  const reframe = (f: number) => {
    setFrame(f);
    setCandles(series(pair, f));
  };
  const place = () => {
    setResult(null);
    setPosition({ pair, side, entry: price, tp: levels.tp, sl: levels.sl, amount });
  };

  // The chart's scale: the candles, and the take-profit and stop-loss lines
  const all = [...candles.flatMap((k) => [k.h, k.l]), levels.tp, levels.sl];
  const hi = Math.max(...all);
  const lo = Math.min(...all);
  const pad = (hi - lo) * 0.08;
  const y = (v: number) => ((hi + pad - v) / (hi - lo + pad * 2)) * 100;
  const w = 100 / CANDLES;

  // Which sessions are open now
  const day = minute < 0 ? -1 : Math.floor(minute / 1440);
  const hour = minute < 0 ? -1 : (minute % 1440) / 60;
  const weekend = day === 6 || (day === 0 && hour < 22) || (day === 5 && hour >= 22);
  const open = SESSIONS.filter((s) => !weekend && hour >= s.from && hour < s.to);
  const now =
    minute < 0 ? "--:--" : `${String(Math.floor(hour)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;

  return (
    <div className={styles.stage}>
      <div className={styles.market}>
        <div className={styles.chartCard}>
          <div className={styles.pairs} role="group" aria-label="Currency pair">
            {PAIRS.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={p.id === pair.id}
                disabled={Boolean(position)}
                onClick={() => choose(p)}
              >
                <span className={styles.flags} aria-hidden="true">
                  <Image src={`/assets/forex/${p.base}.svg`} alt="" width={18} height={18} unoptimized />
                  <Image src={`/assets/forex/${p.quote}.svg`} alt="" width={18} height={18} unoptimized />
                </span>
                {label(p)}
              </button>
            ))}
          </div>

          <div className={styles.quote}>
            <span>
              <strong className="tabular-nums">{fixed(pair, price)}</strong>
              <span className={`${styles.change} tabular-nums`} data-down={pair.change + ((price - pair.price) / pair.price) * 100 < 0 || undefined}>
                {signed(pair.change + ((price - pair.price) / pair.price) * 100, 2)}%<span className={styles.today}> today</span>
              </span>
            </span>
            <span className={styles.frames} role="group" aria-label="Timeframe">
              {FRAMES.map((f, i) => (
                <button key={f} type="button" aria-pressed={i === frame} disabled={Boolean(position)} onClick={() => reframe(i)}>
                  {f}
                </button>
              ))}
            </span>
          </div>

          <div className={styles.chart} role="img" aria-label={`${label(pair)} sample chart at ${fixed(pair, price)}`}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {candles.map((k, i) => {
                const up = k.c >= k.o;
                const x = i * w + w / 2;
                return (
                  <g key={i} className={up ? styles.up : styles.down}>
                    <line x1={x} x2={x} y1={y(k.h)} y2={y(k.l)} vectorEffect="non-scaling-stroke" />
                    <rect
                      x={x - w * 0.3}
                      width={w * 0.6}
                      y={y(Math.max(k.o, k.c))}
                      height={Math.max(0.6, Math.abs(y(k.o) - y(k.c)))}
                    />
                  </g>
                );
              })}
            </svg>
            <span className={styles.level} data-kind="tp" style={{ top: `${y(levels.tp)}%` }}>
              <b>TP {fixed(pair, levels.tp)}</b>
            </span>
            <span className={styles.level} data-kind="sl" style={{ top: `${y(levels.sl)}%` }}>
              <b>SL {fixed(pair, levels.sl)}</b>
            </span>
            {position && (
              <span className={styles.level} data-kind="entry" style={{ top: `${y(position.entry)}%` }}>
                <b>Entry {fixed(pair, position.entry)}</b>
              </span>
            )}
            <span className={styles.level} data-kind="now" style={{ top: `${y(price)}%` }}>
              <b className="tabular-nums">{fixed(pair, price)}</b>
            </span>
            {position && <span className={styles.fast}>Sample · sped up</span>}
          </div>
        </div>

        {/* The three sessions on today's clock */}
        <div className={styles.sessions}>
          <div className={styles.sessionsHead}>
            <strong>Sessions</strong>
            <span className="tabular-nums">{now} GMT</span>
          </div>
          {SESSIONS.map((s) => {
            const isOpen = open.includes(s);
            return (
              <div key={s.name} className={styles.session} data-open={isOpen || undefined}>
                <span>{s.name}</span>
                <span className={styles.track} aria-hidden="true">
                  <i style={{ left: `${(s.from / 24) * 100}%`, width: `${((s.to - s.from) / 24) * 100}%` }} />
                  {hour >= 0 && <b style={{ left: `${(hour / 24) * 100}%` }} />}
                </span>
                <span className={styles.state}>
                  {weekend ? "Weekend" : isOpen ? "Open" : `${String(s.from).padStart(2, "0")}:00`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* The order ticket */}
      <section className={styles.ticket} aria-label="Sample order ticket">
        <header>
          <strong>Order ticket</strong>
          <span>{label(pair)}</span>
        </header>

        {position ? (
          <div className={styles.open} aria-live="polite">
            <span className={styles.kicker}>
              Sample position · {position.side === "buy" ? "Buy" : "Sell"} {label(pair)}
            </span>
            <strong className="tabular-nums" data-down={usd < 0 || undefined}>
              {signed(usd, 2).replace(/^([+−])/, "$1$")}
            </strong>
            <span className="tabular-nums">{signed(pips, 1)} pips</span>
            <span className={styles.between} aria-hidden="true">
              <i
                style={{
                  left: `${Math.min(100, Math.max(0, ((price - position.sl) / (position.tp - position.sl)) * 100))}%`,
                }}
              />
            </span>
            <span className={styles.ends}>
              <span>SL {fixed(pair, position.sl)}</span>
              <span>TP {fixed(pair, position.tp)}</span>
            </span>
            <button type="button" className={styles.close} onClick={() => settle("closed", price)}>
              Close position
            </button>
          </div>
        ) : (
          <>
            <div className={styles.toggle} role="group" aria-label="Side">
              {(["buy", "sell"] as const).map((s) => (
                <button key={s} type="button" aria-pressed={side === s} onClick={() => setSide(s)}>
                  {s === "buy" ? "Buy" : "Sell"}
                </button>
              ))}
            </div>
            <div className={`${styles.toggle} ${styles.kind}`} role="group" aria-label="Market">
              <button type="button" aria-pressed={!futures} onClick={() => setFutures(false)}>
                Spot
              </button>
              <button type="button" aria-pressed={futures} onClick={() => setFutures(true)}>
                Futures
              </button>
            </div>
            <Field
              name="Amount"
              value={`$${amount.toFixed(2)}`}
              note={`Min $${MIN}`}
              less={() => setAmount(Math.max(MIN, amount - 50))}
              more={() => setAmount(Math.min(1000, amount + 50))}
            />
            <Field
              name="Take profit"
              tone="tp"
              value={fixed(pair, levels.tp)}
              note={`+${tpPips} pips`}
              less={() => setTpPips(Math.max(10, tpPips - 5))}
              more={() => setTpPips(Math.min(150, tpPips + 5))}
            />
            <Field
              name="Stop loss"
              tone="sl"
              value={fixed(pair, levels.sl)}
              note={`−${slPips} pips`}
              less={() => setSlPips(Math.max(10, slPips - 5))}
              more={() => setSlPips(Math.min(150, slPips + 5))}
            />
            <p className={styles.naira}>
              <span aria-hidden="true">₦</span>
              <span>
                <b>Pay from naira wallet</b>
                <small>Funded with a naira deposit</small>
              </span>
            </p>
            {result && (
              <p key={result.usd} className={styles.result} data-hit={result.hit} role="status">
                {result.hit === "tp" ? "Take-profit hit" : result.hit === "sl" ? "Stop-loss hit" : "Position closed"}
                <b className="tabular-nums">
                  {signed(result.pips, 1)} pips · {signed(result.usd, 2).replace(/^([+−])/, "$1$")}
                </b>
              </p>
            )}
            <button type="button" className={styles.place} onClick={place}>
              {side === "buy" ? "Buy" : "Sell"} {label(pair)}
              {futures ? " futures" : ""}
            </button>
          </>
        )}
        <p className={styles.risk}>Sample only, before fees. Trading carries risk; you can lose money.</p>
      </section>
    </div>
  );
}

function Field({
  name,
  value,
  note,
  tone,
  less,
  more,
}: {
  name: string;
  value: string;
  note: string;
  tone?: "tp" | "sl";
  less: () => void;
  more: () => void;
}) {
  return (
    <div className={styles.field} data-tone={tone}>
      <span className={styles.fieldName}>{name}</span>
      <strong className="tabular-nums">{value}</strong>
      <span className={`${styles.fieldNote} tabular-nums`}>{note}</span>
      <span className={styles.steppers}>
        <button type="button" aria-label={`Less ${name.toLowerCase()}`} onClick={less}>
          <Icon name="minus" size={16} tone="current" />
        </button>
        <button type="button" aria-label={`More ${name.toLowerCase()}`} onClick={more}>
          <Icon name="plus" size={16} tone="current" />
        </button>
      </span>
    </div>
  );
}
