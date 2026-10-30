"use client";

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { cn } from "cn";
import { Icon } from "@/components/icon";
import type { LatLon, NightGlobeHandle, ProjectedPoint } from "@/components/globe/night-globe";
import { hueAttrs, platformDetails, type ShowcasePlatformName } from "@/app/_components/platform-showcase-content";
import { PIN_CITIES, PLATFORM_PINS, type PinCard, type PinCity, type PinSet } from "./globe-pins-content";
import { PinCardBody, type PinLive } from "./globe-pin-cards";
import { visitorPlace } from "./visitor-place";
import styles from "./globe-pins.module.css";

const STEM = 40; // the stem's height, as in the CSS
// On a phone: a shorter stem, and the cards drawn this much smaller (the CSS too)
const PHONE_STEM = 28;
const PHONE_SCALE = 0.84;
const CARD_LEFT = 14; // how far the card starts left of its city
const TOP = 96; // clear of the header
const EDGE = 16;
// How long a set of cards stays up at most, in seconds (the word's rest and
// shuffle, and the flight out, with some to spare): cards only go to cities
// that will still be well in view and on screen by then, as the globe turns
const LIFE = 9;
const LEAVE_MS = 200;
const WATCH_MS = 1500; // how often the cards are checked on, in case the globe's carried them all away
const TICK_MS = 1000; // a beat: one card's figure moves, and every round's clock runs down a second
const HISTORY = 24; // prices kept for a sparkline
// Where cards fly out from when the visitor's place isn't known: WorldStreet's hub, Lagos
const HUB: LatLon = [6.52, 3.38];

type Rect = { left: number; top: number; right: number; bottom: number };
type Live = PinLive & {
  key: string;
  city: PinCity;
  card: PinCard;
  /** When the pin opens, in ms: as its arc lands. */
  delay: number;
};

const overlaps = (a: Rect, b: Rect) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
const grow = (r: Rect, by: number): Rect => ({ left: r.left - by, top: r.top - by, right: r.right + by, bottom: r.bottom + by });
/** A card over its city. On a phone (`screen`, the layer's width) it's
 *  smaller, on a shorter stem, and centred over the city as far as the
 *  screen's edges allow; it keeps so as the globe turns (globe-pins.module.css),
 *  so the globe needn't carry it clear. */
const cardAt = (p: ProjectedPoint, size: PinSet["size"], screen?: number): Rect => {
  if (screen === undefined) {
    return { left: p.x - CARD_LEFT, right: p.x - CARD_LEFT + size.w, top: p.y - STEM - size.h, bottom: p.y - STEM };
  }
  const centre = Math.min(Math.max(p.x - size.w / 2, EDGE), screen - EDGE - size.w) + size.w / 2;
  const w = size.w * PHONE_SCALE;
  const h = size.h * PHONE_SCALE;
  return { left: centre - w / 2, right: centre + w / 2, top: p.y - PHONE_STEM - h, bottom: p.y - PHONE_STEM };
};
// The beacon and stem below a card
const stemAt = (p: ProjectedPoint, stem = STEM): Rect => ({ left: p.x - 12, right: p.x + 12, top: p.y - stem, bottom: p.y + 12 });

/** The copy's own footprint, from its children: its column spans the full
 *  width. On a phone its parts sit at the top and the foot of the screen, with
 *  the planet between, so each line in them is kept clear of on its own (not
 *  the floor the buttons sit on). */
function footprint(column: HTMLElement, box: DOMRect, apart: boolean): Rect[] {
  const parts: Rect[] = [];
  const pieces = apart
    ? [...column.children].flatMap((part) => (part.children.length ? [...part.children] : [part]))
    : [...column.children];
  for (const child of pieces) {
    const c = child.getBoundingClientRect();
    if (!c.width) continue;
    parts.push({ left: c.left - box.left, top: c.top - box.top, right: c.right - box.left, bottom: c.bottom - box.top });
  }
  if (apart || !parts.length) return parts.map((r) => grow(r, 16));
  const r = parts.reduce((a, b) => ({
    left: Math.min(a.left, b.left),
    top: Math.min(a.top, b.top),
    right: Math.max(a.right, b.right),
    bottom: Math.max(a.bottom, b.bottom),
  }));
  return [grow(r, 32)];
}

/** Cities facing the viewer whose cards fit on screen clear of the copy and
 *  of each other, now and for as long as the cards are up, or null while the
 *  planet isn't showing yet. */
function choose(
  globe: NightGlobeHandle,
  layer: HTMLElement,
  copy: HTMLElement | null,
  count: number,
  size: PinSet["size"],
  avoid: ReadonlySet<string>
): PinCity[] | null {
  const box = layer.getBoundingClientRect();
  const phone = box.width < 768;
  const stem = phone ? PHONE_STEM : STEM;
  const shield = copy ? footprint(copy, box, phone) : [];
  // A card over its city at a moment: on screen, and clear of the copy
  const clear = (p: ProjectedPoint, card: Rect) => {
    const across = phone
      ? p.x > EDGE * 2 && p.x < box.width - EDGE * 2 && size.w <= box.width - EDGE * 2
      : card.left >= EDGE && card.right <= box.width - EDGE;
    if (!across || card.top < TOP || p.y > box.height - 32) return false;
    return !shield.some((part) => overlaps(card, part) || overlaps(stemAt(p, stem), part));
  };
  const options: { city: PinCity; p: ProjectedPoint; card: Rect; then: Rect; score: number }[] = [];
  for (const city of PIN_CITIES) {
    const p = globe.project(city.lat, city.lon);
    // Where the globe will have carried it by the time the cards go
    const later = globe.project(city.lat, city.lon, LIFE);
    if (!p || !later) return null;
    if (p.front < 0.3 || later.front < 0.4) continue;
    const card = cardAt(p, size, phone ? box.width : undefined);
    const then = cardAt(later, size, phone ? box.width : undefined);
    if (!clear(p, card) || !clear(later, then)) continue;
    // Facing the viewer the whole time counts most; a little chance keeps the
    // picks varied, and the last word's cities step aside when there are others
    const facing = Math.min(p.front, later.front);
    options.push({ city, p, card, then, score: facing + Math.random() * 0.35 - (avoid.has(city.name) ? 1 : 0) });
  }
  options.sort((a, b) => b.score - a.score);
  const chosen: typeof options = [];
  for (const o of options) {
    if (chosen.length === count) break;
    const clashes = chosen.some(
      (c) =>
        overlaps(grow(c.card, 12), o.card) ||
        overlaps(grow(c.then, 12), o.then) ||
        overlaps(c.card, stemAt(o.p, stem)) ||
        overlaps(o.card, stemAt(c.p, stem))
    );
    if (!clashes) chosen.push(o);
  }
  // Top to bottom, so the pins arrive down the globe
  return chosen.sort((a, b) => a.p.y - b.p.y).map((o) => o.city);
}

/** A card's live state to begin with. A price gets a made-up recent past that
 *  leads to it, leaning the way its change says. */
function begin(card: PinCard): PinLive {
  const base: PinLive = { value: 0, change: 0, history: [], scores: [], seconds: 0, tick: 0, up: true };
  switch (card.kind) {
    case "rate":
    case "coin": {
      const history = [card.value];
      const lean = Math.sign(card.change) * card.step * 0.45;
      for (let i = 1; i < HISTORY; i++) history.unshift(history[0] - lean - (Math.random() * 2 - 1) * card.step * 1.6);
      return { ...base, value: card.value, change: card.change, history };
    }
    case "live":
      return { ...base, value: card.viewers };
    case "chat":
      return { ...base, value: card.online };
    case "match":
      return { ...base, value: card.playing, scores: card.leaders.map((l) => l.score), seconds: card.seconds };
    case "product":
      return { ...base, value: card.sold };
    case "course":
      return { ...base, value: card.learners };
  }
}

/** One beat for a card: a price moves either way, people come and go, sales and scores climb. */
function step(pin: Live): Live {
  const card = pin.card;
  const next = { tick: pin.tick + 1 };
  if (card.kind === "rate" || card.kind === "coin") {
    const move = (Math.random() * 2 - 1) * card.step;
    const value = pin.value + move;
    return { ...pin, ...next, value, change: pin.change + (move / pin.value) * 100, history: [...pin.history.slice(1), value], up: move >= 0 };
  }
  if (card.kind === "match") {
    // Someone scores (the card pops their points); a few join or leave
    const scores = [...pin.scores];
    const slot = Math.floor(Math.random() * scores.length);
    const by = 5 * (2 + Math.floor(Math.random() * 11));
    scores[slot] += by;
    return { ...pin, ...next, scores, gain: { slot, by }, value: Math.max(1, pin.value + Math.round(Math.random() * 6 - 2)), up: true };
  }
  if (card.kind === "product") {
    const move = Math.floor(Math.random() * 3);
    return move ? { ...pin, ...next, value: pin.value + move, up: true } : pin;
  }
  const move = Math.round(Math.random() * 7 - 2) * (pin.value > 1000 ? 2 : 1);
  return move ? { ...pin, ...next, value: Math.max(1, pin.value + move), up: move > 0 } : pin;
}

type GlobePinsProps = {
  /** The platform the headline is on; its cards are pinned to the globe. */
  platform?: ShowcasePlatformName;
  globe: RefObject<NightGlobeHandle | null>;
  /** The layer the globe moves pins in: pass the same ref to NightGlobe's `pins`. */
  layer: RefObject<HTMLDivElement | null>;
  /** The hero copy, which pins keep clear of. */
  copy: RefObject<HTMLElement | null>;
  /** True while a pin is under the pointer or has focus. */
  onHoldChange?: (held: boolean) => void;
  /** Called once, when the first set of cards has landed (or the globe
   *  never showed and they gave up). */
  onLanded?: () => void;
  /** Fades every card back, e.g. while a city's card is open. */
  dimmed?: boolean;
  /** The hero's been scrolled away: no new sets go out on their own. */
  quiet?: boolean;
};

/**
 * Live cards for the current platform, pinned to cities on the globe: each
 * kind illustrates what the platform does (a rate with its sparkline, a live
 * stream, a group chat, a round's leaderboard...), and each is a link to the
 * platform. They ride with the globe as it turns and fade out towards the
 * limb; a new word swaps them for another set.
 * First, the globe turns to the visitor's side of the world; every set of
 * cards then flies out from their place on gold arcs, each opening where its
 * arc lands.
 */
export function GlobePins({
  platform,
  globe,
  layer,
  copy,
  onHoldChange,
  onLanded,
  dimmed = false,
  quiet = false,
}: GlobePinsProps) {
  const [pins, setPins] = useState<Live[]>([]);
  // Bumped to send out a fresh set for the same word
  const [round, setRound] = useState(0);
  const pinsRef = useRef<Live[]>([]);
  // The card under the pointer or with focus: its thread lights, the rest fade back
  const [focused, setFocused] = useState<string | null>(null);
  const [shownFor, setShownFor] = useState<ShowcasePlatformName>();
  const [leaving, setLeaving] = useState(false);
  const lastCities = useRef<ReadonlySet<string>>(new Set());
  const held = useRef({ hover: false, focus: false });
  // The visitor's place: undefined until looked up, null if it can't be told
  const visitor = useRef<LatLon | null | undefined>(undefined);
  const landed = useRef(false);
  const onLandedRef = useRef(onLanded);

  useEffect(() => {
    onLandedRef.current = onLanded;
  }, [onLanded]);

  const land = (afterMs: number) => {
    if (landed.current) return;
    landed.current = true;
    window.setTimeout(() => onLandedRef.current?.(), afterMs);
  };

  const hold = (part: "hover" | "focus", on: boolean) => {
    held.current[part] = on;
    onHoldChange?.(held.current.hover || held.current.focus);
  };

  // Follow the thread: the focused card's flight runs again from the visitor's
  // place out to it, and the city lights are held down while it has focus
  const focus = (pin: Live | null) => {
    setFocused(pin?.key ?? null);
    const g = globe.current;
    if (!g) return;
    g.dim(pin ? 1 : 0);
    if (pin) g.launch(visitor.current ?? HUB, [[pin.city.lat, pin.city.lon]], { delay: 0 });
  };

  // A new word: the old pins step out, then the new set lands on cities facing the viewer
  useEffect(() => {
    const set = platform && PLATFORM_PINS[platform];
    if (!platform || !set) return;
    let timer = 0;
    let tries = 0;
    const place = () => {
      const g = globe.current;
      const l = layer.current;
      if (g && visitor.current === undefined) {
        // The first time: find the visitor, and turn the globe to them
        visitor.current = visitorPlace();
        if (visitor.current) g.turnTo(visitor.current);
      }
      const count = Math.min(set.cards.length, set.count, l && l.clientWidth < 768 ? 2 : set.count);
      const cities = g && l ? choose(g, l, copy.current, count, set.size, lastCities.current) : null;
      if (!g || !cities) {
        if (tries++ < 40) timer = window.setTimeout(place, 250);
        else land(0);
        return;
      }
      // Each card flies out from the visitor's place (or the hub) and opens where it lands
      const arrivals = g.launch(
        visitor.current ?? HUB,
        cities.map((city) => [city.lat, city.lon] as const),
        { delay: 0.05, stagger: 0.16 }
      );
      // The last card opens 0.7s after its arc lands
      land(Math.max(0, ...arrivals) * 1000 + 700);
      lastCities.current = new Set(cities.map((c) => c.name));
      held.current = { hover: false, focus: false };
      onHoldChange?.(false);
      setFocused(null);
      g.dim(0);
      setShownFor(platform);
      setPins(
        cities.map((city, i) => ({
          ...begin(set.cards[i]),
          key: `${platform}-${city.name}`,
          city,
          card: set.cards[i],
          delay: Math.round(arrivals[i] * 1000),
        }))
      );
      setLeaving(false);
    };
    timer = window.setTimeout(() => {
      setLeaving(true);
      timer = window.setTimeout(place, LEAVE_MS);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [platform, round, globe, layer, copy, onHoldChange]);

  // A set's cities can still go: a hand spins the globe, or none fitted when
  // it went out (the planet facing open ocean). Once they've all turned away
  // or off the screen, a fresh set goes out to cities in view now.
  useEffect(() => {
    pinsRef.current = pins;
  }, [pins]);
  useEffect(() => {
    if (!platform || quiet) return;
    const timer = window.setInterval(() => {
      const g = globe.current;
      const l = layer.current;
      if (!g || !l || !landed.current || held.current.hover || held.current.focus || document.hidden) return;
      const gone = pinsRef.current.every((pin) => {
        const p = g.project(pin.city.lat, pin.city.lon);
        return p !== null && (p.front < 0.25 || p.x < 0 || p.x > l.clientWidth);
      });
      if (gone) setRound((n) => n + 1);
    }, WATCH_MS);
    return () => window.clearInterval(timer);
  }, [platform, quiet, globe, layer]);

  // The beat: one card's figure moves, and every round's clock runs down (a new round at zero)
  useEffect(() => {
    if (!pins.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setPins((list) => {
        const i = Math.floor(Math.random() * list.length);
        return list.map((pin, j) => {
          const moved = j === i ? step(pin) : pin;
          return moved.card.kind === "match" ? { ...moved, seconds: moved.seconds > 0 ? moved.seconds - 1 : 60 } : moved;
        });
      });
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [pins.length]);

  const set = shownFor && PLATFORM_PINS[shownFor];

  return (
    <div ref={layer} className="pointer-events-none absolute inset-0 z-[5]">
      {shownFor &&
        set &&
        pins.map((pin) => {
          const detail = platformDetails[shownFor];
          const href = detail.href ?? undefined;
          const external = !!href?.startsWith("https");
          const hue = hueAttrs(shownFor);
          return (
            <div key={pin.key} data-lat={pin.city.lat} data-lon={pin.city.lon} className={styles.anchor}>
              <div
                data-hue={hue["data-hue"]}
                data-leaving={leaving}
                data-dimmed={dimmed || (focused !== null && focused !== pin.key)}
                style={{ ...hue.style, "--delay": `${pin.delay}ms`, "--card-w": `${set.size.w}px` } as CSSProperties}
                className={styles.pin}
              >
                <span className={styles.dot} />
                <span className={styles.stem} />
                <a
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer" : undefined}
                  className={cn("cx-liquid cx-liquid--interactive", styles.card)}
                  onPointerEnter={() => {
                    hold("hover", true);
                    focus(pin);
                  }}
                  onPointerLeave={() => {
                    hold("hover", false);
                    focus(null);
                  }}
                  onFocus={() => {
                    hold("focus", true);
                    focus(pin);
                  }}
                  onBlur={() => {
                    hold("focus", false);
                    focus(null);
                  }}
                >
                  <span className={styles.accent} />
                  <PinCardBody card={pin.card} live={pin} city={pin.city.name} icon={set.icon} />
                  <Icon name="arrow-up-right" size={16} className={cn("text-current", styles.go)} />
                  <span className="sr-only">Open {shownFor}</span>
                </a>
              </div>
            </div>
          );
        })}
    </div>
  );
}
