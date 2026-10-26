"use client";

import { useEffect, useEffectEvent, useId, useRef, useState, type ComponentType, type UIEvent } from "react";
import { motion, useMotionValue, useMotionValueEvent, useScroll } from "motion/react";
import { Icon } from "@/components/icon";
import { tick } from "@/lib/haptics";
import type { ShowcasePlatformName } from "../platform-showcase-content";
import { StreetCar } from "../street-car";
import street from "../street.module.css";
import { ConnectArt } from "./art/connect-art";
import { EntertainmentArt } from "./art/entertainment-art";
import { LifestyleArt } from "./art/lifestyle-art";
import { MarketsArt } from "./art/markets-art";
import { DistrictBillboard } from "./district-billboard";
import { ExitSign } from "./exit-sign";
import { RevealWords } from "./reveal-words";
import { DISTRICTS, type ArtProps, type District } from "./street-districts";
import styles from "./street-section.module.css";

const ART: Record<District["id"], ComponentType<ArtProps>> = {
  connect: ConnectArt,
  entertainment: EntertainmentArt,
  lifestyle: LifestyleArt,
  markets: MarketsArt,
};
// Each district's first exit, numbered along the street
const FIRST_EXIT = DISTRICTS.map((_, i) => 1 + DISTRICTS.slice(0, i).reduce((n, d) => n + d.exits.length, 0));

// The mouth's two rounded corners and the road between them, in px: on a
// laptop, and on a phone or a tablet (as round as the road's bends there;
// the roads as wide as street.module.css draws them)
const MOUTH = { radius: 112, road: 32 };
const MOUTH_SM = { radius: 88, road: 28 };
// The car keeps this far down the screen while it drives. The street's
// opening words have all come up by the time they reach this line too.
export const ANCHOR = 0.6;
// It waits this far down the street until those words are in, and pulls up
// this far short of its end
const PARKED = 48;
export const PULL_UP = 40;
// Pulling away, it gets up to speed and onto its line over this much of a
// screen's scroll
const PULL_AWAY = 0.35;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
// The street ends this far above the section's foot
export const END_GAP = 56;
// A bend's corners: as round as this at most, the same as the mouth's
const CORNER = MOUTH.radius;

/** A point on the street, how far along it is, and how far down the page the
 *  car's line is when the car's there (`v`: its own height, except on a bend). */
type Point = { x: number; y: number; at: number; v: number };
type Road = {
  width: number;
  height: number;
  d: string;
  /** The street, walked in small steps from its start, for placing the car. */
  points: Point[];
  start: number;
  end: number;
  /** Where the mouth opens, and how big it is. */
  mouth: { x: number; radius: number; road: number };
  /** How far down the street's opening words end: the car sets off once they're in. */
  go: number;
  /** How far down each district starts, and each exit sits. */
  districts: number[];
  exits: number[];
};

/**
 * The street through WorldStreet's four districts, after the platform tour:
 * it comes out of the tour's cream, and the car drives it as you scroll,
 * swinging from side to side between the districts. Each district has a
 * billboard saying what it's for, and its platforms are exits off the road,
 * out to each one. It ends at your wallet.
 *
 * `pinned`: the street holds still once the car has pulled up at its end,
 * for as long as whatever wraps it runs on (the wallet opens out of it
 * there: ./street-to-wallet). `onRoadEnd` hears how far across the road
 * ends, in px, each time the street is laid.
 */
export function StreetSection({
  pinned = false,
  onRoadEnd,
}: {
  pinned?: boolean;
  onRoadEnd?: (x: number) => void;
} = {}) {
  const sectionRef = useRef<HTMLElement>(null);
  const approachRef = useRef<HTMLDivElement>(null);
  const openingRef = useRef<HTMLElement>(null);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const laneRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const exitRefs = useRef<(HTMLLIElement | null)[]>([]);
  const rowRefs = useRef<(HTMLUListElement | null)[]>([]);
  const trailMask = useId();
  const [road, setRoad] = useState<Road | null>(null);
  // How many districts the car has reached, and exits it has passed
  const [reached, setReached] = useState(0);
  const [passed, setPassed] = useState(0);
  const [focus, setFocus] = useState<ShowcasePlatformName | null>(null);
  // On a phone or a tablet each district's exits are a row you swipe: the
  // one at its start, in each, and the billboard shows the one you swipe to
  const [swiped, setSwiped] = useState<number[]>(() => DISTRICTS.map(() => 0));
  const swipe = (i: number) => (event: UIEvent<HTMLUListElement>) => {
    const row = event.currentTarget;
    const first = row.firstElementChild as HTMLElement | null;
    if (!first) return;
    const count = DISTRICTS[i].exits.length;
    const step = first.offsetWidth + parseFloat(getComputedStyle(row).columnGap || "0");
    const end = row.scrollLeft >= row.scrollWidth - row.clientWidth - 2;
    const at = end ? count - 1 : Math.min(Math.round(row.scrollLeft / step), count - 1);
    if (at !== swiped[i]) tick();
    setSwiped((all) => (all[i] === at ? all : all.map((n, k) => (k === i ? at : n))));
    setFocus(DISTRICTS[i].exits[at].name);
  };
  // Or picks one from the dots under the row, and the row slides to it
  const swipeTo = (i: number, j: number) => {
    const row = rowRefs.current[i];
    const first = row?.firstElementChild as HTMLElement | null;
    const exit = row?.children[j] as HTMLElement | undefined;
    if (row && first && exit) row.scrollTo({ left: exit.offsetLeft - first.offsetLeft, behavior: "smooth" });
  };
  const carLeft = useMotionValue("0px");
  const carTop = useMotionValue("0px");
  const carAngle = useMotionValue(0);
  const trail = useMotionValue(0);

  // Lay the street down the districts' lanes: straight down each, and across
  // the gap between them as a street turns, a round corner, a straight run
  // across and a round corner back down
  const measure = () => {
    const section = sectionRef.current;
    if (!section) return;
    const box = section.getBoundingClientRect();
    const lanes = DISTRICTS.map((_, i) => {
      const lane = laneRefs.current[i]?.getBoundingClientRect();
      const block = blockRefs.current[i]?.getBoundingClientRect();
      return {
        x: lane ? lane.left + lane.width / 2 - box.left : 0,
        top: block ? block.top - box.top : 0,
        bottom: block ? block.bottom - box.top : 0,
      };
    });
    const exits = exitRefs.current.map((exit) => {
      const r = exit?.getBoundingClientRect();
      return r ? r.top + r.height / 2 - box.top : 0;
    });
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    // The street opens at the foot of the approach
    const start = approachRef.current ? approachRef.current.getBoundingClientRect().bottom - box.top : 0;
    const end = box.height - END_GAP;
    const opening = openingRef.current?.getBoundingClientRect();

    const points: Point[] = [];
    // Straight down, the car's line is where the car is
    const walk = (x: number, y: number, v = y) => {
      const last = points[points.length - 1];
      points.push({ x, y, v, at: last ? last.at + Math.hypot(x - last.x, y - last.y) : 0 });
    };
    let d = `M${lanes[0].x} ${start}`;
    walk(lanes[0].x, start);
    lanes.forEach((lane, i) => {
      if (i === 0) return;
      const from = lanes[i - 1];
      const across = lane.x - from.x;
      d += `V${from.bottom}`;
      walk(from.x, from.bottom);
      if (Math.abs(across) < 1) return;
      const side = Math.sign(across);
      const mid = (from.bottom + lane.top) / 2;
      const r = Math.min(CORNER, (lane.top - from.bottom) / 2, Math.abs(across) / 2);
      // Down to the first corner, round it onto the run across, along, and
      // round the second corner back down to the next lane
      d +=
        `V${mid - r}A${r} ${r} 0 0 ${side > 0 ? 0 : 1} ${from.x + side * r} ${mid}` +
        `H${lane.x - side * r}A${r} ${r} 0 0 ${side > 0 ? 1 : 0} ${lane.x} ${mid + r}`;
      const bend: [number, number][] = [[from.x, mid - r]];
      for (let step = 1; step <= 16; step++) {
        const a = (step / 16) * (Math.PI / 2);
        bend.push([from.x + side * r - side * r * Math.cos(a), mid - r + r * Math.sin(a)]);
      }
      for (let step = 0; step <= 16; step++) {
        const a = (step / 16) * (Math.PI / 2);
        bend.push([lane.x - side * r + side * r * Math.sin(a), mid + r - r * Math.cos(a)]);
      }
      bend.push([lane.x, lane.top]);
      // Through the bend the car goes by the road's length, not its height:
      // it takes the corners as the page comes down, and is back on its line
      // when the road straightens
      const first = points[points.length - 1];
      let length = 0;
      const lengths = bend.map(([x, y], k) => {
        const [px, py] = k ? bend[k - 1] : [first.x, first.y];
        length += Math.hypot(x - px, y - py);
        return length;
      });
      bend.forEach(([x, y], k) => walk(x, y, from.bottom + ((lane.top - from.bottom) * lengths[k]) / length));
    });
    const last = lanes[lanes.length - 1];
    d += `V${end}`;
    walk(last.x, end);

    setRoad({
      width: box.width,
      height: box.height,
      d,
      points,
      start,
      end,
      mouth: { x: lanes[0].x, ...(wide ? MOUTH : MOUTH_SM) },
      go: opening ? opening.bottom - box.top : start,
      districts: lanes.map((lane) => lane.top),
      exits,
    });
    onRoadEnd?.(last.x);
  };

  // The car waits at the start until the street's opening words are in, then
  // pulls away: it gets up to speed and down to its line on the screen, and
  // keeps there while the street runs under it. It pulls up at the end.
  const drive = () => {
    const section = sectionRef.current;
    if (!section || !road) return;
    const top = section.getBoundingClientRect().top;
    const view = window.innerHeight;
    const parked = road.start + PARKED;
    // It sets off once its opening words are in and the page has come down
    // to it, from rest, and catches up with the line
    const off = Math.max(road.go, parked);
    const past = view * ANCHOR - top - off;
    const away = past <= 0 ? 0 : (past + off - parked) * easeInOut(Math.min(past / (view * PULL_AWAY), 1));
    const y = Math.min(parked + away, road.end - PULL_UP);
    const { points } = road;
    // The car's line is at `line` down the street: where along it the car is
    const line = y;
    let hi = points.findIndex((point) => point.v >= line);
    if (hi <= 0) hi = 1;
    const a = points[hi - 1];
    const b = points[hi];
    const t = b.v === a.v ? 0 : (line - a.v) / (b.v - a.v);
    const x = a.x + (b.x - a.x) * t;
    const carY = a.y + (b.y - a.y) * t;
    carLeft.set(`${x}px`);
    carTop.set(`${carY}px`);
    // Its nose is drawn pointing down the screen, at 90°
    carAngle.set((Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI - 90);
    trail.set((a.at + (b.at - a.at) * t) / points[points.length - 1].at);
    setReached(road.districts.filter((at) => at - 120 <= carY).length);
    setPassed(road.exits.filter((at) => at <= carY).length);
  };

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", drive);
  // The street's opening words come up as you scroll, all in by the time
  // they reach the car's line
  const { scrollYProgress: openIn } = useScroll({
    target: openingRef,
    offset: ["start 85%", `end ${ANCHOR * 100}%`],
  });
  const remeasure = useEffectEvent(measure);
  const redrive = useEffectEvent(drive);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new ResizeObserver(() => remeasure());
    observer.observe(section);
    return () => observer.disconnect();
  }, []);
  // Put the car in place as soon as the street is laid (or relaid)
  useEffect(() => {
    const frame = requestAnimationFrame(() => redrive());
    return () => cancelAnimationFrame(frame);
  }, [road]);
  const mouth = road?.mouth;

  return (
    <section
      ref={sectionRef}
      id="street"
      aria-labelledby="street-heading"
      className={`${styles.section} ${street.street} bg-background text-foreground`}
      // Pinned, it holds from when the car reaches its parking spot at the
      // end: the road's end on the car's line, just below it
      style={
        pinned && road
          ? { position: "sticky", top: `calc(${ANCHOR * 100}svh + ${PULL_UP - road.end}px)` }
          : undefined
      }
    >
      {road && (
        <svg
          aria-hidden="true"
          className={styles.road}
          width={road.width}
          height={road.height}
          viewBox={`0 0 ${road.width} ${road.height}`}
        >
          <defs>
            <mask id={trailMask} maskUnits="userSpaceOnUse" x="0" y="0" width={road.width} height={road.height}>
              {/* The way the car has come */}
              <motion.path d={road.d} fill="none" stroke="#fff" strokeWidth="12" style={{ pathLength: trail }} />
            </mask>
          </defs>
          <path d={road.d} className={street.turnRoad} strokeLinecap="round" />
          <path d={road.d} className={street.turnLane} />
          <path d={road.d} className={street.turnTrail} mask={`url(#${trailMask})`} />
        </svg>
      )}
      {road && mouth && (
        <svg
          aria-hidden="true"
          className={street.mouth}
          style={{ left: mouth.x, top: road.start }}
          width={2 * mouth.radius + mouth.road}
          height={mouth.radius}
        >
          <path
            d={`M0 0A${mouth.radius} ${mouth.radius} 0 0 1 ${mouth.radius} ${mouth.radius}H${mouth.radius + mouth.road}A${mouth.radius} ${mouth.radius} 0 0 1 ${2 * mouth.radius + mouth.road} 0Z`}
          />
        </svg>
      )}

      {/* The approach: the tour's cream runs on a little, and the street's
          opening words come up in it before it opens out */}
      <div ref={approachRef} className={`${styles.approach} px-4 md:px-6`}>
        <header ref={openingRef} className={`${styles.intro} mx-auto w-full max-w-7xl`}>
          <h2
            id="street-heading"
            className="max-w-4xl text-lg leading-[36px] text-balance font-normal tracking-[-0.03em] sm:text-xl sm:leading-[44px] md:text-3xl md:leading-[56px]"
          >
            <RevealWords text="The world, on one street." progress={openIn} to={0.4} />
          </h2>
          <p className={`${styles.introLine} max-w-[44ch] text-sm`}>
            <RevealWords
              text="Four districts, thirteen exits, and your wallet at the end of the road."
              progress={openIn}
              from={0.3}
            />
          </p>
        </header>
      </div>

      <div className={`${styles.inner} mx-auto w-full max-w-7xl px-4 md:px-6`}>

        {DISTRICTS.map((district, i) => {
          const Art = ART[district.id];
          const lit = reached > i;
          const mine = district.exits.some((exit) => exit.name === focus) ? focus : null;
          return (
            <div
              key={district.id}
              id={district.id}
              ref={(el) => {
                blockRefs.current[i] = el;
              }}
              className={styles.district}
              data-side={i % 2 ? "left" : "right"}
              data-hue={district.hue}
            >
              <span
                aria-hidden="true"
                className={styles.lane}
                ref={(el) => {
                  laneRefs.current[i] = el;
                }}
              />
              <div className={styles.board}>
                <p className={styles.streetSign}>{district.street}</p>
                <DistrictBillboard
                  district={district}
                  firstExit={FIRST_EXIT[i]}
                  focus={mine}
                  lit={lit}
                  art={<Art focus={mine} lit={lit} />}
                />
              </div>
              <ul
                ref={(el) => {
                  rowRefs.current[i] = el;
                }}
                className={styles.exits}
                aria-label={`Exits off ${district.street}`}
                onScroll={swipe(i)}
              >
                {district.exits.map((exit, j) => {
                  const number = FIRST_EXIT[i] + j;
                  return (
                    <ExitSign
                      key={exit.name}
                      ref={(el) => {
                        exitRefs.current[number - 1] = el;
                      }}
                      exit={exit}
                      number={number}
                      order={j}
                      lit={passed >= number}
                      onLook={setFocus}
                    />
                  );
                })}
              </ul>
              {/* Where you are along the row (a phone or a tablet's) */}
              <span aria-hidden="true" className={styles.swipeDots}>
                {district.exits.map((exit, j) => (
                  <button
                    key={exit.name}
                    type="button"
                    tabIndex={-1}
                    data-on={swiped[i] === j || undefined}
                    onClick={() => swipeTo(i, j)}
                  >
                    <i />
                  </button>
                ))}
              </span>
            </div>
          );
        })}

        {/* Beside the road's end, on the last district's side of it */}
        <div className={styles.end} data-side={(DISTRICTS.length - 1) % 2 ? "left" : "right"}>
          <p>
            <Icon name="wallet" size={20} tone="current" />
            <span>
              <b>End of the street: your wallet.</b> Everything you do along it pays into one.
            </span>
          </p>
        </div>
      </div>

      <StreetCar style={{ left: carLeft, top: carTop, rotate: carAngle, opacity: road ? 1 : 0 }} />
    </section>
  );
}
