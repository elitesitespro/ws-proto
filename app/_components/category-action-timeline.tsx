"use client";

import {
  Timeline,
  TimelineIndicator,
  TimelineItem,
  TimelineTitle,
} from "@/components/reui/timeline";

type CategoryActionTimelineProps = {
  actions: readonly string[];
  side: "left" | "right";
};

export function CategoryActionTimeline({
  actions,
  side,
}: CategoryActionTimelineProps) {
  const onLeft = side === "left";

  return (
    <div className={`relative min-h-40 lg:min-h-0 ${onLeft ? "lg:order-1" : ""}`}>
      <div
        aria-hidden="true"
        className={`absolute inset-y-0 hidden w-[4px] bg-white/25 lg:block ${
          onLeft ? "right-0 translate-x-1/2" : "left-0 -translate-x-1/2"
        }`}
      />
      <Timeline role="list" className="h-full py-2 lg:py-12">
        {actions.slice(0, 5).map((action, index) => (
          <TimelineItem
            key={action}
            step={index + 1}
            role="listitem"
            className="ms-0! min-h-8 justify-center pb-0!"
          >
            <TimelineIndicator
              className={`top-1/2! size-2! -translate-y-1/2! border-0! bg-white! ${
                onLeft
                  ? "left-0! lg:left-auto! lg:right-0! lg:translate-x-1/2!"
                  : "left-0!"
              }`}
            />
            <TimelineTitle
              className={`text-sm leading-[24px] font-medium text-white/80 ${
                onLeft ? "pl-4 lg:pr-4 lg:pl-0 lg:text-right" : "pl-4"
              }`}
            >
              {action}
            </TimelineTitle>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  );
}
