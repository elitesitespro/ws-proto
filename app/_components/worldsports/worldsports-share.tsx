"use client";

import Image from "next/image";
import { useEffect, useEffectEvent, useState, type CSSProperties } from "react";
import { Icon } from "@/components/icon";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import styles from "./worldsports-share.module.css";

// Three players you can own a share of (illustrative: players, club and
// prices are made up), each with their price over the last fortnight
const PLAYERS = [
  {
    id: "adeyemi",
    number: 9,
    name: "D. Adeyemi",
    role: "Forward",
    photo: "/assets/sports/player-adeyemi.webp",
    weeks: [1161, 1170, 1158, 1176, 1185, 1179, 1192, 1201, 1196, 1210, 1218, 1214, 1229, 1240],
    at: [72, 38],
  },
  {
    id: "mensah",
    number: 10,
    name: "K. Mensah",
    role: "Midfielder",
    photo: null,
    weeks: [842, 838, 845, 851, 846, 840, 852, 849, 857, 853, 861, 855, 858, 860],
    at: [54, 64],
  },
  {
    id: "bello",
    number: 4,
    name: "T. Bello",
    role: "Defender",
    photo: null,
    weeks: [619, 622, 618, 624, 621, 616, 619, 614, 617, 612, 615, 611, 613, 610],
    at: [30, 44],
  },
] as const;
type PlayerId = (typeof PLAYERS)[number]["id"];

// The rest on the pitch, just there: shirt number and where, across and down (%)
const HOME: readonly [number, number, number][] = [
  [1, 6, 50], [2, 20, 18], [3, 20, 82], [5, 32, 68], [6, 44, 26], [8, 46, 84], [7, 62, 14], [11, 76, 78],
];
const AWAY: readonly [number, number, number][] = [
  [4, 82, 28], [6, 88, 60], [2, 64, 46], [1, 95, 50],
];

const CLUB = "Harbour City FC";
const naira = (n: number) => `₦${Math.round(n).toLocaleString("en-NG")}`;
const changeOf = (weeks: readonly number[]) => ((weeks[weeks.length - 1] - weeks[0]) / weeks[0]) * 100;

/**
 * WorldSports, coming soon: own a share of a player like a stock. On the
 * pitch the team jogs in place and three players can be picked; beside it
 * the picked player's share: their photo or shirt, the price and its last
 * fortnight, and a share to buy or sell (each moves the price a little, as
 * demand would). Prices tick while you watch. All illustrative; 18+.
 */
export function WorldsportsShare() {
  const reduced = useReducedMotion();
  const [picked, setPicked] = useState<PlayerId>("adeyemi");
  const [prices, setPrices] = useState<Record<PlayerId, number[]>>(() =>
    Object.fromEntries(PLAYERS.map((p) => [p.id, [...p.weeks]])) as Record<PlayerId, number[]>,
  );
  const [owned, setOwned] = useState<Record<PlayerId, number>>({ adeyemi: 0, mensah: 0, bello: 0 });
  const [copied, setCopied] = useState(false);

  const move = (id: PlayerId, by: number) =>
    setPrices((all) => {
      const series = all[id];
      return { ...all, [id]: [...series.slice(0, -1), Math.max(1, series[series.length - 1] * (1 + by))] };
    });

  // The market keeps moving: each price ticks a little, every few seconds
  const tick = useEffectEvent(() => {
    if (document.hidden) return;
    for (const p of PLAYERS) move(p.id, (Math.random() - 0.48) * 0.006);
  });
  useEffect(() => {
    if (reduced) return;
    const timer = window.setInterval(tick, 2600);
    return () => window.clearInterval(timer);
  }, [reduced]);

  const player = PLAYERS.find((p) => p.id === picked) ?? PLAYERS[0];
  const series = prices[player.id];
  const price = series[series.length - 1];
  const change = changeOf(series);
  const lo = Math.min(...series);
  const hi = Math.max(...series);
  const mine = owned[player.id];

  return (
    <div className={styles.desk}>
      <div className={styles.pitch} role="group" aria-label={`${CLUB} on the pitch: pick a player`}>
        <svg aria-hidden="true" className={styles.lines} viewBox="0 0 160 100" preserveAspectRatio="none">
          <rect x="4" y="4" width="152" height="92" />
          <line x1="80" y1="4" x2="80" y2="96" />
          <circle cx="80" cy="50" r="13" />
          <rect x="4" y="28" width="22" height="44" />
          <rect x="134" y="28" width="22" height="44" />
        </svg>
        {HOME.map(([n, x, y], i) => (
          <span key={`h${n}`} aria-hidden="true" className={styles.dot} style={spot(x, y, i)}>
            {n}
          </span>
        ))}
        {AWAY.map(([n, x, y], i) => (
          <span key={`a${n}`} aria-hidden="true" className={styles.dot} data-away="" style={spot(x, y, i + 3)}>
            {n}
          </span>
        ))}
        {PLAYERS.map((p, i) => (
          <button
            key={p.id}
            type="button"
            className={styles.dot}
            data-tradable=""
            data-picked={p.id === picked || undefined}
            aria-pressed={p.id === picked}
            aria-label={`${p.name}, ${p.role}, ${naira(prices[p.id][prices[p.id].length - 1])} a share`}
            onClick={() => setPicked(p.id)}
            style={spot(p.at[0], p.at[1], i + 5)}
          >
            {p.number}
            {p.id === picked && (
              <span className={styles.tag} aria-hidden="true">
                {p.name.toUpperCase()} <b>{naira(prices[p.id][prices[p.id].length - 1])}</b>
              </span>
            )}
          </button>
        ))}
      </div>

      <div className={styles.card}>
        <p className={styles.cardTag}>
          <i aria-hidden="true" />
          Player share · illustrative
        </p>
        <div className={styles.who}>
          <span className={styles.face}>
            {player.photo ? (
              <Image src={player.photo} alt="" fill sizes="96px" className={styles.photo} />
            ) : (
              <span className={styles.shirt} aria-hidden="true">
                {player.number}
              </span>
            )}
            {/* The number on the photo's corner (the shirt already shows it) */}
            {player.photo && (
              <b className={styles.badge} aria-hidden="true">
                {player.number}
              </b>
            )}
          </span>
          <span className={styles.whoText}>
            <b>{player.name}</b>
            <small>
              {player.role} · {CLUB}
            </small>
          </span>
        </div>
        <div className={styles.priceRow}>
          <b className={styles.price}>{naira(price)}</b>
          <span className={styles.change} data-down={change < 0 || undefined}>
            <Icon name={change < 0 ? "trending-down" : "trending-up"} size={16} tone="current" />
            {change >= 0 ? "+" : ""}
            {change.toFixed(1)}% this fortnight
          </span>
        </div>
        <div className={styles.bars} aria-hidden="true">
          {series.map((v, i) => (
            <i
              key={i}
              data-now={i === series.length - 1 || undefined}
              style={{ height: `${18 + ((v - lo) / Math.max(hi - lo, 1)) * 82}%` }}
            />
          ))}
        </div>
        <div className={styles.trade}>
          <button
            type="button"
            className={styles.buy}
            onClick={() => {
              setOwned((o) => ({ ...o, [player.id]: o[player.id] + 1 }));
              move(player.id, 0.004);
            }}
          >
            Buy a share
          </button>
          <button
            type="button"
            className={styles.sell}
            disabled={mine === 0}
            onClick={() => {
              setOwned((o) => ({ ...o, [player.id]: Math.max(0, o[player.id] - 1) }));
              move(player.id, -0.004);
            }}
          >
            Sell
          </button>
        </div>
        <div className={styles.foot}>
          <span aria-live="polite">
            {mine === 0 ? "You own none yet" : `You own ${mine} · ${naira(mine * price)}`}
          </span>
          <button type="button" className={styles.copy} aria-pressed={copied} onClick={() => setCopied((c) => !c)}>
            <Icon name={copied ? "check" : "copy"} size={14} tone="current" />
            {copied ? "Lineup copied · 11 players" : "Copy @tobi_xi’s lineup"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** A shirt on the pitch: where it stands, and its own pace jogging on the spot. */
function spot(x: number, y: number, i: number) {
  return {
    left: `${x}%`,
    top: `${y}%`,
    "--dx": `${((i % 3) - 1) * 3}px`,
    "--dy": `${((i * 7) % 5) - 2}px`,
    "--t": `${2.4 + (i % 4) * 0.5}s`,
  } as CSSProperties;
}
