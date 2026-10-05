"use client";

import { useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { PlatformIconGroup } from "@/components/ui/platform-icon-group";
import { CategoryActionTimeline } from "./category-action-timeline";

type MegaMenuStatementProps = {
  headingId: string;
  label: string;
  heading: string;
  actions: readonly string[];
  timelineSide: "left" | "right";
  connectToNext?: boolean;
  scenes?: readonly ReactNode[];
};

const cardShades = ["#252022", "#2a2527", "#302a2c", "#292426", "#332d2f"];

export function MegaMenuStatement({
  headingId,
  label,
  heading,
  actions,
  timelineSide,
  connectToNext = false,
  scenes,
}: MegaMenuStatementProps) {
  const storyRef = useRef<HTMLDivElement>(null);
  const bridgePathRef = useRef<SVGPathElement>(null);
  const timelineOnLeft = timelineSide === "left";
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(-1);
  const [onBridge, setOnBridge] = useState(false);
  const itemCount = actions.length;
  const mobileFirstOffset = 200 - 100 / itemCount;
  const mobileItemTravel = 200 - 200 / itemCount;
  const mobileCardTop = 32;
  const firstReveal = 1 / (itemCount + 2);
  const lastReveal = itemCount / (itemCount + 2);
  const bridgeStart = (itemCount + 1) / (itemCount + 2);
  const { scrollYProgress } = useScroll({
    target: storyRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    setActiveIndex(
      Math.min(itemCount - 1, Math.floor(progress * (itemCount + 2)) - 1),
    );
    setOnBridge(connectToNext && progress >= bridgeStart);
  });

  const markerTop = useTransform(scrollYProgress, (progress) => {
    const firstCenter = 50 / itemCount;
    const lastCenter = 100 - firstCenter;

    if (progress <= firstReveal) {
      return `${firstCenter * (progress / firstReveal)}%`;
    }

    if (progress <= lastReveal) {
      return `${firstCenter + (lastCenter - firstCenter) * ((progress - firstReveal) / (lastReveal - firstReveal))}%`;
    }

    if (progress <= bridgeStart) {
      return `${lastCenter + (100 - lastCenter) * ((progress - lastReveal) / (bridgeStart - lastReveal))}%`;
    }

    return "100%";
  });
  const mobileMarkerTop = useTransform(scrollYProgress, (progress) => {
    if (progress <= firstReveal) {
      const fraction = progress / firstReveal;
      return `calc(${fraction * 100}% + ${mobileCardTop - fraction * (mobileCardTop + mobileFirstOffset)}px)`;
    }

    if (progress <= lastReveal) {
      const fraction = (progress - firstReveal) / (lastReveal - firstReveal);
      return `calc(100% - ${mobileFirstOffset - fraction * mobileItemTravel}px)`;
    }

    if (progress <= bridgeStart) {
      const fraction = (progress - lastReveal) / (bridgeStart - lastReveal);
      return `calc(100% - ${(1 - fraction) * (100 / itemCount)}px)`;
    }

    return "100%";
  });
  const bridgeProgress = useTransform(
    scrollYProgress,
    [bridgeStart, 1],
    [0, 1],
  );
  const bridgePoint = (progress: number) => {
    const path = bridgePathRef.current;
    if (!path) return { x: timelineOnLeft ? 250 : 750, y: 0 };
    return path.getPointAtLength(path.getTotalLength() * progress);
  };
  const bridgeX = useTransform(
    bridgeProgress,
    (progress) => `${bridgePoint(progress).x / 10}%`,
  );
  const bridgeY = useTransform(
    bridgeProgress,
    (progress) => `${bridgePoint(progress).y}px`,
  );
  const bridgeMobileY = useTransform(
    bridgeProgress,
    (progress) => `${progress * 100}%`,
  );
  const bridgePath = timelineOnLeft
    ? "M 250 0 V 16 Q 250 40 274 40 H 726 Q 750 40 750 64 V 80"
    : "M 750 0 V 16 Q 750 40 726 40 H 274 Q 250 40 250 64 V 80";

  return (
    <div className="relative">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="relative grid lg:grid-cols-4">
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-[4px] -translate-x-1/2 bg-white/25 lg:hidden"
          />
          <div
            className={`absolute inset-y-0 hidden w-[4px] bg-white/25 lg:block ${
              timelineOnLeft
                ? "left-1/4 -translate-x-1/2"
                : "left-3/4 -translate-x-1/2"
            }`}
            aria-hidden="true"
          />
          <div
            className={`py-10 pl-4 lg:col-span-3 lg:py-12 ${
              timelineOnLeft ? "lg:col-start-2 lg:pl-4" : "lg:pl-0 lg:pr-4"
            }`}
          >
            <div className="flex items-center gap-1">
              <PlatformIconGroup />
              <p className="text-xs font-medium leading-[24px] text-white/75">
                {label}
              </p>
            </div>
            <h2
              id={headingId}
              className="mt-2 max-w-4xl text-lg leading-[36px] font-medium tracking-tight sm:text-xl sm:leading-[44px] md:text-3xl md:leading-[56px] md:tracking-tighter"
            >
              {heading}
            </h2>
          </div>
        </div>
      </div>

      <div
        ref={storyRef}
        className="relative"
        style={{ height: `${100 + (itemCount + 2) * 55}svh` }}
      >
        <div className="sticky top-0 h-svh overflow-hidden">
          <div className="mx-auto flex h-full w-full max-w-7xl flex-col px-4 md:px-6">
            <div className="relative grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] lg:grid-cols-4 lg:grid-rows-1">
              <div
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-[4px] -translate-x-1/2 bg-white/25 lg:hidden"
              />
              <div
                aria-hidden="true"
                className={`absolute top-0 hidden h-8 w-[4px] -translate-x-1/2 bg-white/25 lg:block ${
                  timelineOnLeft ? "left-1/4" : "left-3/4"
                }`}
              />
              <motion.div
                aria-hidden="true"
                className="absolute top-0 left-0 w-[4px] -translate-x-1/2 bg-[#f4c542] lg:hidden"
                style={{ height: mobileMarkerTop }}
              />
              {!onBridge && (
                <motion.div
                  aria-hidden="true"
                  className="absolute left-0 z-10 size-[20px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f4c542] shadow-[0_0_20px_#f4c54280] lg:hidden"
                  style={{ top: mobileMarkerTop }}
                />
              )}

              <div
                className={`col-span-1 flex min-h-0 flex-col pt-4 pl-4 lg:col-span-3 lg:pt-8 ${
                  timelineOnLeft ? "lg:order-2 lg:pl-4" : "lg:pl-0 lg:pr-4"
                }`}
              >
                <div className="relative min-h-0 flex-1 overflow-hidden rounded-3xl bg-[#252022]">
                  <AnimatePresence initial={false}>
                    {(activeIndex >= 0 || scenes) && (
                      <motion.div
                        key={scenes ? Math.max(0, activeIndex) : activeIndex}
                        aria-hidden={scenes ? undefined : true}
                        className={
                          scenes
                            ? "absolute inset-0"
                            : "absolute inset-0 flex flex-col justify-end p-4 md:p-6"
                        }
                        style={{
                          backgroundColor:
                            cardShades[activeIndex % cardShades.length],
                        }}
                        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? undefined : { opacity: 0, y: -24 }}
                        transition={{
                          duration: reduceMotion ? 0 : 0.4,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        {scenes ? (
                          scenes[Math.max(0, activeIndex)]
                        ) : (
                          <>
                            <span className="text-xs leading-[24px] text-white/60">
                              {String(activeIndex + 1).padStart(2, "0")} /{" "}
                              {String(itemCount).padStart(2, "0")}
                            </span>
                            <span className="mt-1 text-lg leading-[36px] font-medium tracking-tight text-white">
                              {actions[activeIndex]}
                            </span>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <CategoryActionTimeline
                actions={actions}
                side={timelineSide}
                activeIndex={activeIndex}
                markerTop={markerTop}
                onBridge={onBridge}
                reduceMotion={Boolean(reduceMotion)}
              />
            </div>

            {connectToNext && (
              <div aria-hidden="true" className="relative h-10 shrink-0">
                <div className="absolute inset-y-0 left-0 w-[4px] -translate-x-1/2 bg-white/25 lg:hidden" />
                <motion.div
                  className="absolute top-0 left-0 w-[4px] -translate-x-1/2 bg-[#f4c542] lg:hidden"
                  style={{ height: bridgeMobileY }}
                />
                <svg
                  className="hidden h-full w-full lg:block"
                  viewBox="0 0 1000 80"
                  preserveAspectRatio="none"
                >
                  <path
                    ref={bridgePathRef}
                    d={bridgePath}
                    fill="none"
                    stroke="white"
                    strokeOpacity="0.25"
                    strokeWidth="4"
                    vectorEffect="non-scaling-stroke"
                  />
                  <motion.path
                    d={bridgePath}
                    fill="none"
                    stroke="#f4c542"
                    strokeWidth="4"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    style={{ pathLength: bridgeProgress }}
                  />
                </svg>
                {onBridge && (
                  <>
                    <motion.div
                      className="absolute left-0 z-10 size-[20px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f4c542] shadow-[0_0_20px_#f4c54280] lg:hidden"
                      style={{ top: bridgeMobileY }}
                    />
                    <motion.div
                      className="absolute z-10 hidden size-[20px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f4c542] shadow-[0_0_20px_#f4c54280] lg:block"
                      style={{ left: bridgeX, top: bridgeY }}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
