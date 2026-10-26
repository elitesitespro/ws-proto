"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { cn } from "cn";
import { Icon, type IconName } from "@/components/icon";
import type { LatLon, NightGlobeHandle } from "@/components/globe/night-globe";
import { hueAttrs, platformDetails, type ShowcasePlatformName } from "@/app/_components/platform-showcase-content";
import { PIN_CITIES, type PinCity } from "./globe-pins-content";
import styles from "./globe-city.module.css";

// How close (in degrees round the globe) the pointer must be to a city to pick it
const REACH = 2.6;
const CARD_W = 288;

/** The pin city nearest a place, if one is within reach. */
function nearestCity([lat, lon]: LatLon): PinCity | null {
  const rad = Math.PI / 180;
  let best: PinCity | null = null;
  let bestAngle = REACH * rad;
  for (const city of PIN_CITIES) {
    // The angle between the two points, seen from the centre of the Earth
    const cos =
      Math.sin(lat * rad) * Math.sin(city.lat * rad) +
      Math.cos(lat * rad) * Math.cos(city.lat * rad) * Math.cos((lon - city.lon) * rad);
    const angle = Math.acos(Math.min(1, Math.max(-1, cos)));
    if (angle < bestAngle) {
      best = city;
      bestAngle = angle;
    }
  }
  return best;
}

/**
 * Tap a city: the pointer's state for the globe's cities. Spread `globeProps`
 * on NightGlobe; hovering a lit city names it, a tap opens its card, a tap on
 * open planet closes it.
 */
export function useGlobeCity() {
  const [hovered, setHovered] = useState<PinCity | null>(null);
  const [open, setOpen] = useState<PinCity | null>(null);
  const onHoverPlace = useCallback((place: LatLon | null) => setHovered(place ? nearestCity(place) : null), []);
  const tappable = useCallback((place: LatLon) => nearestCity(place) !== null, []);
  const onTapPlace = useCallback((place: LatLon) => setOpen(nearestCity(place)), []);
  const close = useCallback(() => setOpen(null), []);
  return { hovered, open, close, globeProps: { onHoverPlace, onTapPlace, tappable } };
}

// What a city's card lists, one line per platform. The figures are made up,
// but steady for each city (seeded from its name), so a city reads the same
// each time it's opened.
const LINES: { platform: ShowcasePlatformName; label: string; icon: IconName; range: readonly [number, number]; say: (n: string) => string }[] = [
  { platform: "XStream", label: "Xtream", icon: "live", range: [2, 24], say: (n) => `${n} streams live` },
  { platform: "WorldSpace", label: "WorldSpace", icon: "users", range: [180, 2400], say: (n) => `${n} people chatting` },
  { platform: "Arcade", label: "Arcade", icon: "gamepad", range: [40, 900], say: (n) => `${n} playing trivia` },
  { platform: "WorldStore", label: "WorldStore", icon: "shopping-bag", range: [6, 140], say: (n) => `${n} new listings today` },
  { platform: "Academy", label: "Mastery Academy", icon: "graduation", range: [60, 1800], say: (n) => `${n} learning now` },
];

/** A number from 0 to 1 that's always the same for the same text. */
function seeded(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

type GlobeCityLayerProps = {
  /** This layer: pass the same ref to NightGlobe's `pins`, so it moves its anchors. */
  layer: RefObject<HTMLDivElement | null>;
  globe: RefObject<NightGlobeHandle | null>;
  hovered: PinCity | null;
  open: PinCity | null;
  onClose: () => void;
};

/** The hovered city's name, and the open city's card, pinned to them on the globe. */
export function GlobeCityLayer({ layer, globe, hovered, open, onClose }: GlobeCityLayerProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // The globe's lights are held down while a card is open, and Escape closes it
  useEffect(() => {
    globe.current?.dim(open ? 1 : 0);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, globe, onClose]);

  // The card opens on whichever side of the city has room, nudged up or down to stay on screen
  useLayoutEffect(() => {
    const card = cardRef.current;
    const box = layer.current;
    const p = open && globe.current?.project(open.lat, open.lon);
    if (!card || !box || !p) return;
    card.dataset.side = p.x + 20 + CARD_W > box.clientWidth - 16 ? "left" : "right";
    const top = p.y - 48;
    const shift = Math.min(0, box.clientHeight - 16 - (top + card.offsetHeight)) + Math.max(0, 96 - top);
    card.style.setProperty("--shift", `${shift}px`);
  }, [open, globe, layer]);

  return (
    <div ref={layer} className="pointer-events-none absolute inset-0 z-[6]">
      {hovered && hovered !== open && (
        <div data-lat={hovered.lat} data-lon={hovered.lon} className={styles.anchor} aria-hidden="true">
          <span className={styles.ring} />
          <span className={cn("cx-liquid cx-liquid--pill", styles.name)}>{hovered.name}</span>
        </div>
      )}
      {open && (
        <div key={open.name} data-lat={open.lat} data-lon={open.lon} className={styles.anchor}>
          <span className={styles.ring} />
          <div
            ref={cardRef}
            role="dialog"
            aria-label={`${open.name} right now`}
            className={cn("cx-liquid", styles.card)}
          >
            <div className="flex items-center gap-1 px-2 pt-2 pb-1">
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm leading-[24px] font-medium">{open.name}</span>
                <span className="flex items-center gap-[6px] text-xs leading-[20px] text-[var(--cx-glass-text-2)]">
                  <span className="size-[6px] rounded-full bg-credit" />
                  Right now on WorldStreet
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={`Close ${open.name}`}
                className="grid size-4 shrink-0 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              >
                <Icon name="close" size={16} tone="current" className="text-[var(--cx-glass-text)]" />
              </button>
            </div>
            <ul className="flex flex-col p-1 pt-0">
              {LINES.map((line) => {
                const detail = platformDetails[line.platform];
                const external = detail.href.startsWith("https");
                const hue = hueAttrs(line.platform);
                const [lo, hi] = line.range;
                const n = Math.round(lo + seeded(`${open.name}:${line.platform}`) * (hi - lo));
                return (
                  <li key={line.platform}>
                    <a
                      href={detail.href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noreferrer" : undefined}
                      {...hue}
                      className="group flex items-center gap-1.5 rounded-md px-1 py-[6px] transition-colors hover:bg-white/[.06]"
                    >
                      <span className="grid size-[28px] shrink-0 place-items-center rounded-sm bg-[var(--hue)]">
                        <Icon name={line.icon} size={17} tone="current" className="text-[var(--hue-on)]" />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-xs leading-[20px] text-[var(--cx-glass-text)]">
                          {line.say(n.toLocaleString("en-US"))}
                        </span>
                        <span className="text-xs leading-[16px] text-[var(--cx-glass-text-2)]">{line.label}</span>
                      </span>
                      <Icon
                        name="arrow-up-right"
                        size={14}
                        tone="current"
                        className="text-[var(--cx-glass-text-2)] transition-colors group-hover:text-[var(--hue-ink)]"
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
