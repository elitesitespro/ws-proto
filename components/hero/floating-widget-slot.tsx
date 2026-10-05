"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "cn";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";
import { gentleGlideCubicEase } from "@/lib/motion-presets";
import type { FloatingSlotConfig, SlotPlacement } from "./hero-widget-layout";
import styles from "./floating-widget-slot.module.css";

type SlotCssStyle = CSSProperties & {
  [key: `--slot-${string}`]: string | number | undefined;
};

// Scale the entire widget proportionally: 16px text becomes 14px.
const widgetScale = 14 / 16;

type FloatingWidgetSlotProps = {
  config: FloatingSlotConfig;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  scrollProgress?: MotionValue<number>;
  animation?: { enabled?: boolean; delay?: number; duration?: number };
};

function length(value: string | number | undefined, fallback: string) {
  return typeof value === "number" ? `${value}px` : (value ?? fallback);
}

function placementVariables(
  name: "desktop" | "large" | "tablet" | "mobile",
  placement?: SlotPlacement,
): SlotCssStyle {
  return {
    [`--slot-${name}-x`]: length(placement?.x, "0px"),
    [`--slot-${name}-y`]: length(placement?.y, "0px"),
    [`--slot-${name}-width`]: length(placement?.width, "auto"),
    [`--slot-${name}-max-width`]: length(placement?.maxWidth, "none"),
    [`--slot-${name}-rotation`]: `${placement?.rotation ?? 0}deg`,
    [`--slot-${name}-scale`]: (placement?.scale ?? 1) * widgetScale,
    [`--slot-${name}-z`]: placement?.zIndex ?? 1,
  };
}

export function FloatingWidgetSlot({
  config,
  children,
  className,
  style,
  scrollProgress,
  animation,
}: FloatingWidgetSlotProps) {
  const fallbackProgress = useMotionValue(0);
  const reduceMotion = useReducedMotion();
  const displacement = reduceMotion
    ? 0
    : Math.max(-70, Math.min(70, (config.parallax ?? 0) * 320));
  const parallaxY = useTransform(
    scrollProgress ?? fallbackProgress,
    [0, 1],
    [0, displacement],
  );
  const animateEntrance = animation?.enabled !== false && !reduceMotion;

  const slotStyle: SlotCssStyle = {
    ...placementVariables("desktop", config.desktop),
    ...placementVariables("large", config.large),
    ...placementVariables("tablet", config.tablet),
    ...placementVariables("mobile", config.mobile),
    ...style,
  };

  return (
    <div
      data-slot-id={config.id}
      data-large-visible={Boolean(config.large)}
      data-tablet-visible={Boolean(config.tablet)}
      data-mobile-visible={Boolean(config.mobile)}
      className={cn(styles.slot, config.className, className)}
      style={slotStyle}
    >
      <motion.div className={styles.parallax} style={{ y: parallaxY }}>
        <motion.div
          className={styles.entrance}
          initial={animateEntrance ? { opacity: 0, y: 24, scale: 0.96 } : false}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: animateEntrance ? (animation?.duration ?? 0.9) : 0,
            delay: animateEntrance ? (animation?.delay ?? 0) : 0,
            ease: gentleGlideCubicEase,
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
