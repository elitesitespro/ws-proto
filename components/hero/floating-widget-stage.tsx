"use client";

import { useRef, useState, type ReactNode } from "react";
import { useInView, useScroll } from "motion/react";
import { Button } from "@/components/ui/button";
import { FloatingWidgetSlot } from "./floating-widget-slot";
import type { FloatingSlotConfig } from "./hero-widget-layout";
import styles from "./floating-widget-slot.module.css";
import activity from "./widget-activity.module.css";
import { WidgetMotionContext } from "./widget-motion-context";

type FloatingWidgetStageProps = {
  content: Readonly<Record<string, ReactNode>>;
  layout: readonly FloatingSlotConfig[];
};

export function FloatingWidgetStage({
  content,
  layout,
}: FloatingWidgetStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef);
  const [paused, setPaused] = useState(false);
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end start"],
  });

  return (
    <WidgetMotionContext.Provider value={inView && !paused}>
      <div ref={stageRef} className={`${styles.stage} ${activity.activity}`} data-playing={inView && !paused}>
        {layout.map((slot, index) => {
          const widget = content[slot.id];
          if (widget === undefined || widget === null) return null;

          return (
            <FloatingWidgetSlot
              key={slot.id}
              config={slot}
              scrollProgress={scrollYProgress}
              animation={{ delay: 0.08 * index }}
            >
              {widget}
            </FloatingWidgetSlot>
          );
        })}
        <Button
          variant="ghost"
          size="sm"
          className={`${activity.toggle} pointer-events-auto absolute right-2 bottom-1 z-20 text-white/70 hover:bg-white/10 hover:text-white`}
          onClick={() => setPaused((value) => !value)}
          aria-pressed={paused}
          aria-label="Pause widget animations"
        >
          {paused ? "Resume animations" : "Pause animations"}
        </Button>
      </div>
    </WidgetMotionContext.Provider>
  );
}
