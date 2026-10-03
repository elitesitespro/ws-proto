"use client";

import { useRef, useState, type CSSProperties } from "react";
import { UsersThreeIcon } from "@phosphor-icons/react/UsersThree";
import { PhoneIcon } from "@phosphor-icons/react/Phone";
import { VideoCameraIcon } from "@phosphor-icons/react/VideoCamera";
import { PlayIcon } from "@phosphor-icons/react/Play";
import { FilmStripIcon } from "@phosphor-icons/react/FilmStrip";
import { SparkleIcon } from "@phosphor-icons/react/Sparkle";
import { GameControllerIcon } from "@phosphor-icons/react/GameController";
import { ShoppingBagIcon } from "@phosphor-icons/react/ShoppingBag";
import { BriefcaseIcon } from "@phosphor-icons/react/Briefcase";
import { GraduationCapIcon } from "@phosphor-icons/react/GraduationCap";
import { HeartbeatIcon } from "@phosphor-icons/react/Heartbeat";
import { ChartLineUpIcon } from "@phosphor-icons/react/ChartLineUp";
import { CurrencyBtcIcon } from "@phosphor-icons/react/CurrencyBtc";
import { TargetIcon } from "@phosphor-icons/react/Target";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

const platforms = [
  { name: "WorldSpace", category: "Connect", Icon: UsersThreeIcon, background: "oklch(82.8% 0.189 84.429)", foreground: "#070405" },
  { name: "WorldCall", category: "Connect", Icon: PhoneIcon, background: "oklch(68.5% 0.169 237.323)", foreground: "#070405" },
  { name: "WorldMeet", category: "Connect", Icon: VideoCameraIcon, background: "oklch(54.6% 0.245 262.881)", foreground: "#ffffff" },
  { name: "XStream", category: "Entertainment", Icon: PlayIcon, background: "oklch(54.1% 0.281 293.009)", foreground: "#ffffff" },
  { name: "Vsion", category: "Entertainment", Icon: FilmStripIcon, background: "oklch(58.5% 0.233 277.117)", foreground: "#ffffff" },
  { name: "AI Movie", category: "Entertainment", Icon: SparkleIcon, background: "oklch(59.1% 0.293 322.896)", foreground: "#ffffff" },
  { name: "Arcade", category: "Entertainment", Icon: GameControllerIcon, background: "oklch(59.2% 0.249 0.584)", foreground: "#ffffff" },
  { name: "WorldStore", category: "Lifestyle", Icon: ShoppingBagIcon, background: "oklch(69.6% 0.17 162.48)", foreground: "#070405" },
  { name: "WorkWorld", category: "Lifestyle", Icon: BriefcaseIcon, background: "oklch(60% 0.118 184.704)", foreground: "#070405" },
  { name: "Academy", category: "Lifestyle", Icon: GraduationCapIcon, background: "oklch(70.5% 0.213 47.604)", foreground: "#070405" },
  { name: "WorldHealth", category: "Lifestyle", Icon: HeartbeatIcon, background: "oklch(64.5% 0.246 16.439)", foreground: "#070405" },
  { name: "Forex", category: "Markets", Icon: ChartLineUpIcon, background: "oklch(76.8% 0.233 130.85)", foreground: "#070405" },
  { name: "Crypto", category: "Markets", Icon: CurrencyBtcIcon, background: "oklch(79.5% 0.184 86.047)", foreground: "#070405" },
  { name: "Prediction", category: "Markets", Icon: TargetIcon, background: "oklch(71.5% 0.143 215.221)", foreground: "#070405" },
] as const;

const cardAngleStep = 36;
type Platform = (typeof platforms)[number];

function orbitAngle(progress: number, index: number) {
  return (progress * (platforms.length + 1) - index - 1) * cardAngleStep;
}

function PlatformCardFace({ platform, active = false }: { platform: Platform; active?: boolean }) {
  return (
    <motion.div
      animate={{
        scale: active ? [1, 1.16, 1.08] : 1,
        rotate: active ? [0, -7, 0] : 0,
      }}
      transition={{ duration: 0.32, times: [0, 0.45, 1], ease: "easeOut" }}
      className="flex size-9 items-center justify-center rounded-3xl transition-colors duration-500"
      style={{ backgroundColor: "var(--timeline-background)" }}
    >
      <div
        className={`flex size-7 items-center justify-center rounded-lg border-2 ${active ? "border-current" : "border-transparent"}`}
        style={{ backgroundColor: platform.background, color: platform.foreground }}
      >
        <platform.Icon aria-hidden="true" size={24} weight="fill" />
        <span className="sr-only">{platform.name}</span>
      </div>
    </motion.div>
  );
}

function OrbitCard({
  index,
  progress,
  active,
}: {
  index: number;
  progress: MotionValue<number>;
  active: boolean;
}) {
  const platform = platforms[index];
  const transform = useTransform(progress, (value) => {
    const angle = orbitAngle(value, index);

    return `translate(-50%, -50%) rotate(${angle}deg) translateX(calc(var(--orbit-size) / 2)) rotate(${-angle}deg)`;
  });
  const opacity = useTransform(progress, (value) => {
    const distanceFromVisibleArc = Math.abs(orbitAngle(value, index));

    if (distanceFromVisibleArc <= 84) return 1;
    if (distanceFromVisibleArc >= 96) return 0;
    return (96 - distanceFromVisibleArc) / 12;
  });

  return (
    <motion.li className="absolute left-1/2 top-1/2" style={{ transform, opacity }}>
      <PlatformCardFace platform={platform} active={active} />
    </motion.li>
  );
}

export function PlatformTimelineSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const shouldReduceMotion = useReducedMotion();
  const activePlatform = !shouldReduceMotion && activeIndex >= 0 ? platforms[activeIndex] : null;
  const visiblePlatforms = shouldReduceMotion ? platforms.slice(0, 6) : platforms;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 80px", "end end"],
  });
  const steppedProgress = useTransform(
    scrollYProgress,
    (progress) => Math.round(progress * (platforms.length + 1)) / (platforms.length + 1),
  );
  const orbitProgress = useSpring(steppedProgress, {
    stiffness: 280,
    damping: 28,
    mass: 0.6,
  });

  useMotionValueEvent(orbitProgress, "change", (progress) => {
    const nextIndex = Math.min(
      platforms.length - 1,
      Math.floor(progress * (platforms.length + 1) + 0.05) - 1,
    );
    setActiveIndex((current) => current === nextIndex ? current : nextIndex);
  });

  return (
    <section
      ref={sectionRef}
      aria-labelledby="platform-timeline-heading"
      className="transition-colors duration-500"
      style={{
        backgroundColor: activePlatform?.background ?? "#070405",
        color: activePlatform?.foreground ?? "#ffffff",
        "--timeline-background": activePlatform?.background ?? "#070405",
        height: shouldReduceMotion ? undefined : `${100 + (platforms.length + 1) * 60}svh`,
      } as CSSProperties}
    >
      <h2 id="platform-timeline-heading" className="sr-only">
        Explore WorldStreet platforms
      </h2>

      <div
        className={`mx-auto grid w-full max-w-7xl grid-cols-2 gap-2 px-4 [--orbit-size:240px] md:gap-4 md:px-6 md:[--orbit-size:400px] lg:[--orbit-size:560px] xl:[--orbit-size:640px] ${shouldReduceMotion ? "min-h-[calc(var(--orbit-size)+64px)] py-8" : "sticky top-10 h-[calc(100svh-80px)]"}`}
      >
        <div className="relative min-w-0 overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute left-0 top-1/2 size-[var(--orbit-size)] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-current opacity-35"
          />

          <ol
            aria-label="WorldStreet platforms"
            className="absolute left-0 top-1/2 size-[var(--orbit-size)] -translate-x-1/2 -translate-y-1/2"
          >
            {visiblePlatforms.map((platform, index) => (
              shouldReduceMotion ? (
                <li
                  key={platform.name}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${(index - (visiblePlatforms.length - 1) / 2) * cardAngleStep}deg) translateX(calc(var(--orbit-size) / 2)) rotate(${-(index - (visiblePlatforms.length - 1) / 2) * cardAngleStep}deg)`,
                  }}
                >
                  <PlatformCardFace platform={platform} />
                </li>
              ) : (
                <OrbitCard
                  key={platform.name}
                  index={index}
                  progress={orbitProgress}
                  active={activeIndex === index}
                />
              )
            ))}
          </ol>

          {!shouldReduceMotion && (
            <div aria-hidden="true" className="absolute left-0 top-1/2 size-[var(--orbit-size)] -translate-x-1/2 -translate-y-1/2">
              <AnimatePresence mode="wait" initial={false}>
                {activeIndex >= 0 && (
                  <motion.span
                    key={platforms[activeIndex].name}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.24, ease: "easeOut" }}
                    className="absolute left-[70%] top-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-xs font-medium tracking-tight md:text-base lg:left-3/4 lg:text-lg xl:text-xl"
                  >
                    {platforms[activeIndex].name}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="flex min-w-0 items-center pl-2 md:pl-4">
          {shouldReduceMotion ? (
            <ol className="flex flex-col gap-2">
              {platforms.map((platform) => (
                <li key={platform.name} className="text-xs font-medium md:text-base">
                  {platform.name}
                </li>
              ))}
            </ol>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              {activeIndex >= 0 && (
                <motion.div
                  key={platforms[activeIndex].name}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="min-w-0"
                >
                  <p className="text-xs md:text-sm">
                    {platforms[activeIndex].category}
                  </p>
                  <h3 className="mt-1 text-base font-medium tracking-tight md:text-2xl xl:text-3xl">
                    {platforms[activeIndex].name}
                  </h3>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
}
