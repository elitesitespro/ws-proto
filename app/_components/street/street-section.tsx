"use client";

import { useCallback, useEffect, useEffectEvent, useRef, useState, type ComponentType } from "react";
import { useMotionValue, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { Icon } from "@/components/icon";
import { tick } from "@/lib/haptics";
import { useMediaQuery } from "@/lib/use-media-query";
import { usePauseOffscreen } from "@/lib/use-pause-offscreen";
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

// A laptop's mouth: its two rounded corners and the road between them, in
// px (the road as wide as street.module.css draws it there)
const MOUTH = { radius: 112, road: 32 };
// A phone's or a tablet's first lane runs down the screen's edge, so its
// mouth opens nearer the middle: a funnel this deep at most (or this share
// of the room under the approach), opening this far either side of the road
// at most (as wide as street.module.css draws it there). The road leaves it
// in one S into the first lane, going across at most this much for every px
// it drops, as gently as the bends between the districts.
const FUNNEL = { depth: 96, share: 0.4, half: 144, road: 28, lean: 1.2 };
// The car keeps this far down the screen while it drives. The street's
// opening words have all come up by the time they reach this line too.
export const ANCHOR = 0.6;
// It waits this far down the street, and pulls up this far short of its end
const PARKED = 48;
export const PULL_UP = 40;
// The street ends this far above the section's foot
export const END_GAP = 56;
// A laptop's bends: corners as round as this at most, the same as the mouth's
const CORNER = MOUTH.radius;
// A phone's or a tablet's bends are an S, its ends this far along it
// toward each other: upright where it leaves one lane and joins the next
const SWAY = 0.36;
// The car's indicator goes on this far before a bend
const SIGNAL = 180;

/** A point on the street, how far along it is, and how far down the page the
 *  car's line is when the car's there (`v`: its own height, except on a
 *  laptop's bend, where it goes by the road's length). */
type Point = { x: number; y: number; at: number; v: number };
/** A stretch of the street, straight or a bend, for the light it leaves. */
type Piece = { d: string; from: number; to: number };
type Road = {
  width: number;
  height: number;
  d: string;
  /** The street, walked in small steps from its start, for placing the car. */
  points: Point[];
  pieces: Piece[];
  /** Where on the car's line each bend starts and ends, and which way it goes. */
  bends: { from: number; to: number; side: number }[];
  start: number;
  end: number;
  /** Where the mouth opens (its middle), how big it is, and its shape. */
  mouth: { x: number; width: number; height: number; d: string };
  /** How far down each district starts, and each exit sits. */
  districts: number[];
  exits: number[];
  /** A phone's or a tablet's: the slip road off to each exit. */
  ramps: string[];
};

/**
 * The street through WorldStreet's four districts, after the platform tour:
 * it comes out of the tour's cream, and the car drives it as you scroll,
 * swinging from side to side between the districts. Each district has a
 * billboard saying what it's for, and its platforms are exits off the road,
 * out to each one. It ends at your wallet.
 *
 * The car holds its line on the screen by itself (it's sticky), so it keeps
 * dead still while the street runs under it, however the page is scrolled:
 * only its steer across the road follows the scroll. On a phone or a tablet
 * the billboard holds at the top of the screen while the district's exits
 * come by under it, and each one the car passes takes the billboard.
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
  const rigRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const laneRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const exitRefs = useRef<(HTMLLIElement | null)[]>([]);
  const lightRefs = useRef<(SVGGElement | null)[]>([]);
  const lightShown = useRef<number[]>([]);
  usePauseOffscreen(sectionRef);
  const [road, setRoad] = useState<Road | null>(null);
  // How many districts the car has reached, and exits it has passed
  const [reached, setReached] = useState(0);
  const [passed, setPassed] = useState(0);
  const passedRef = useRef(0);
  // The exit you're pointing at, if any (a laptop's; on a phone or a tablet
  // the car picks what the billboard shows as it passes each one)
  const [looking, setLooking] = useState<ShowcasePlatformName | null>(null);
  const narrow = useMediaQuery("(max-width: 1023px)");
  const registerExit = useCallback((number: number, el: HTMLLIElement | null) => {
    exitRefs.current[number - 1] = el;
  }, []);
  const carX = useMotionValue(0);
  const carY = useMotionValue(0);
  // It steers into a bend, not snaps to it
  const heading = useMotionValue(0);
  const carAngle = useSpring(heading, { stiffness: 320, damping: 32, mass: 0.6 });

  // Lay the street down the districts' lanes, straight down each, and across
  // to the next between them: on a laptop a round corner, a straight run
  // across and a round corner back down; on a phone or a tablet one S (and
  // one more out of the mouth into the first lane)
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
    const signs = exitRefs.current.map((exit) => exit?.getBoundingClientRect());
    const exits = signs.map((r) => (r ? r.top + r.height / 2 - box.top : 0));
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    // The street opens at the foot of the approach
    const start = approachRef.current ? approachRef.current.getBoundingClientRect().bottom - box.top : 0;
    const end = box.height - END_GAP;
    const entry = lanes[0];
    // Where it opens. On a laptop that's over the first lane. On a phone or
    // a tablet it's nearer the middle, in a funnel that narrows to the road
    // (the car waits in its neck), and the road sweeps from there into the
    // first lane, all in the room left under the approach
    const neck = wide ? start : start + Math.min(FUNNEL.depth, Math.max(entry.top - start, 0) * FUNNEL.share);
    const middle = box.width / 2 - entry.x;
    const lead = wide ? 0 : Math.sign(middle) * Math.min(Math.abs(middle), (entry.top - neck) * FUNNEL.lean);
    const mouthX = entry.x + lead;

    const points: Point[] = [];
    const pieces: Piece[] = [];
    const bends: Road["bends"] = [];
    // Straight down, the car's line is where the car is
    const walk = (x: number, y: number, v = y) => {
      const last = points[points.length - 1];
      points.push({ x, y, v, at: last ? last.at + Math.hypot(x - last.x, y - last.y) : 0 });
    };
    // Each stretch ends where the next starts
    let piece = `M${mouthX} ${start}`;
    let pieceFrom = 0;
    const cut = () => {
      const last = points[points.length - 1];
      pieces.push({ d: piece, from: pieceFrom, to: last.at });
      piece = `M${last.x} ${last.y}`;
      pieceFrom = last.at;
    };
    let d = `M${mouthX} ${start}`;
    walk(mouthX, start);
    // A phone's or a tablet's S, from one lane to the next, the car on its
    // line all the way: it swings across as the page comes down. It's a
    // stretch of its own, and a bend the car signals for.
    const swing = (x0: number, y0: number, x1: number, y1: number) => {
      bends.push({ from: y0, to: y1, side: Math.sign(x1 - x0) });
      const drop = y1 - y0;
      const c1 = y0 + SWAY * drop;
      const c2 = y1 - SWAY * drop;
      const s = `C${x0} ${c1} ${x1} ${c2} ${x1} ${y1}`;
      d += s;
      piece += s;
      for (let step = 1; step <= 64; step++) {
        const t = step / 64;
        const u = 1 - t;
        walk(
          u ** 3 * x0 + 3 * u * u * t * x0 + 3 * u * t * t * x1 + t ** 3 * x1,
          u ** 3 * y0 + 3 * u * u * t * c1 + 3 * u * t * t * c2 + t ** 3 * y1,
        );
      }
      cut();
    };
    // Out of the mouth: down its neck, where the car waits, then across
    // into the first lane
    if (Math.abs(lead) >= 1 && neck > start) {
      d += `V${neck}`;
      piece += `V${neck}`;
      walk(mouthX, neck);
      cut();
      swing(mouthX, neck, entry.x, entry.top);
    }
    lanes.forEach((lane, i) => {
      if (i === 0) return;
      const from = lanes[i - 1];
      const across = lane.x - from.x;
      d += `V${from.bottom}`;
      piece += `V${from.bottom}`;
      walk(from.x, from.bottom);
      if (Math.abs(across) < 1) return;
      cut();
      if (!wide) {
        swing(from.x, from.bottom, lane.x, lane.top);
        return;
      }
      const side = Math.sign(across);
      bends.push({ from: from.bottom, to: lane.top, side });
      const mid = (from.bottom + lane.top) / 2;
      const r = Math.min(CORNER, (lane.top - from.bottom) / 2, Math.abs(across) / 2);
      // Down to the first corner, round it onto the run across, along, and
      // round the second corner back down to the next lane
      const turn =
        `V${mid - r}A${r} ${r} 0 0 ${side > 0 ? 0 : 1} ${from.x + side * r} ${mid}` +
        `H${lane.x - side * r}A${r} ${r} 0 0 ${side > 0 ? 1 : 0} ${lane.x} ${mid + r}V${lane.top}`;
      d += turn;
      piece += turn;
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
      cut();
    });
    const last = lanes[lanes.length - 1];
    d += `V${end}`;
    piece += `V${end}`;
    walk(last.x, end);
    cut();

    // A phone's or a tablet's slip roads: off the road's edge a little
    // before each exit, curving out to its sign
    const ramps = wide
      ? []
      : signs.map((sign, n) => {
          if (!sign) return "";
          const i = DISTRICTS.findIndex((_, k) => n + 1 < (FIRST_EXIT[k + 1] ?? Infinity));
          const lane = lanes[i];
          const out = sign.left - box.left > lane.x ? 1 : -1;
          const x0 = lane.x + out * 6;
          const x1 = (out > 0 ? sign.left : sign.right) - box.left - out * 4;
          const y1 = exits[n];
          const y0 = y1 - 56;
          return `M${x0} ${y0}C${x0} ${y0 + 36} ${x1 - out * 28} ${y1} ${x1} ${y1}`;
        });

    // The mouth, the cream of the approach narrowing into the road. A
    // laptop's: two round corners. A phone's or a tablet's: a wide funnel,
    // each side one long curve, leaving the approach's edge level and meeting
    // the road upright.
    let mouth: Road["mouth"];
    if (wide) {
      const { radius: r, road: w } = MOUTH;
      mouth = {
        x: mouthX,
        width: 2 * r + w,
        height: r,
        d: `M0 0A${r} ${r} 0 0 1 ${r} ${r}H${r + w}A${r} ${r} 0 0 1 ${2 * r + w} 0Z`,
      };
    } else {
      const half = Math.max(Math.min(FUNNEL.half, mouthX - 16, box.width - mouthX - 16), FUNNEL.road);
      const reach = half - FUNNEL.road / 2;
      const deep = neck - start;
      const far = 2 * half;
      mouth = {
        x: mouthX,
        width: far,
        height: deep,
        d:
          `M0 0C${0.66 * reach} 0 ${reach} ${0.4 * deep} ${reach} ${deep}` +
          `H${far - reach}C${far - reach} ${0.4 * deep} ${far - 0.66 * reach} 0 ${far} 0Z`,
      };
    }

    lightShown.current = [];
    setRoad({
      width: box.width,
      height: box.height,
      d,
      points,
      pieces,
      bends,
      start,
      end,
      mouth,
      districts: lanes.map((lane) => lane.top),
      exits,
      ramps,
    });
    onRoadEnd?.(last.x);
  };

  // The car sits on its line on the screen (its rig is sticky there) while
  // the street runs under it: find where the street is under that line, and
  // steer it there. It waits at the mouth until the page brings the mouth up
  // to its line, and pulls up at the end, both the rig's own doing.
  const drive = () => {
    const section = sectionRef.current;
    const rig = rigRef.current;
    if (!section || !rig || !road) return;
    const line = rig.getBoundingClientRect().top - section.getBoundingClientRect().top;
    const { points } = road;
    let hi = points.findIndex((point) => point.v >= line);
    if (hi <= 0) hi = hi === 0 ? 1 : points.length - 1;
    const a = points[hi - 1];
    const b = points[hi];
    const t = Math.min(Math.max(b.v === a.v ? 0 : (line - a.v) / (b.v - a.v), 0), 1);
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;
    carX.set(x);
    carY.set(y - line);
    // Its nose is drawn pointing down the screen, at 90°
    heading.set((Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI - 90);
    // The light it leaves behind it, stretch by stretch: only the one it's on
    // changes as it goes
    const at = a.at + (b.at - a.at) * t;
    road.pieces.forEach((piece, i) => {
      const shown = Math.round(Math.min(Math.max((at - piece.from) / (piece.to - piece.from), 0), 1) * 1000);
      if (lightShown.current[i] === shown) return;
      lightShown.current[i] = shown;
      lightRefs.current[i]?.style.setProperty("--shown", String(shown));
    });
    // Its indicator, on the way into a bend and round it
    const bend = road.bends.find((b) => line > b.from - SIGNAL && line < b.to - 40);
    const turn = bend ? (bend.side > 0 ? "right" : "left") : null;
    if (carRef.current && carRef.current.dataset.turn !== (turn ?? undefined)) {
      if (turn) carRef.current.dataset.turn = turn;
      else delete carRef.current.dataset.turn;
    }
    setReached(road.districts.filter((top) => top - 120 <= y).length);
    const now = road.exits.filter((exit) => exit <= y).length;
    // A tick as it passes each exit, where the exits come to the car
    if (now > passedRef.current && narrow) tick();
    passedRef.current = now;
    setPassed(now);
  };

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", drive);
  // The street's opening words come up as you scroll: the headline is all in
  // while it's still low on the screen, just risen into view, and the line
  // under it by the time it reaches the car's line
  const { scrollYProgress: openIn } = useScroll({
    target: openingRef,
    offset: ["start 90%", `end ${ANCHOR * 100}%`],
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
  const parked = road ? road.start + PARKED : 0;

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
          {road.ramps.map((ramp, n) =>
            ramp ? (
              <g key={n} className={street.ramp} data-lit={passed > n || undefined}>
                <path d={ramp} />
                <path d={ramp} />
              </g>
            ) : null,
          )}
          <path d={road.d} className={street.turnRoad} strokeLinecap="round" />
          <path d={road.d} className={street.turnLane} />
          {/* The way the car has come, lit behind it like a long exposure */}
          {road.pieces.map((piece, i) => (
            <g
              key={i}
              ref={(el) => {
                lightRefs.current[i] = el;
              }}
              className={street.light}
            >
              <path d={piece.d} pathLength={1000} />
              <path d={piece.d} pathLength={1000} />
            </g>
          ))}
        </svg>
      )}
      {road && (
        <svg
          aria-hidden="true"
          className={street.mouth}
          style={{ left: road.mouth.x, top: road.start }}
          width={road.mouth.width}
          height={road.mouth.height}
        >
          <path d={road.mouth.d} />
        </svg>
      )}

      {/* The approach: the tour's cream runs on a little, and the street's
          opening words come up in it before it opens out */}
      <div ref={approachRef} className={`${styles.approach} px-4 md:px-6`}>
        <header ref={openingRef} className={`${styles.intro} mx-auto w-full max-w-7xl`}>
          <h2 id="street-heading" className={`${styles.heading} max-w-4xl`}>
            <RevealWords text="The world, on one street." progress={openIn} to={0.3} />
          </h2>
          <p className={`${styles.introLine} max-w-[44ch] text-sm md:text-base`}>
            <RevealWords
              text="Four districts, thirteen exits, and your wallet at the end of the road."
              progress={openIn}
              from={0.2}
            />
          </p>
        </header>
      </div>

      <div className={`${styles.inner} mx-auto w-full max-w-7xl px-4 md:px-6`}>
        {DISTRICTS.map((district, i) => {
          const lit = reached > i;
          const pointed = district.exits.some((exit) => exit.name === looking) ? looking : null;
          // Where the exits come to the car, the last one it passed in this
          // district is up on the billboard
          const past = Math.min(Math.max(passed - FIRST_EXIT[i] + 1, 0), district.exits.length);
          const focus = pointed ?? (narrow && past > 0 ? district.exits[past - 1].name : null);
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
                <DistrictBillboard district={district} firstExit={FIRST_EXIT[i]} focus={focus} lit={lit} Art={ART[district.id]} />
              </div>
              <ul className={styles.exits} aria-label={`Exits off ${district.street}`}>
                {district.exits.map((exit, j) => {
                  const number = FIRST_EXIT[i] + j;
                  return (
                    <ExitSign
                      key={exit.name}
                      register={registerExit}
                      exit={exit}
                      number={number}
                      lit={passed >= number}
                      now={narrow && focus === exit.name}
                      onLook={setLooking}
                    />
                  );
                })}
              </ul>
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

      {/* The car's rig: sticky on its line from its parking spot at the
          mouth to the one at the end, so the browser holds it there */}
      {road && (
        <div
          aria-hidden="true"
          className={styles.carTrack}
          style={{ top: parked, height: Math.max(road.end - PULL_UP - parked, 0) }}
        >
          <div ref={rigRef} className={styles.carRig} style={{ top: `${ANCHOR * 100}svh` }}>
            <StreetCar ref={carRef} style={{ x: carX, y: carY, rotate: carAngle }} />
          </div>
        </div>
      )}
    </section>
  );
}
