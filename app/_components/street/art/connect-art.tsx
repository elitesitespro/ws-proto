import type { CSSProperties } from "react";
import Image from "next/image";
import { LAND_DOTS } from "../../worldmeet/globe-dots";
import { face, type PersonId } from "../../worldspace/people";
import type { ArtProps } from "../street-districts";
import styles from "./connect-art.module.css";

type Place = { lon: number; lat: number };
type Point = { x: number; y: number };

const round = (n: number) => Math.round(n * 10) / 10;

// The night map is flat, 360 × 180: x runs east from the date line, y south
// from the pole
const onMap = ({ lon, lat }: Place): Point => ({ x: lon + 180, y: 90 - lat });

// A flight path from a to b, bowed to its left by `bend` of its length
const curve = (a: Point, b: Point, bend: number) => {
  const cx = (a.x + b.x) / 2 + (b.y - a.y) * bend;
  const cy = (a.y + b.y) / 2 - (b.x - a.x) * bend;
  return `M${round(a.x)} ${round(a.y)}Q${round(cx)} ${round(cy)} ${round(b.x)} ${round(b.y)}`;
};

// The land, as dots on a 2.5° grid, from the WorldMeet globe's own map. The
// far east and the far south never show on the face, so they're left off
const LAND = (() => {
  const step = 2.5;
  const seen = new Set<string>();
  let d = "";
  for (let i = 0; i < LAND_DOTS.length; i += 2) {
    const lon = Math.round(LAND_DOTS[i] / step) * step;
    const lat = Math.round(LAND_DOTS[i + 1] / step) * step;
    if (lon > 112 || lat < -56) continue;
    const key = `${lon},${lat}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const { x, y } = onMap({ lon, lat });
    d += `M${round(x)} ${round(y)}h0`;
  }
  return d;
})();

const CITY = {
  london: { lon: -0.1, lat: 51.5 },
  lagos: { lon: 3.4, lat: 6.5 },
  toronto: { lon: -79.4, lat: 43.7 },
  nairobi: { lon: 36.8, lat: -1.3 },
  mumbai: { lon: 72.9, lat: 19.1 },
  johannesburg: { lon: 28, lat: -26.2 },
} satisfies Record<string, Place>;
type City = keyof typeof CITY;

// London is where the map hangs from (see .world)
const LONDON = onMap(CITY.london);

// Who's where. London and Lagos lead, tagged; Johannesburg only fits a wide face
const PEOPLE: readonly { city: City; who: PersonId; tag?: string; wideOnly?: boolean }[] = [
  { city: "london", who: "tolu", tag: "London" },
  { city: "lagos", who: "chidi", tag: "Lagos" },
  { city: "toronto", who: "kwame" },
  { city: "nairobi", who: "wanjiru" },
  { city: "mumbai", who: "arjun" },
  { city: "johannesburg", who: "thandi", wideOnly: true },
];

// The gold arcs between them; the first is London to Lagos, the brightest
const ARCS: readonly { from: City; to: City; bend: number; wideOnly?: boolean }[] = [
  { from: "london", to: "lagos", bend: -0.3 },
  { from: "toronto", to: "london", bend: 0.3 },
  { from: "london", to: "mumbai", bend: 0.2 },
  { from: "lagos", to: "nairobi", bend: 0.25 },
  { from: "lagos", to: "johannesburg", bend: -0.25, wideOnly: true },
];

// Other cities' lights
const LIGHTS: readonly Place[] = [
  { lon: -74, lat: 40.7 }, // New York
  { lon: -99.1, lat: 19.4 }, // Mexico City
  { lon: -74.1, lat: 4.7 }, // Bogotá
  { lon: -46.6, lat: -23.5 }, // São Paulo
  { lon: -9.1, lat: 38.7 }, // Lisbon
  { lon: 37.6, lat: 55.8 }, // Moscow
  { lon: 31.2, lat: 30 }, // Cairo
  { lon: 15.3, lat: -4.3 }, // Kinshasa
  { lon: 28, lat: -26.2 }, // Johannesburg, under Mei on a wide face
  { lon: 55.3, lat: 25.2 }, // Dubai
  { lon: 77.2, lat: 28.6 }, // Delhi
  { lon: 100.5, lat: 13.8 }, // Bangkok
];

// WorldSpace's stars, the same on every visit (a seeded sequence): faint and
// small, to near and bright
const STARS = (() => {
  let seed = 11;
  const next = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: 96 }, (_, index) => {
    const depth = index < 64 ? 0 : index < 88 ? 1 : 2;
    return {
      x: `${(next() * 100).toFixed(2)}%`,
      y: `${(next() * 100).toFixed(2)}%`,
      r: [0.6, 1, 1.5][depth],
      opacity: [0.35, 0.6, 0.95][depth],
    };
  });
})();

// WorldSpace's room round the helmet, as on its tour panel: an orbit tipped
// back through the helmet, in % of its box. Each seat sits at an angle round
// it (0° its right end, 90° its near side); the far ones pass behind. The
// near ones keep right of the frame's words
const ORBIT = { rx: 46, ry: 13, tilt: -9 };
const TALKING: PersonId = "chidi";
const SEATS = (
  [
    ["kwame", 25],
    ["thandi", 60],
    ["chidi", 100],
    ["wanjiru", 200],
    ["tolu", 235],
    ["arjun", 315],
  ] as const
).map(([who, angle], i) => {
  const a = (angle * Math.PI) / 180;
  const t = (ORBIT.tilt * Math.PI) / 180;
  const x = ORBIT.rx * Math.cos(a);
  const y = ORBIT.ry * Math.sin(a);
  return {
    who,
    i,
    near: Math.sin(a) > 0,
    left: `${round(50 + x * Math.cos(t) - y * Math.sin(t))}%`,
    top: `${round(50 + x * Math.sin(t) + y * Math.cos(t))}%`,
  };
});

// WorldMeet's link between the two on the call, in % of the art: one shape
// for a laptop's or a tablet's face, one for a phone's band (from one tile's
// top to the other's, side by side). Its mark rides the peak
type Link = { from: readonly [number, number]; via: readonly [number, number]; to: readonly [number, number] };
const LINKS: Record<"wide" | "phone", Link> = {
  wide: { from: [53, 22], via: [70, -4], to: [78, 27] },
  phone: { from: [30, 30], via: [50, 4], to: [70, 32] },
};
const linkPath = ({ from, via, to }: Link) => `M${from[0]} ${from[1]}Q${via[0]} ${via[1]} ${to[0]} ${to[1]}`;
const peak = ({ from, via, to }: Link) =>
  [(from[0] + 2 * via[0] + to[0]) / 4, (from[1] + 2 * via[1] + to[1]) / 4].map((n) => `${round(n)}%`);
const [WIDE_X, WIDE_Y] = peak(LINKS.wide);
const [PHONE_X, PHONE_Y] = peak(LINKS.phone);

/** The orbit's two rings: their far halves go behind the helmet, their near halves in front. */
function Rings({ near }: { near: boolean }) {
  const sweep = near ? 0 : 1;
  return (
    <svg className={styles.rings} viewBox="0 0 100 100">
      <path className={styles.outer} transform="rotate(12 50 50)" d={`M1 50A49 9 0 0 ${sweep} 99 50`} />
      <path
        transform={`rotate(${ORBIT.tilt} 50 50)`}
        d={`M${50 - ORBIT.rx} 50A${ORBIT.rx} ${ORBIT.ry} 0 0 ${sweep} ${50 + ORBIT.rx} 50`}
      />
    </svg>
  );
}

/**
 * Connect Ave's billboard. By default, "Nobody's far away": people on a
 * night map, each in their own city, joined by gold arcs, lighting up as the
 * car arrives. Looking at an exit, it becomes that platform: WorldSpace's
 * helmet in its orbit of faces, or a WorldMeet call from London to Lagos.
 */
export function ConnectArt({ focus, lit }: ArtProps) {
  const seat = ({ who, i, near, left, top }: (typeof SEATS)[number]) => (
    <span
      key={who}
      className={styles.seat}
      data-far={!near || undefined}
      data-talking={who === TALKING || undefined}
      style={{ left, top, "--i": i } as CSSProperties}
    >
      <Image src={face(who)} alt="" width={96} height={96} />
    </span>
  );

  return (
    <div aria-hidden="true" className={styles.art} data-focus={focus ?? undefined} data-lit={lit || undefined}>
      {/* Nobody's far away: the night map and the people on it */}
      <div className={`${styles.layer} ${styles.people}`}>
        <div
          className={styles.world}
          style={{ "--fx": (LONDON.x / 360).toFixed(4), "--fy": (LONDON.y / 180).toFixed(4) } as CSSProperties}
        >
          <svg className={styles.map} viewBox="0 0 360 180" preserveAspectRatio="none">
            <path className={styles.land} d={LAND} />
            <g className={styles.lights}>
              {LIGHTS.map((place) => {
                const { x, y } = onMap(place);
                return (
                  <g key={`${place.lon},${place.lat}`}>
                    <circle className={styles.glow} cx={x} cy={y} r={2.4} />
                    <circle cx={x} cy={y} r={0.8} />
                  </g>
                );
              })}
            </g>
          </svg>
          <svg className={styles.arcs} viewBox="0 0 360 180" preserveAspectRatio="none">
            {ARCS.map(({ from, to, bend, wideOnly }, i) => {
              const d = curve(onMap(CITY[from]), onMap(CITY[to]), bend);
              return (
                <g
                  key={`${from}-${to}`}
                  className={styles.arc}
                  data-lead={i === 0 || undefined}
                  data-only={wideOnly ? "wide" : undefined}
                  style={{ "--i": i } as CSSProperties}
                >
                  <path className={styles.glow} d={d} />
                  <path d={d} />
                </g>
              );
            })}
          </svg>
          {PEOPLE.map(({ city, who, tag, wideOnly }, i) => {
            const { x, y } = onMap(CITY[city]);
            return (
              <span
                key={city}
                className={styles.pin}
                data-lead={tag ? true : undefined}
                data-only={wideOnly ? "wide" : undefined}
                style={{ left: `${round(x / 3.6)}%`, top: `${round(y / 1.8)}%`, "--i": i } as CSSProperties}
              >
                <Image src={face(who)} alt="" width={tag ? 192 : 96} height={tag ? 192 : 96} />
                {tag && <span className={styles.tag}>{tag}</span>}
              </span>
            );
          })}
        </div>
      </div>

      {/* WorldSpace: the helmet afloat in deep space, in its orbit of faces */}
      <div className={`${styles.layer} ${styles.space}`}>
        <svg className={styles.stars}>
          {STARS.map((star, index) => (
            <circle key={index} cx={star.x} cy={star.y} r={star.r} opacity={star.opacity} />
          ))}
        </svg>
        <div className={styles.orbit}>
          <span className={styles.halo} />
          <Rings near={false} />
          {SEATS.filter((s) => !s.near).map(seat)}
          <div className={styles.float}>
            <div className={styles.bob}>
              <Image src="/assets/worldspace/helmet.webp" alt="" width={512} height={512} />
            </div>
          </div>
          <Rings near />
          {SEATS.filter((s) => s.near).map(seat)}
        </div>
      </div>

      {/* WorldMeet: a call from London to Lagos on one gold link */}
      <div
        className={`${styles.layer} ${styles.meet}`}
        style={
          { "--peak-x": WIDE_X, "--peak-y": WIDE_Y, "--peak-x-phone": PHONE_X, "--peak-y-phone": PHONE_Y } as CSSProperties
        }
      >
        <svg className={styles.link} viewBox="0 0 100 100" preserveAspectRatio="none">
          {(["wide", "phone"] as const).map((shape) => (
            <g key={shape} data-shape={shape}>
              <path className={styles.glow} d={linkPath(LINKS[shape])} />
              <path d={linkPath(LINKS[shape])} />
            </g>
          ))}
        </svg>
        <span className={styles.mark}>
          {/* The call going out, in gold rings */}
          <span className={styles.waves}>
            <i />
            <i />
            <i />
          </span>
          <Image src="/assets/worldmeet/mark.svg" alt="" width={48} height={48} unoptimized />
        </span>
        <span className={`${styles.tile} ${styles.london}`}>
          <Image src={face("tolu")} alt="" width={192} height={192} />
          <span className={styles.plate}>London</span>
        </span>
        <span className={`${styles.tile} ${styles.lagos}`} data-talking>
          <Image src={face("chidi")} alt="" width={192} height={192} />
          <span className={styles.plate}>Lagos</span>
        </span>
      </div>
    </div>
  );
}
