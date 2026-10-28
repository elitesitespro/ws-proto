import Image from "next/image";
import { useId, type CSSProperties } from "react";
import type { ArtProps } from "../street-districts";
import styles from "./markets-art.module.css";

const SIZES = "(min-width: 1024px) 55vw, 100vw";
const round = (n: number) => Math.round(n * 100) / 100;
/** Custom properties for where a part sits and when it moves. */
const vars = (v: Record<`--${string}`, string | number>) => v as CSSProperties;

/* The district at night */

type Tower = { x: number; w: number; top: number; high: number; down?: boolean };

// Its towers, each a candle: the body rises from the street to the close and
// the spire to the high, and left to right they climb like a chart. In the
// skyline's units (x −40 to 160, the street at y 90), on its 1.5 × 2 window grid.
const TOWERS: readonly Tower[] = [
  { x: -39, w: 7.5, top: 72, high: 66 },
  { x: -28.5, w: 7.5, top: 66, high: 60 },
  { x: -18, w: 7.5, top: 70, high: 64, down: true },
  { x: -7.5, w: 7.5, top: 66, high: 59 },
  { x: 3, w: 7.5, top: 62, high: 56 },
  { x: 13.5, w: 7.5, top: 56, high: 50 },
  { x: 24, w: 7.5, top: 60, high: 53, down: true },
  { x: 34.5, w: 7.5, top: 52, high: 46 },
  { x: 45, w: 7.5, top: 46, high: 40 },
  { x: 55.5, w: 7.5, top: 50, high: 44, down: true },
  { x: 66, w: 9, top: 40, high: 33 },
  { x: 78, w: 7.5, top: 34, high: 28 },
  { x: 88.5, w: 7.5, top: 38, high: 31, down: true },
  { x: 99, w: 9, top: 30, high: 23 },
  { x: 111, w: 7.5, top: 26, high: 20 },
  { x: 121.5, w: 9, top: 30, high: 24, down: true },
  { x: 133.5, w: 9, top: 22, high: 16 },
  { x: 145.5, w: 9, top: 18, high: 13 },
];

// The towers further back, lower and unlit, as [x, width, top]
const DISTANT: readonly (readonly [number, number, number])[] = [
  [-40, 6, 76], [-35, 8, 70], [-27, 5, 74], [-22, 9, 68], [-13, 6, 72], [-7, 8, 66],
  [1, 5, 70], [6, 9, 62], [15, 6, 66], [21, 8, 60], [29, 5, 64], [34, 9, 56],
  [43, 6, 60], [49, 8, 52], [57, 5, 56], [62, 9, 48], [71, 6, 52], [77, 8, 44],
  [85, 5, 48], [90, 9, 40], [99, 6, 44], [105, 8, 36], [113, 5, 40], [118, 9, 34],
  [127, 6, 38], [133, 8, 30], [141, 5, 34], [146, 9, 28], [155, 5, 32],
];

// Windows left dark, as [column, floor] on a 7 × 5 repeat
const DARK: readonly (readonly [number, number])[] = [
  [0, 0], [3, 0], [6, 0], [5, 1], [1, 2], [2, 2], [6, 2], [4, 3], [0, 4], [3, 4], [5, 4],
];

// The close, from tower top to tower top, ending on the tallest
const CLOSE = [[-40, 74], ...TOWERS.map((t) => [t.x + t.w / 2, t.top])].map(([x, y]) => `${x},${y}`).join(" ");
const PEAK = TOWERS[TOWERS.length - 1];

// The LED ticker's pairs and coins (illustrative prices)
const TAPE = [
  ["EUR/USD", "1.1355"],
  ["BTC", "67,240"],
  ["GBP/USD", "1.3247"],
  ["ETH", "3,520"],
  ["USD/JPY", "148.62"],
  ["SOL", "174.20"],
  ["EUR/GBP", "0.8572"],
  ["XRP", "0.6200"],
] as const;

/* Forex */

// A climbing run of candles in a 100 × 100 box (lower is higher), each one
// opening at the last one's close
const FX_CLOSES = [92, 87, 89, 83, 84, 78, 73, 75, 69, 64, 66, 59, 60, 54, 49, 51, 44, 39, 41, 34, 29, 31, 24, 19, 21, 15];
const FX_CANDLES = FX_CLOSES.map((c, i) => {
  const o = i ? FX_CLOSES[i - 1] : 95;
  return { x: 2 + i * 3, o, c, high: Math.min(o, c) - 1 - (i % 3), low: Math.max(o, c) + 1 + ((i * 7) % 4) / 2 };
});

// The pair, in front of the line, and two more further off: where each sits
// on a laptop (x, y), as % of the face, and on a phone (px, py), as % of the
// art's band over the words, and its size on each (s, ps). On a phone the
// pair sits low on the left, over the chart's faded start.
const FLAGS = [
  { id: "jpy", x: 44, y: 14, px: 52, py: 14, s: 8, ps: 10, far: true },
  { id: "gbp", x: 93, y: 7, px: 9, py: 17, s: 10, ps: 12, far: true },
  { id: "eur", x: 56, y: 36, px: 21, py: 50, s: 30, ps: 42, far: false },
  { id: "usd", x: 66, y: 39, px: 35, py: 57, s: 30, ps: 42, far: false },
] as const;

/* Crypto */

type Orbit = { cx: number; cy: number; rx: number; ry: number; tilt: number };

// Bitcoin's orbit on a laptop (% of the face) and on a phone (% of the art's
// band, in the middle of it); tilt in degrees
const ORBIT: Orbit = { cx: 72, cy: 36, rx: 22, ry: 14, tilt: -10 };
const ORBIT_PHONE: Orbit = { cx: 50, cy: 52, rx: 36, ry: 22, tilt: -8 };

/** A point on an orbit, `deg` round from its right-hand end. */
function onOrbit(o: Orbit, deg: number) {
  const r = (o.tilt * Math.PI) / 180;
  const a = (deg * Math.PI) / 180;
  const x = o.rx * Math.cos(a);
  const y = o.ry * Math.sin(a);
  return [round(o.cx + x * Math.cos(r) - y * Math.sin(r)), round(o.cy + x * Math.sin(r) + y * Math.cos(r))] as const;
}

/** Half an orbit, end to end: the far half over the top, or the near one. */
function halfOrbit(o: Orbit, near: boolean) {
  const [x1, y1] = onOrbit(o, 180);
  const [x2, y2] = onOrbit(o, 0);
  return `M${x1} ${y1} A${o.rx} ${o.ry} ${o.tilt} 0 ${near ? 0 : 1} ${x2} ${y2}`;
}

// The coins round it: how far round the orbit each sits (past 180 is the far
// side, behind Bitcoin) and its size on a laptop and on a phone
const COINS = [
  { id: "eth", at: 205, s: 16, ps: 22 },
  { id: "bnb", at: 320, s: 10, ps: 14 },
  { id: "sol", at: 60, s: 13, ps: 18 },
  { id: "xrp", at: 120, s: 9, ps: 12 },
].map((c, i) => {
  const [x, y] = onOrbit(ORBIT, c.at);
  const [px, py] = onOrbit(ORBIT_PHONE, c.at);
  return { ...c, x, y, px, py, far: c.at > 180, delay: 80 + i * 60 };
});

// A few stars over the night
const STARS: readonly (readonly [number, number, number])[] = [
  [6, 8, 0.5], [14, 22, 0.35], [22, 6, 0.4], [31, 16, 0.3], [38, 9, 0.55], [47, 4, 0.35],
  [55, 18, 0.3], [61, 7, 0.45], [68, 13, 0.3], [79, 5, 0.5], [86, 12, 0.35], [93, 4, 0.4],
  [97, 19, 0.3], [9, 34, 0.3], [27, 30, 0.35], [42, 25, 0.3], [95, 33, 0.3],
];

// Its gold line, rising behind the coins
const SPARK = "M0 80 C 10 78, 16 84, 26 74 S 40 68, 48 62 S 64 58, 72 48 S 88 34, 100 26";

/* Prediction */

// The crowd's chance of yes over the week, four readings a day (illustrative)
const CROWD = [41, 42, 41, 43, 44, 43, 45, 46, 45, 47, 48, 47, 49, 50, 49, 51, 52, 53, 52, 54, 55, 56, 55, 57, 58, 60, 61, 62];
const CROWD_LO = 36;
const CROWD_HI = 66;
const crowdY = (v: number) => round(((CROWD_HI - v) / (CROWD_HI - CROWD_LO)) * 100);
const CROWD_LINE = CROWD.map((v, i) => `${i ? "L" : "M"}${round((i / (CROWD.length - 1)) * 100)} ${crowdY(v)}`).join(" ");
const YES = CROWD[CROWD.length - 1];

/**
 * Markets Row's billboard art. By default the financial district at night:
 * towers that are candles climbing like a chart, their windows coming on and
 * the close drawing itself across their tops as the car arrives, under an
 * LED ticker. Looking at an exit, that platform's own look: Forex's paper and
 * flags, Crypto's coins in orbit, Prediction's crowd chance. Prices and
 * chances are illustrative.
 */
export function MarketsArt({ focus, lit }: ArtProps) {
  const id = useId();
  const url = (name: string) => `url(#${id}-${name})`;

  return (
    <div aria-hidden="true" className={styles.art} data-focus={focus ?? undefined} data-lit={lit || undefined}>
      {/* The district at night */}
      <div className={`${styles.scene} ${styles.city}`}>
        <svg className={styles.skyline} viewBox="-40 0 200 90" preserveAspectRatio="xMaxYMid slice">
          <defs>
            <linearGradient id={`${id}-far`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#231d18" />
              <stop offset="1" stopColor="#2b2119" />
            </linearGradient>
            <linearGradient id={`${id}-body`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#29231e" />
              <stop offset="1" stopColor="#110e0c" />
            </linearGradient>
            <linearGradient id={`${id}-rim`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#ffcc2d" stopOpacity="0.55" />
              <stop offset="0.6" stopColor="#ffcc2d" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`${id}-haze`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#ffa95a" stopOpacity="0" />
              <stop offset="1" stopColor="#ffa95a" stopOpacity="0.14" />
            </linearGradient>
            {/* Lit windows, a few brighter than others */}
            <pattern id={`${id}-lit`} width="3" height="4" patternUnits="userSpaceOnUse">
              <rect x="0.35" y="0.45" width="0.8" height="1.1" fill="#ffd98a" />
              <rect x="1.85" y="0.45" width="0.8" height="1.1" fill="#ffe6b0" fillOpacity="0.55" />
              <rect x="0.35" y="2.45" width="0.8" height="1.1" fill="#ffe6b0" fillOpacity="0.7" />
              <rect x="1.85" y="2.45" width="0.8" height="1.1" fill="#ffd98a" fillOpacity="0.9" />
            </pattern>
            {/* And the ones left dark */}
            <pattern id={`${id}-off`} width="10.5" height="10" patternUnits="userSpaceOnUse">
              {DARK.map(([col, floor]) => (
                <rect key={`${col}-${floor}`} x={col * 1.5 + 0.35} y={floor * 2 + 0.45} width="0.8" height="1.1" fill="#15110e" />
              ))}
            </pattern>
          </defs>

          {DISTANT.map(([x, w, top]) => (
            <rect key={x} x={x} y={top} width={w} height={90 - top} fill={url("far")} />
          ))}
          {TOWERS.map((t, i) => (
            <g key={t.x}>
              <line className={styles.spire} x1={t.x + t.w / 2} x2={t.x + t.w / 2} y1={t.high} y2={t.top} />
              <rect x={t.x} y={t.top} width={t.w} height={90 - t.top} fill={url("body")} />
              {!t.down && <rect x={t.x + t.w - 0.3} y={t.top} width="0.3" height={90 - t.top} fill={url("rim")} />}
              <g className={styles.windows} style={vars({ "--i": i, "--on": t.down ? 0.7 : 1 })}>
                <rect x={t.x} y={t.top + 2} width={t.w} height={86 - t.top} fill={url("lit")} />
                <rect x={t.x} y={t.top + 2} width={t.w} height={86 - t.top} fill={url("off")} />
              </g>
            </g>
          ))}
          <rect x="-40" y="56" width="200" height="34" fill={url("haze")} />
        </svg>

        {/* The close across the tops, uncovered left to right as the car arrives */}
        <div className={styles.wipe}>
          <div className={styles.unwipe}>
            <svg className={styles.skyline} viewBox="-40 0 200 90" preserveAspectRatio="xMaxYMid slice">
              <polyline className={styles.closeGlow} points={CLOSE} />
              <polyline className={styles.close} points={CLOSE} />
              <circle className={styles.peak} cx={PEAK.x + PEAK.w / 2} cy={PEAK.top} r="2.6" fillOpacity="0.2" />
              <circle className={styles.peak} cx={PEAK.x + PEAK.w / 2} cy={PEAK.top} r="0.9" />
            </svg>
          </div>
        </div>

        {/* The LED ticker */}
        <div className={styles.ticker}>
          <div className={styles.tape}>
            {[0, 1, 2].flatMap((copy) =>
              TAPE.map(([name, price]) => (
                <span key={`${copy}-${name}`}>
                  {name}
                  <b>{price}</b>
                </span>
              )),
            )}
          </div>
        </div>
      </div>

      {/* Forex: the pair over its candles, on worldstreetgold.com's paper */}
      <div className={`${styles.scene} ${styles.forex}`} style={vars({ "--now": FX_CLOSES[FX_CLOSES.length - 1] / 100 })}>
        <svg className={styles.candles} viewBox="0 0 100 100" preserveAspectRatio="none">
          {FX_CANDLES.map((k, i) => (
            <g key={k.x}>
              <line className={styles.wick} x1={k.x} x2={k.x} y1={k.high} y2={k.low} />
              <rect
                className={i === FX_CANDLES.length - 1 ? styles.now : k.c > k.o ? styles.fall : styles.rise}
                x={k.x - 0.9}
                y={Math.min(k.o, k.c)}
                width="1.8"
                height={Math.max(Math.abs(k.o - k.c), 0.8)}
              />
            </g>
          ))}
        </svg>
        <i className={styles.priceLine} />
        <span className={styles.price}>1.1355</span>
        {FLAGS.map((f, i) => (
          <div
            key={f.id}
            className={styles.disc}
            data-far={f.far || undefined}
            style={vars({
              "--x": `${f.x}%`,
              "--y": `${f.y}%`,
              "--px": `${f.px}%`,
              "--py": `${f.py}%`,
              "--s": `${f.s}cqmin`,
              "--ps": `${f.ps}cqmin`,
              "--d": `${i * 60}ms`,
            })}
          >
            <Image src={`/assets/forex/${f.id}.svg`} alt="" fill sizes={SIZES} unoptimized />
          </div>
        ))}
      </div>

      {/* Crypto: coins in orbit round Bitcoin, in worldstreetgold.com's night */}
      <div className={`${styles.scene} ${styles.crypto}`}>
        {STARS.map(([x, y, a]) => (
          <i key={`${x}-${y}`} className={styles.star} style={vars({ "--x": `${x}%`, "--y": `${y}%`, "--a": a })} />
        ))}
        <svg className={styles.spark} viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`${id}-spark`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#ffcc2d" stopOpacity="0.14" />
              <stop offset="1" stopColor="#ffcc2d" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${SPARK} L100 100 L0 100 Z`} fill={url("spark")} />
          <path className={styles.sparkGlow} d={SPARK} />
          <path className={styles.sparkLine} d={SPARK} />
        </svg>
        <svg className={styles.orbit} viewBox="0 0 100 100" preserveAspectRatio="none">
          <path className={`${styles.ring} ${styles.wide}`} d={halfOrbit(ORBIT, false)} />
          <path className={`${styles.ring} ${styles.phone}`} d={halfOrbit(ORBIT_PHONE, false)} />
        </svg>
        {COINS.filter((c) => c.far).map((c) => (
          <Coin key={c.id} {...c} />
        ))}
        <Coin
          id="btc"
          x={ORBIT.cx}
          y={ORBIT.cy}
          px={ORBIT_PHONE.cx}
          py={ORBIT_PHONE.cy}
          s={30}
          ps={46}
          far={false}
          delay={0}
        />
        <svg className={styles.orbit} viewBox="0 0 100 100" preserveAspectRatio="none">
          <path className={`${styles.ring} ${styles.near} ${styles.wide}`} d={halfOrbit(ORBIT, true)} />
          <path className={`${styles.ring} ${styles.near} ${styles.phone}`} d={halfOrbit(ORBIT_PHONE, true)} />
        </svg>
        {COINS.filter((c) => !c.far).map((c) => (
          <Coin key={c.id} {...c} />
        ))}
      </div>

      {/* Prediction: the crowd's chance climbing to 62%, on a night-teal card over its cream */}
      <div className={`${styles.scene} ${styles.prediction}`}>
        <div className={styles.card}>
          <p className={styles.odds}>
            <strong>{YES}%</strong>
            <span>chance of yes</span>
            <i className={styles.split} style={vars({ "--yes": YES })} />
          </p>
          <div className={styles.crowd}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id={`${id}-crowd`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#7bc6ce" stopOpacity="0.32" />
                  <stop offset="1" stopColor="#7bc6ce" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line className={styles.even} x1="0" x2="100" y1={crowdY(50)} y2={crowdY(50)} />
              <path d={`${CROWD_LINE} L100 100 L0 100 Z`} fill={url("crowd")} />
              <path className={styles.crowdLine} d={CROWD_LINE} />
            </svg>
            <i className={styles.head} style={vars({ "--y": `${crowdY(YES)}%` })} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** A coin, round and lit from the top left, where it sits and how big it is on a laptop and on a phone. */
function Coin({
  id,
  x,
  y,
  px,
  py,
  s,
  ps,
  far,
  delay,
}: {
  id: string;
  x: number;
  y: number;
  px: number;
  py: number;
  s: number;
  ps: number;
  far: boolean;
  delay: number;
}) {
  return (
    <div
      className={id === "btc" ? `${styles.disc} ${styles.btc}` : styles.disc}
      data-far={far || undefined}
      style={vars({
        "--x": `${x}%`,
        "--y": `${y}%`,
        "--px": `${px}%`,
        "--py": `${py}%`,
        "--s": `${s}cqmin`,
        "--ps": `${ps}cqmin`,
        "--d": `${delay}ms`,
      })}
    >
      <Image src={`/assets/crypto/${id}.svg`} alt="" fill sizes={SIZES} unoptimized />
    </div>
  );
}
