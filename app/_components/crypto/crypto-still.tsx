import Image from "next/image";
import { drift, StillChart } from "../still-chart";
import s from "../platform-still.module.css";

// The day so far (illustrative), ending at what the coins are worth now
const DAY = drift(5, 30, 8519.61, 8551.59, 0.42);
const COINS = [
  ["btc", "BTC", "$2,770.29", "+1.4%", true],
  ["eth", "ETH", "$2,182.40", "+0.6%", true],
  ["sol", "SOL", "$1,477.34", "−0.3%", false],
] as const;

/** Crypto on a phone: what your coins are worth today, and the three biggest. */
export function CryptoStill() {
  return (
    <div
      className={s.still}
      role="img"
      aria-label="Crypto: a portfolio worth $8,551.59, up $31.98 today, led by Bitcoin, Ethereum and Solana"
    >
      <div className={`${s.card} ${s.grow}`}>
        <div className={`${s.row} ${s.between}`}>
          <span className={s.meta}>Your portfolio</span>
          <span className={`${s.tag} ${s.hue} ${s.live}`}>Live · 24/7</span>
        </div>
        <div className={s.row}>
          <span className={s.figure}>$8,551.59</span>
          <span className={`${s.tag} ${s.gain}`}>+$31.98 today</span>
        </div>
        <StillChart values={DAY} ticks={["00:00", "06:00", "12:00", "Now"]} />
      </div>
      <div className={s.split}>
        {COINS.map(([id, name, worth, change, up]) => (
          <span key={id} className={s.cell}>
            <span className={s.row}>
              <Image src={`/assets/crypto/${id}.svg`} alt="" width={20} height={20} unoptimized />
              <span className={`${s.meta} ${s.clip}`}>{name}</span>
            </span>
            <span className={`${s.name} tabular-nums`}>{worth}</span>
            <span className={`${s.meta} ${up ? s.gain : s.loss} tabular-nums`}>{change}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
