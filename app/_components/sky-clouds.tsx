"use client";

import Image from "next/image";
import { motion, useTransform, type MotionStyle, type MotionValue } from "motion/react";
import styles from "./sky-clouds.module.css";

// The clouds (public/assets/sky): photoreal cumulus, keyed off black, so
// their shaded parts let the sky through as a real cloud's do
const SPRITES = {
  tall: { src: "/assets/sky/cloud-tall.webp", width: 1200, height: 582 },
  bank: { src: "/assets/sky/cloud-bank.webp", width: 1245, height: 335 },
  puff: { src: "/assets/sky/cloud-puff.webp", width: 728, height: 511 },
  wisp: { src: "/assets/sky/cloud-wisp.webp", width: 1171, height: 183 },
} as const;

export type Cloud = {
  kind: keyof typeof SPRITES;
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
 * cheap on a phone.
 */
export function SkyClouds({
  clouds,
  progress,
  className,
}: {
  clouds: readonly Cloud[];
  progress: MotionValue<number>;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={`${styles.layer} ${className ?? ""}`}>
      {clouds.map((cloud, index) => (
        <Drift key={index} cloud={cloud} progress={progress} />
      ))}
    </div>
  );
}

function Drift({ cloud, progress }: { cloud: Cloud; progress: MotionValue<number> }) {
  const { dx = 0, dy = 0, grow = 0, flip = false, opacity = 1, fade } = cloud;
  const transform = useTransform(progress, (p) => {
    const scale = 1 + grow * p;
    return `translate(-50%, -50%) translate(${(dx * p).toFixed(2)}vw, ${(dy * p).toFixed(2)}vh) scale(${(flip ? -scale : scale).toFixed(3)}, ${scale.toFixed(3)})`;
  });
  const shown = useTransform(progress, (p) =>
    fade ? opacity * (1 - Math.min(Math.max((p - fade[0]) / (fade[1] - fade[0]), 0), 1)) : opacity,
  );
  const sprite = SPRITES[cloud.kind];
  return (
    <motion.div
      className={styles.cloud}
      style={{ left: `${cloud.x}%`, top: `${cloud.y}%`, "--w": cloud.w, transform, opacity: shown } as MotionStyle}
    >
      <Image src={sprite.src} width={sprite.width} height={sprite.height} alt="" unoptimized draggable={false} />
    </motion.div>
  );
}
