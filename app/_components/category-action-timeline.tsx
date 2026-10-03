"use client";

import { motion, type MotionValue } from "motion/react";
import {
  Timeline,
  TimelineIndicator,
  TimelineItem,
  TimelineTitle,
} from "@/components/reui/timeline";

type CategoryActionTimelineProps = {
  actions: readonly string[];
  side: "left" | "right";
  activeIndex: number;
  markerTop: MotionValue<string>;
  onBridge: boolean;
  reduceMotion: boolean;
};

export function CategoryActionTimeline({
  actions,
  side,
  activeIndex,
  markerTop,
  onBridge,
  reduceMotion,
}: CategoryActionTimelineProps) {
  const onLeft = side === "left";

  return (
    <div className={`relative min-h-25 lg:min-h-0 ${onLeft ? "lg:order-1" : ""}`}>
      <div
        aria-hidden="true"
        className={`absolute inset-y-0 hidden w-[4px] bg-white/25 lg:block ${
          onLeft ? "right-0 translate-x-1/2" : "left-0 -translate-x-1/2"
        }`}
      />
      <motion.div
        aria-hidden="true"
        className={`absolute top-0 hidden w-[4px] bg-[#f4c542] lg:block ${
          onLeft
            ? "left-0 -translate-x-1/2 lg:left-auto lg:right-0 lg:translate-x-1/2"
            : "left-0 -translate-x-1/2"
        }`}
        style={{ height: markerTop }}
      />
      {!onBridge && (
        <motion.div
          aria-hidden="true"
          className={`absolute z-10 hidden size-[20px] -translate-y-1/2 rounded-full bg-[#f4c542] shadow-[0_0_20px_#f4c54280] lg:block ${
            onLeft
              ? "left-0 -translate-x-1/2 lg:left-auto lg:right-0 lg:translate-x-1/2"
              : "left-0 -translate-x-1/2"
          }`}
          style={{ top: markerTop }}
        />
      )}
      <Timeline role="list" className="h-full">
        {actions.slice(0, 5).map((action, index) => (
          <TimelineItem
            key={action}
            step={index + 1}
            role="listitem"
            className="ms-0! min-h-5 justify-center pb-0!"
          >
            <TimelineIndicator
              className={`top-1/2! size-2! -translate-y-1/2! border-0! bg-white! transition-opacity duration-300 ${
                onLeft
                  ? "left-0! lg:left-auto! lg:right-0! lg:translate-x-1/2!"
                  : "left-0!"
              }`}
              style={{ opacity: index <= activeIndex ? 0.8 : 0.2 }}
            />
            <motion.div
              aria-hidden={index > activeIndex}
              initial={false}
              animate={{
                opacity: index > activeIndex ? 0 : index === activeIndex ? 1 : 0.65,
                y: !reduceMotion && index > activeIndex ? 16 : 0,
              }}
              transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <TimelineTitle
                className={`text-sm leading-[24px] font-medium text-white ${
                  onLeft ? "pl-4 lg:pr-4 lg:pl-0 lg:text-right" : "pl-4"
                }`}
              >
                {action}
              </TimelineTitle>
            </motion.div>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  );
}
