import Image from "next/image";
import { candlesOf, StillCandles } from "../still-chart";
import s from "../platform-still.module.css";

// The last day in hourly candles (illustrative), closing on the price shown
const CANDLES = candlesOf(11, 26, 1.1341, 1.1355, 0.55);
const LEVELS = [
  { at: 1.1372, label: "TP 1.1372", kind: "tp" },
  { at: 1.1355, label: "1.1355", kind: "now" },
  { at: 1.1338, label: "SL 1.1338", kind: "sl" },
] as const;

/** Forex on a phone: one pair's candles, and an order with its two levels on the chart. */
export function ForexStill() {
  return (
    <div
      className={s.still}
      data-brand="forex"
      role="img"
      aria-label="Forex: the euro against the dollar at 1.1355, up 0.11% today, with a $50 buy order, its take profit at 1.1372 and its stop loss at 1.1338"
    >
      <div className={`${s.card} ${s.grow}`}>
        <div className={`${s.row} ${s.between}`}>
          <span className={s.row}>
            <span className={s.faces}>
              <Image src="/assets/forex/eur.svg" alt="" width={24} height={24} unoptimized />
              <Image src="/assets/forex/usd.svg" alt="" width={24} height={24} unoptimized />
            </span>
            <span className={s.name}>EUR/USD</span>
          </span>
          <span className={s.meta}>1 hour candles · London open</span>
        </div>
        <div className={s.row}>
          <span className={s.figure}>1.1355</span>
          <span className={`${s.tag} ${s.gain}`}>+0.11% today</span>
        </div>
        <StillCandles candles={CANDLES} levels={LEVELS} />
      </div>
      <div className={`${s.card} ${s.ink}`} data-tight="">
        <div className={s.split}>
          <span className={s.stack}>
            <span className={s.meta}>Buy EUR/USD</span>
            <span className={`${s.lead} tabular-nums`}>$50.00</span>
          </span>
          <span className={s.stack}>
            <span className={s.meta}>Take profit</span>
            <span className={`${s.lead} ${s.gain} tabular-nums`}>1.1372</span>
          </span>
          <span className={s.stack}>
            <span className={s.meta}>Stop loss</span>
            <span className={`${s.lead} ${s.loss} tabular-nums`}>1.1338</span>
          </span>
        </div>
      </div>
    </div>
  );
}
