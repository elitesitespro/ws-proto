"use client";

import { useEffect, useEffectEvent, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Icon } from "@/components/icon";
import styles from "./crypto-desk.module.css";

type CoinId = "btc" | "eth" | "sol" | "xrp" | "bnb";
type Coin = { id: CoinId; name: string; ticker: string; price: number; held: number };
type Position = { coin: CoinId; size: number; leverage: number; entry: number };

// A sample portfolio of the coins worldstreetgold.com shows (their icons are
// its own), at illustrative prices
const COINS: readonly Coin[] = [
  { id: "btc", name: "Bitcoin", ticker: "BTC", price: 67240, held: 0.0412 },
  { id: "eth", name: "Ethereum", ticker: "ETH", price: 3520, held: 0.62 },
  { id: "sol", name: "Solana", ticker: "SOL", price: 174.2, held: 8.5 },
  { id: "xrp", name: "XRP", ticker: "XRP", price: 0.62, held: 950 },
  { id: "bnb", name: "BNB", ticker: "BNB", price: 588, held: 0.9 },
];
const CASH = 1000;
const AMOUNTS = [50, 100, 250];
const LEVERAGE = [1, 2, 5];
const TICK_MS = 1600;
const POINTS = 48;

const startPrices = Object.fromEntries(COINS.map((c) => [c.id, c.price])) as Record<CoinId, number>;
const startHeld = Object.fromEntries(COINS.map((c) => [c.id, c.held])) as Record<CoinId, number>;
const worth = (held: Record<CoinId, number>, prices: Record<CoinId, number>) =>
  COINS.reduce((sum, c) => sum + held[c.id] * prices[c.id], 0);
const START_WORTH = worth(startHeld, startPrices) + CASH;

// The day so far, the same on every visit: a gentle seeded walk, scaled to
// end where the portfolio is now
const HISTORY = (() => {
  let seed = 11;
  const next = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  let v = 1;
  const walk = Array.from({ length: POINTS }, () => (v *= 1 + (next() - 0.47) * 0.006));
  return walk.map((w) => (w / walk[POINTS - 1]) * START_WORTH);
})();

const usd = (n: number, digits = 2) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
const quote = (n: number) => usd(n, n < 10 ? 4 : n < 1000 ? 2 : 0);
const units = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: n < 1 ? 5 : n < 100 ? 3 : 1 });
const signed = (n: number) => `${n >= 0 ? "+" : "−"}${usd(Math.abs(n))}`;

/**
 * A crypto desk that never closes: a sample portfolio moving live, coin by
 * coin, and a ticket to buy or sell spot, or open a perpetual future with
 * leverage, whose profit and loss then moves with the price (both ways).
 */
export function CryptoDesk() {
  const reduced = useReducedMotion();
  const [prices, setPrices] = useState(startPrices);
  const [moves, setMoves] = useState<Partial<Record<CoinId, "up" | "down">>>({});
  const [held, setHeld] = useState(startHeld);
  const [cash, setCash] = useState(CASH);
  const [history, setHistory] = useState(HISTORY);
  const [mode, setMode] = useState<"spot" | "perps">("spot");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [coin, setCoin] = useState<CoinId>("btc");
  const [amount, setAmount] = useState(100);
  const [leverage, setLeverage] = useState(2);
  const [position, setPosition] = useState<Position | null>(null);
  const [note, setNote] = useState<{ id: number; text: string } | null>(null);

  const pnl = position ? position.size * position.leverage * (prices[position.coin] / position.entry - 1) : 0;
  const total = worth(held, prices) + cash + (position ? position.size + pnl : 0);

  // The market moves every moment, day and night
  const tick = useEffectEvent(() => {
    const next = { ...prices };
    const dir: Partial<Record<CoinId, "up" | "down">> = {};
    for (const c of COINS) {
      const step = (Math.random() - 0.48) * 0.006;
      next[c.id] = prices[c.id] * (1 + step);
      dir[c.id] = step >= 0 ? "up" : "down";
    }
    setPrices(next);
    setMoves(dir);
    setHistory((h) => [...h.slice(1), worth(held, next) + cash + (position ? position.size : 0)]);
  });
  useEffect(() => {
    if (reduced) return;
    const timer = setInterval(tick, TICK_MS);
    return () => clearInterval(timer);
  }, [reduced]);

  const tell = (text: string) => setNote((n) => ({ id: (n?.id ?? 0) + 1, text }));
  const picked = COINS.find((c) => c.id === coin)!;
  const get = amount / prices[coin];
  const canSell = held[coin] * prices[coin] >= amount;

  const trade = () => {
    if (mode === "perps") {
      if (position) {
        setCash((c) => c + position.size + pnl);
        tell(`Closed your ${position.leverage}x ${position.coin.toUpperCase()} position at ${signed(pnl)}`);
        setPosition(null);
        return;
      }
      if (cash < amount) return;
      setCash((c) => c - amount);
      setPosition({ coin, size: amount, leverage, entry: prices[coin] });
      tell(`Opened a ${leverage}x long on ${picked.ticker} with ${usd(amount, 0)}`);
      return;
    }
    if (side === "buy") {
      if (cash < amount) return;
      setCash((c) => c - amount);
      setHeld((h) => ({ ...h, [coin]: h[coin] + get }));
      tell(`Bought ${units(get)} ${picked.ticker} at ${quote(prices[coin])}`);
    } else {
      if (!canSell) return;
      setCash((c) => c + amount);
      setHeld((h) => ({ ...h, [coin]: h[coin] - get }));
      tell(`Sold ${units(get)} ${picked.ticker} at ${quote(prices[coin])}`);
    }
  };

  // The day's line, drawn into the box
  const low = Math.min(...history);
  const high = Math.max(...history);
  const line = history
    .map((v, i) => `${((i / (POINTS - 1)) * 100).toFixed(2)},${(36 - ((v - low) / (high - low || 1)) * 32).toFixed(2)}`)
    .join(" ");
  const day = total - history[0];

  const action =
    mode === "perps"
      ? position
        ? `Close position ${signed(pnl)}`
        : `Open ${leverage}x long on ${picked.ticker}`
      : `${side === "buy" ? "Buy" : "Sell"} ${picked.ticker}`;
  const blocked = mode === "perps" ? !position && cash < amount : side === "buy" ? cash < amount : !canSell;

  return (
    <div className={styles.stage}>
      <section className={styles.portfolio} aria-label="Sample portfolio">
        <header className={styles.head}>
          <span>Your portfolio</span>
          <span className={styles.live}>Live · 24/7</span>
        </header>
        <p className={styles.total}>
          <strong className="tabular-nums">{usd(total)}</strong>
          <span className={`tabular-nums ${day >= 0 ? styles.up : styles.down}`}>
            {signed(day)} today
          </span>
        </p>
        <svg className={styles.spark} viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
          <polyline points={`0,40 ${line} 100,40`} className={styles.area} />
          <polyline points={line} className={styles.line} vectorEffect="non-scaling-stroke" />
        </svg>

        <ul className={styles.holdings}>
          {position && (
            <li className={styles.position}>
              <Image src={`/assets/crypto/${position.coin}.svg`} alt="" width={28} height={28} unoptimized />
              <span className={styles.name}>
                <strong>{position.coin.toUpperCase()} perpetual</strong>
                <small>
                  Long {position.leverage}x · {usd(position.size, 0)} in
                </small>
              </span>
              <span className={`${styles.value} tabular-nums ${pnl >= 0 ? styles.up : styles.down}`}>{signed(pnl)}</span>
            </li>
          )}
          {COINS.map((c) => (
            <li key={c.id}>
              <Image src={`/assets/crypto/${c.id}.svg`} alt="" width={28} height={28} unoptimized />
              <span className={styles.name}>
                <strong>{c.name}</strong>
                <small className="tabular-nums">
                  {units(held[c.id])} {c.ticker}
                </small>
              </span>
              <span className={styles.value}>
                <strong className="tabular-nums">{usd(held[c.id] * prices[c.id])}</strong>
                <small key={prices[c.id]} className="tabular-nums" data-move={moves[c.id]}>
                  {quote(prices[c.id])}
                </small>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.ticket} aria-label="Trade">
        <div className={styles.modes} role="group" aria-label="Market">
          {(["spot", "perps"] as const).map((m) => (
            <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}>
              {m === "spot" ? "Spot" : "Perpetual futures"}
            </button>
          ))}
        </div>

        {mode === "spot" && (
          <div className={styles.sides} role="group" aria-label="Buy or sell">
            {(["buy", "sell"] as const).map((s) => (
              <button key={s} type="button" data-side={s} aria-pressed={side === s} onClick={() => setSide(s)}>
                {s === "buy" ? "Buy" : "Sell"}
              </button>
            ))}
          </div>
        )}

        <div className={styles.coins} role="group" aria-label="Coin">
          {COINS.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={coin === c.id}
              aria-label={c.name}
              disabled={Boolean(position) && mode === "perps"}
              onClick={() => setCoin(c.id)}
            >
              <Image src={`/assets/crypto/${c.id}.svg`} alt="" width={32} height={32} unoptimized />
            </button>
          ))}
        </div>

        <p className={styles.rate}>
          <span>1 {picked.ticker}</span>
          <strong key={prices[coin]} className="tabular-nums" data-move={moves[coin]}>
            {quote(prices[coin])}
          </strong>
        </p>

        <div className={styles.amounts} role="group" aria-label="Amount">
          {AMOUNTS.map((a) => (
            <button key={a} type="button" aria-pressed={amount === a} onClick={() => setAmount(a)}>
              {usd(a, 0)}
            </button>
          ))}
        </div>

        {mode === "perps" && (
          <>
            <div className={styles.amounts} role="group" aria-label="Leverage">
              {LEVERAGE.map((l) => (
                <button
                  key={l}
                  type="button"
                  aria-pressed={leverage === l}
                  disabled={Boolean(position)}
                  onClick={() => setLeverage(l)}
                >
                  {l}x
                </button>
              ))}
            </div>
            <p className={styles.warn}>
              <Icon name="alert" size={16} tone="current" />
              {leverage === 1
                ? "No leverage: the position moves with the price."
                : `At ${leverage}x, a ${Math.round(100 / leverage)}% move against you can cost the whole ${usd(amount, 0)}.`}
            </p>
          </>
        )}

        <p className={styles.sum}>
          {mode === "spot" ? (
            <>
              {side === "buy" ? "You get" : "You sell"} ≈{" "}
              <strong className="tabular-nums">
                {units(get)} {picked.ticker}
              </strong>
            </>
          ) : (
            <>
              Position <strong className="tabular-nums">{usd(amount * leverage, 0)}</strong> for{" "}
              <strong className="tabular-nums">{usd(amount, 0)}</strong>
            </>
          )}
        </p>

        <button
          type="button"
          className={styles.go}
          data-side={mode === "spot" ? side : position ? "sell" : "buy"}
          disabled={blocked}
          onClick={trade}
        >
          {action}
        </button>
        <p className={styles.cash}>
          <span className="tabular-nums">Cash {usd(cash)}</span>
          <span>Sample prices</span>
        </p>

        {note && (
          <p key={note.id} className={styles.note} role="status">
            <Icon name="check-circle" size={16} tone="current" />
            {note.text}
          </p>
        )}
      </section>
    </div>
  );
}
