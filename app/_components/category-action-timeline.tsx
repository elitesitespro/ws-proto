"use client";

import type { Ref } from "react";
import { motion, type MotionValue } from "motion/react";
import {
  Timeline,
  TimelineIndicator,
  TimelineItem,
  TimelineTitle,
} from "@/components/reui/timeline";
import { StreetCar } from "./street-car";
import street from "./street.module.css";

type CategoryActionTimelineProps = {
  actions: readonly string[];
  side: "left" | "right";
  activeIndex: number;
  markerTop: MotionValue<string>;
  /** Where the car is on the street, and whether it's here to see. */
  carTop: MotionValue<string>;
  carShown: MotionValue<number>;
  columnRef?: Ref<HTMLDivElement>;
  onBridge: boolean;
  /** The street stops here rather than turning on to the next category. */
  deadEnd: boolean;
  reduceMotion: boolean;
};

export function CategoryActionTimeline({
  actions,
  side,
  activeIndex,
  markerTop,
  carTop,
  carShown,
  columnRef,
  onBridge,
  deadEnd,
  reduceMotion,
}: CategoryActionTimelineProps) {
  const onLeft = side === "left";
  // On a laptop the street runs down the column's inner edge, the actions'
  // names beside it; on a phone it runs down the page's left (the grid's)
  const roadAt = onLeft ? "100%" : "0%";

  return (
    <div ref={columnRef} className={`relative min-h-25 lg:mt-8 lg:min-h-0 ${onLeft ? "lg:order-1" : ""}`}>
      <div
        aria-hidden="true"
        className={`${street.road} ${deadEnd ? street.end : ""} hidden lg:block`}
        style={{ left: roadAt }}
      />
      <motion.div
        aria-hidden="true"
        className={`${street.trail} hidden lg:block`}
        style={{ left: roadAt, height: markerTop }}
      />
      {!onBridge && <StreetCar className="hidden lg:block" style={{ left: roadAt, top: carTop, opacity: carShown }} />}
      <Timeline role="list" className="h-full">
        {actions.slice(0, 5).map((action, index) => (
          <TimelineItem
            key={action}
            step={index + 1}
            role="listitem"
            className="ms-0! min-h-5 justify-center pb-0!"
          >
            {/* Each action is a stop at the roadside, lit once the car reaches it */}
            <TimelineIndicator
              className={`top-1/2! size-1! -translate-y-1/2! border-0! transition-colors duration-300 ${
                index <= activeIndex ? "bg-ember! shadow-[0_0_8px_var(--cx-halo)]" : "bg-white/35!"
              } ${
                onLeft
                  ? "left-[calc(var(--road)/2_+_8px)]! lg:left-auto! lg:right-[calc(var(--road)/2_+_10px)]! lg:translate-x-1/2!"
                  : "left-[calc(var(--road)/2_+_8px)]! lg:left-[calc(var(--road)/2_+_10px)]!"
              }`}
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
                className={`text-sm leading-[24px] font-medium text-foreground ${
                  onLeft ? "pl-4 lg:pr-6 lg:pl-0 lg:text-right" : "pl-4 lg:pl-6"
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
