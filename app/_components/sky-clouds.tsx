"use client";

import Image from "next/image";
import { memo, useState, useSyncExternalStore } from "react";
import { motion, useTransform, type MotionStyle, type MotionValue } from "motion/react";
import styles from "./sky-clouds.module.css";

// The clouds (public/assets/sky): photoreal cumulus, keyed off black, so
// their shaded parts let the sky through as a real cloud's do. A phone takes
// `small`, the same cloud at most 800px wide as AVIF: about a quarter of the
// bytes, for a slow connection (a browser without AVIF takes the full one).
const SPRITES = {
  tall: { src: "/assets/sky/cloud-tall.webp", small: "/assets/sky/cloud-tall-sm.avif", width: 1200, height: 582 },
  bank: { src: "/assets/sky/cloud-bank.webp", small: "/assets/sky/cloud-bank-sm.avif", width: 1245, height: 335 },
  puff: { src: "/assets/sky/cloud-puff.webp", small: "/assets/sky/cloud-puff-sm.avif", width: 728, height: 511 },
  wisp: { src: "/assets/sky/cloud-wisp.webp", small: "/assets/sky/cloud-wisp-sm.avif", width: 1171, height: 183 },
} as const;
type Kind = keyof typeof SPRITES;
// Below the globe's own phone size (night-globe.tsx), where the smaller day images are taken too
const PHONE = "(max-width: 767px)";
// The order the page wants them in: the break-out bank's, then the wisp of the sky after it
const ORDER: readonly Kind[] = ["tall", "bank", "puff", "wisp"];

// The pictures fetched and decoded ahead of time, by kind; held, so they
// stay decoded in memory until a cloud shows them. Clouds already on the
// page hear as each comes in.
const ready = new Map<Kind, HTMLImageElement>();
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};
let preloading = false;

/**
 * Fetches and decodes every cloud picture ahead of the page's need, one
 * after another in the order it wants them, so on a slow connection the
 * first is in as soon as it can be rather than all four arriving late
 * together. Call it once the page's first screen has what it needs; again
 * does nothing.
 */
export function preloadSkyClouds() {
  if (preloading) return;
  preloading = true;
  // What the cloud's <picture> will pick, so it's the same request
  let small = window.matchMedia(PHONE).matches;
  const fetchOne = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image();
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  const run = async () => {
    for (const kind of ORDER) {
      const sprite = SPRITES[kind];
      let img: HTMLImageElement | null = null;
      if (small) {
        img = await fetchOne(sprite.small).catch(() => {
          // No AVIF here: the <picture> falls back to the full picture too
          small = false;
          return null;
        });
      }
      img ??= await fetchOne(sprite.src).catch(() => null);
      // Gone missing: the cloud loads it itself when near, and fades in if it comes
      if (!img) continue;
      // Decoded while the next one downloads
      const decoded = img;
      void decoded
        .decode()
        .catch(() => {})
        .then(() => {
          ready.set(kind, decoded);
          for (const listener of listeners) listener();
        });
    }
  };
  // Once the page is idle, so the hero's own work comes first (Safari has
  // no requestIdleCallback: a moment's wait instead)
  if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(() => void run(), { timeout: 1000 });
  else setTimeout(() => void run(), 200);
}

export type Cloud = {
  kind: Kind;
  /** Where its middle starts, as a share of the layer across and down (%). */
  x: number;
  y: number;
  /** How wide it is, in hundredths of the screen (of its height, where that's more: a phone's). */
  w: number;
  /** How far it travels over the whole of `progress`, in screen widths and heights (vw, vh); up is negative. */
  dx?: number;
  dy?: number;
  /** How much it grows over `progress` (1 doubles it). */
  grow?: number;
  /** Mirrored, so one picture makes two clouds. */
  flip?: boolean;
  opacity?: number;
  /** Over this part of `progress` it thins away. */
  fade?: readonly [number, number];
};

/**
 * Clouds in the sky, each drifting with `progress` (scrolling): up past
 * you as you come down through them, outwards as you break through a bank
 * of them, the near ones faster and growing. Only transforms move, so it's
 * cheap on a phone. Until its picture is in, each is a soft white haze of
 * its size, so on a slow connection the sky still reads as cloud, and the
 * picture fades in over it once decoded instead of popping in (or drawing
 * down in strips). `eager` fetches the pictures at once, for a layer
 * mounted just before it's seen; otherwise they wait until it nears the
 * screen, or the preload has them.
 */
// Memoised: the sections it's in render again as they scroll (the dial at each platform), its clouds needn't
export const SkyClouds = memo(function SkyClouds({
  clouds,
  progress,
  eager = false,
  className,
}: {
  clouds: readonly Cloud[];
  progress: MotionValue<number>;
  eager?: boolean;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={`${styles.layer} ${className ?? ""}`}>
      {clouds.map((cloud, index) => (
        <Drift key={index} cloud={cloud} progress={progress} eager={eager} />
      ))}
    </div>
  );
});

function Drift({ cloud, progress, eager }: { cloud: Cloud; progress: MotionValue<number>; eager: boolean }) {
  const { dx = 0, dy = 0, grow = 0, flip = false, opacity = 1, fade } = cloud;
  const transform = useTransform(progress, (p) => {
    const scale = 1 + grow * p;
    return `translate(-50%, -50%) translate(${(dx * p).toFixed(2)}vw, ${(dy * p).toFixed(2)}vh) scale(${(flip ? -scale : scale).toFixed(3)}, ${scale.toFixed(3)})`;
  });
  const shown = useTransform(progress, (p) =>
    fade ? opacity * (1 - Math.min(Math.max((p - fade[0]) / (fade[1] - fade[0]), 0), 1)) : opacity,
  );
  const sprite = SPRITES[cloud.kind];
  // Once preloaded the picture is in memory: a cloud mounted after shows it
  // at once, and one waiting to near the screen takes it now (off screen,
  // so its fade-in is never seen). (Never so while the page hydrates: the
  // preload starts after.)
  const preloaded = useSyncExternalStore(subscribe, () => ready.has(cloud.kind), () => false);
  const [decoded, setDecoded] = useState(() => ready.has(cloud.kind));
  return (
    <motion.div
      className={styles.cloud}
      data-kind={cloud.kind}
      data-decoded={decoded || undefined}
      style={{ left: `${cloud.x}%`, top: `${cloud.y}%`, "--w": cloud.w, transform, opacity: shown } as MotionStyle}
    >
      <picture>
        <source type="image/avif" media={PHONE} srcSet={sprite.small} />
        <Image
          src={sprite.src}
          width={sprite.width}
          height={sprite.height}
          alt=""
          unoptimized
          loading={eager || preloaded ? "eager" : "lazy"}
          // next/image calls this once the picture is decoded, even if it loaded before hydration
          onLoad={() => setDecoded(true)}
          draggable={false}
        />
      </picture>
    </motion.div>
  );
}
