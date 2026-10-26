"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { PlatformIconGroup } from "@/components/ui/platform-icon-group";
import { CategoryActionTimeline } from "./category-action-timeline";
import { StreetCar } from "./street-car";
import street from "./street.module.css";

type MegaMenuStatementProps = {
  headingId: string;
  label: string;
  heading: string;
  actions: readonly string[];
  timelineSide: "left" | "right";
  connectToNext?: boolean;
  /**
   * The street begins here: its mouth opens out of the cream above (the
   * platform tour's last page), and the car waits in it to set off.
   */
  entrance?: boolean;
  scenes?: readonly ReactNode[];
};

// Each step lifts the stone card a little: the card fill with a touch of
// white mixed in, so consecutive steps read as different frames.
const cardShades = [0, 2, 4.5, 1.5, 5.5].map(
  (lift) => `color-mix(in srgb, white ${lift}%, var(--card))`,
);

// The street's turn across to the next category, in the 80px band at the
// foot of the pinned story: two corners of this radius
const TURN = 40;
// The mouth's two rounded corners and the road between them, in px. (On a
// phone or a tablet the tour above ends on its dark dial, not cream, so
// there the street just starts, a little way down.)
const MOUTH = { radius: 112, road: 32 };
const START_SM = 24;
// Where the car waits at the street's start, its middle this far down, in px
const PARKED = { lg: 48, sm: START_SM + 24 };
// Where the car sets off from the mouth: as it rises to this far down the
// screen, so you see it waiting first
const SET_OFF = 0.75;

const mouthPath = ({ radius: r, road }: { radius: number; road: number }) =>
  `M0 0A${r} ${r} 0 0 1 ${r} ${r}H${r + road}A${r} ${r} 0 0 1 ${2 * r + road} 0Z`;

export function MegaMenuStatement({
  headingId,
  label,
  heading,
  actions,
  timelineSide,
  connectToNext = false,
  entrance = false,
  scenes,
}: MegaMenuStatementProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const bridgeRef = useRef<HTMLDivElement>(null);
  const bridgePathRef = useRef<SVGPathElement>(null);
  const trailMask = useId();
  const timelineOnLeft = timelineSide === "left";
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(-1);
  const [onBridge, setOnBridge] = useState(false);
  // The turn's width, and where the centre line's dashes are when the
  // street reaches it, so they run on round the corner
  const [turn, setTurn] = useState({ width: 0, phase: 0 });
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

  /** How far down the timeline the car is, 0 to 100. */
  const markerAt = useTransform(scrollYProgress, (progress) => {
    const firstCenter = 50 / itemCount;
    const lastCenter = 100 - firstCenter;

    if (progress <= firstReveal) {
      return firstCenter * (progress / firstReveal);
    }

    if (progress <= lastReveal) {
      return firstCenter + (lastCenter - firstCenter) * ((progress - firstReveal) / (lastReveal - firstReveal));
    }

    if (progress <= bridgeStart) {
      return lastCenter + (100 - lastCenter) * ((progress - lastReveal) / (bridgeStart - lastReveal));
    }

    return 100;
  });
  const markerTop = useTransform(markerAt, (at) => `${at}%`);
  const mobileTop = (progress: number) => {
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
  };
  // The phone's gold trail runs from where the car joins the timeline
  const mobileTrail = useTransform(scrollYProgress, (progress) => `calc(${mobileTop(progress)} - ${mobileCardTop}px)`);
  // Where the street stops, the car pulls up short of its end rather than
  // running over it
  const carTop = useTransform(markerAt, (at) =>
    connectToNext ? `${at}%` : `calc(${at}% - ${at / 100} * (var(--car-h) / 2 + 8px))`,
  );
  const mobileCarTop = useTransform(scrollYProgress, (progress) => {
    const run = Math.min(Math.max((progress - lastReveal) / (bridgeStart - lastReveal), 0), 1);
    return connectToNext ? mobileTop(progress) : `calc(${mobileTop(progress)} - ${run} * (var(--car-h) / 2 + 8px))`;
  });
  const bridgeProgress = useTransform(
    scrollYProgress,
    [bridgeStart, 1],
    [0, 1],
  );
  const bridgeMobileY = useTransform(
    bridgeProgress,
    (progress) => `${progress * 100}%`,
  );

  // The turn: down from this category's side, across, and down into the
  // next one's, with real corners (so drawn in px, at its measured width)
  const turnFrom = turn.width * (timelineOnLeft ? 0.25 : 0.75);
  const turnTo = turn.width * (timelineOnLeft ? 0.75 : 0.25);
  const across = timelineOnLeft ? 1 : -1;
  const bridgePath = `M${turnFrom} 0A${TURN} ${TURN} 0 0 ${timelineOnLeft ? 0 : 1} ${turnFrom + across * TURN} ${TURN}H${turnTo - across * TURN}A${TURN} ${TURN} 0 0 ${timelineOnLeft ? 1 : 0} ${turnTo} ${2 * TURN}`;
  /** Where the car is on the turn, and which way it's facing. */
  const bridgePose = (progress: number) => {
    const path = bridgePathRef.current;
    if (!path) return { x: 0, y: 0, angle: 0 };
    const length = path.getTotalLength();
    const at = Math.min(Math.max(progress, 0), 1) * length;
    const here = path.getPointAtLength(at);
    const back = path.getPointAtLength(Math.max(at - 1, 0));
    const ahead = path.getPointAtLength(Math.min(at + 1, length));
    // Its nose is drawn pointing down the screen, at 90°
    const angle = (Math.atan2(ahead.y - back.y, ahead.x - back.x) * 180) / Math.PI - 90;
    return { x: here.x, y: here.y, angle };
  };
  const bridgeX = useTransform(bridgeProgress, (progress) => `${bridgePose(progress).x}px`);
  const bridgeY = useTransform(bridgeProgress, (progress) => `${bridgePose(progress).y}px`);
  const bridgeAngle = useTransform(bridgeProgress, (progress) => bridgePose(progress).angle);

  useEffect(() => {
    const band = bridgeRef.current;
    if (!band) return;
    const column = columnRef.current;
    const measure = () => setTurn({ width: band.clientWidth, phase: (column?.clientHeight ?? 0) % 32 });
    const observer = new ResizeObserver(measure);
    observer.observe(band);
    if (column) observer.observe(column);
    return () => observer.disconnect();
  }, []);

  // The car: in the timeline while the story's pinned and on the turn at its
  // foot; before that, down the first stretch, through the heading. It sets
  // off from the mouth (or from the last category's turn, which ends where
  // this begins) and reaches the timeline's top just as the story pins,
  // where the timeline takes it on. Then the next category's car takes over
  // where the turn ends.
  const { scrollY } = useScroll();
  const leadTop = useMotionValue("0px");
  const leadTopSm = useMotionValue("0px");
  const leadShown = useMotionValue(0);
  const carShown = useTransform(scrollYProgress, (progress): number => (progress > 0 ? 1 : 0));
  const turnCarShown = useTransform(scrollYProgress, (progress): number => (progress < 1 ? 1 : 0));
  const placeLead = () => {
    const root = rootRef.current;
    const story = storyRef.current;
    if (!root || !story) return;
    const view = window.innerHeight;
    const top = root.getBoundingClientRect().top;
    const storyTop = story.getBoundingClientRect().top;
    const from = entrance ? view * SET_OFF : view;
    const run = Math.min(Math.max((from - top) / (from + storyTop - top), 0), 1);
    const column = columnRef.current ? columnRef.current.getBoundingClientRect().top - storyTop : 0;
    const start = entrance ? PARKED.lg : 0;
    const startSm = entrance ? PARKED.sm : 0;
    leadTop.set(`${start + (storyTop - top + column - start) * run}px`);
    leadTopSm.set(`${startSm + (storyTop - top + mobileCardTop - startSm) * run}px`);
    leadShown.set(storyTop >= 0 && (entrance || top <= view) ? 1 : 0);
  };
  useMotionValueEvent(scrollY, "change", placeLead);
  useEffect(() => {
    placeLead();
    const onResize = () => placeLead();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  });

  return (
    <div ref={rootRef} className={`relative ${street.street}`}>
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="relative grid lg:grid-cols-4">
          {/* The street's first stretch, down beside the heading */}
          <div
            aria-hidden="true"
            className={`${street.road} ${street.up} ${entrance ? street.start : ""} lg:hidden`}
            style={{ left: 0, top: entrance ? START_SM : 0 }}
          />
          <div
            aria-hidden="true"
            className={`${street.road} ${street.up} hidden lg:block`}
            style={{ left: timelineOnLeft ? "25%" : "75%" }}
          />
          {entrance && (
            <svg
              aria-hidden="true"
              className={`${street.mouth} hidden lg:block`}
              style={{ left: timelineOnLeft ? "25%" : "75%" }}
              width={2 * MOUTH.radius + MOUTH.road}
              height={MOUTH.radius}
            >
              <path d={mouthPath(MOUTH)} />
            </svg>
          )}
          <div
            className={`py-10 pl-4 lg:col-span-3 lg:py-12 ${
              timelineOnLeft ? "lg:col-start-2 lg:pl-4" : "lg:pl-0 lg:pr-4"
            }`}
          >
            <div className="flex items-center gap-1">
              <PlatformIconGroup />
              <p className="text-xs font-medium leading-[24px] text-muted">
                {label}
              </p>
            </div>
            <h2
              id={headingId}
              className="cx-h2 mt-2 max-w-4xl text-lg leading-[36px] sm:text-xl sm:leading-[44px] md:text-3xl md:leading-[56px]"
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
                className={`${street.road} ${connectToNext ? "" : street.end} lg:hidden`}
                style={{ left: 0 }}
              />
              <div
                aria-hidden="true"
                className={`${street.road} bottom-auto! hidden h-8 lg:block`}
                style={{ left: timelineOnLeft ? "25%" : "75%" }}
              />
              <motion.div
                aria-hidden="true"
                className={`${street.trail} lg:hidden`}
                style={{ left: 0, top: mobileCardTop, height: mobileTrail, backgroundPositionY: -mobileCardTop }}
              />
              {!onBridge && (
                <StreetCar className="lg:hidden" style={{ left: 0, top: mobileCarTop, opacity: carShown }} />
              )}

              <div
                className={`col-span-1 flex min-h-0 flex-col pt-4 pl-4 lg:col-span-3 lg:pt-8 ${
                  timelineOnLeft ? "lg:order-2 lg:pl-4" : "lg:pl-0 lg:pr-4"
                }`}
              >
                <div className="cx-lit relative min-h-0 flex-1 overflow-hidden rounded-card bg-card">
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
                            <span className="text-xs leading-[24px] text-muted tabular-nums">
                              {String(activeIndex + 1).padStart(2, "0")} /{" "}
                              {String(itemCount).padStart(2, "0")}
                            </span>
                            <span className="mt-1 text-lg leading-[36px] font-medium tracking-tight text-foreground">
                              {actions[activeIndex]}
                            </span>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <span className="cx-lit-2" aria-hidden="true" />
                </div>
              </div>

              <CategoryActionTimeline
                actions={actions}
                side={timelineSide}
                activeIndex={activeIndex}
                markerTop={markerTop}
                carTop={carTop}
                carShown={carShown}
                columnRef={columnRef}
                onBridge={onBridge}
                deadEnd={!connectToNext}
                reduceMotion={Boolean(reduceMotion)}
              />
            </div>

            {connectToNext && (
              <div ref={bridgeRef} aria-hidden="true" className="relative h-10 shrink-0">
                <div className={`${street.road} lg:hidden`} style={{ left: 0 }} />
                <motion.div className={`${street.trail} lg:hidden`} style={{ left: 0, height: bridgeMobileY }} />
                {turn.width > 0 && (
                  <svg
                    className="absolute inset-0 hidden h-full w-full overflow-visible lg:block"
                    viewBox={`0 0 ${turn.width} ${2 * TURN}`}
                  >
                    <defs>
                      <mask id={trailMask} maskUnits="userSpaceOnUse" x="0" y={-TURN} width={turn.width} height={4 * TURN}>
                        {/* The way the car has come round the turn */}
                        <motion.path
                          d={bridgePath}
                          fill="none"
                          stroke="#fff"
                          strokeWidth="12"
                          style={{ pathLength: bridgeProgress }}
                        />
                      </mask>
                    </defs>
                    <path ref={bridgePathRef} d={bridgePath} className={street.turnRoad} />
                    <path d={bridgePath} className={street.turnLane} style={{ strokeDashoffset: turn.phase }} />
                    <path
                      d={bridgePath}
                      className={street.turnTrail}
                      style={{ strokeDashoffset: turn.phase }}
                      mask={`url(#${trailMask})`}
                    />
                  </svg>
                )}
                {onBridge && (
                  <>
                    <StreetCar className="lg:hidden" style={{ left: 0, top: bridgeMobileY, opacity: turnCarShown }} />
                    <StreetCar
                      className="hidden lg:block"
                      style={{ left: bridgeX, top: bridgeY, rotate: bridgeAngle, opacity: turnCarShown }}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* The car on its first stretch, before the story pins */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
        <div className="relative mx-auto h-full w-full max-w-7xl px-4 md:px-6">
          <div className="relative h-full">
            <StreetCar className="lg:hidden" style={{ left: 0, top: leadTopSm, opacity: leadShown }} />
            <StreetCar
              className="hidden lg:block"
              style={{ left: timelineOnLeft ? "25%" : "75%", top: leadTop, opacity: leadShown }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
