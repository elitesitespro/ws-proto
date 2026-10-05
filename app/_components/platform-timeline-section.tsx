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
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlatformView } from "./platform-view";
import { PlatformBackdrop } from "./platform-backdrop";
import styles from "./platform-timeline-section.module.css";
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
  {
    name: "WorldSpace",
    category: "Connect",
    Icon: UsersThreeIcon,
    background: "oklch(82.8% 0.189 84.429)",
    foreground: "#070405",
  },
  {
    name: "WorldCall",
    category: "Connect",
    Icon: PhoneIcon,
    background: "oklch(68.5% 0.169 237.323)",
    foreground: "#070405",
  },
  {
    name: "WorldMeet",
    category: "Connect",
    Icon: VideoCameraIcon,
    background: "oklch(54.6% 0.245 262.881)",
    foreground: "#ffffff",
  },
  {
    name: "XStream",
    category: "Entertainment",
    Icon: PlayIcon,
    background: "#ff5900",
    foreground: "#100806",
  },
  {
    name: "Vsion",
    category: "Entertainment",
    Icon: FilmStripIcon,
    background: "oklch(58.5% 0.233 277.117)",
    foreground: "#ffffff",
  },
  {
    name: "AI Movie",
    category: "Entertainment",
    Icon: SparkleIcon,
    background: "oklch(59.1% 0.293 322.896)",
    foreground: "#ffffff",
  },
  {
    name: "Arcade",
    category: "Entertainment",
    Icon: GameControllerIcon,
    background: "oklch(59.2% 0.249 0.584)",
    foreground: "#ffffff",
  },
  {
    name: "WorldStore",
    category: "Lifestyle",
    Icon: ShoppingBagIcon,
    background: "oklch(69.6% 0.17 162.48)",
    foreground: "#070405",
  },
  {
    name: "WorkWorld",
    category: "Lifestyle",
    Icon: BriefcaseIcon,
    background: "oklch(60% 0.118 184.704)",
    foreground: "#070405",
  },
  {
    name: "Academy",
    category: "Lifestyle",
    Icon: GraduationCapIcon,
    background: "oklch(70.5% 0.213 47.604)",
    foreground: "#070405",
  },
  {
    name: "WorldHealth",
    category: "Lifestyle",
    Icon: HeartbeatIcon,
    background: "oklch(64.5% 0.246 16.439)",
    foreground: "#070405",
  },
  {
    name: "Forex",
    category: "Markets",
    Icon: ChartLineUpIcon,
    background: "oklch(76.8% 0.233 130.85)",
    foreground: "#070405",
  },
  {
    name: "Crypto",
    category: "Markets",
    Icon: CurrencyBtcIcon,
    background: "oklch(79.5% 0.184 86.047)",
    foreground: "#070405",
  },
  {
    name: "Prediction",
    category: "Markets",
    Icon: TargetIcon,
    background: "#c8f06b",
    foreground: "#14291f",
  },
] as const;

const backdropColors: Record<string, string> = {
  WorkWorld: "#e1e8d5",
  Vsion: "#171117",
  Arcade: "#241130",
  WorldSpace: "#f0c75a",
};
const cardAngleStep = 36;
type Platform = (typeof platforms)[number];

function orbitAngle(progress: number, index: number) {
  return (progress * (platforms.length + 1) - index - 1) * cardAngleStep;
}

function PlatformCardFace({
  platform,
  active = false,
}: {
  platform: Platform;
  active?: boolean;
}) {
  return (
    <motion.div
      animate={{
        scale: active ? [1, 1.16, 1.08] : 1,
        rotate: active ? [0, -7, 0] : 0,
      }}
      transition={{ duration: 0.32, times: [0, 0.45, 1], ease: "easeOut" }}
      className="flex size-9 items-center justify-center rounded-3xl transition-colors duration-500"
      style={{ backgroundColor: "#070405" }}
    >
      <div
        className={`flex size-7 items-center justify-center rounded-lg border-2 ${active ? "border-current" : "border-transparent"}`}
        style={{
          backgroundColor: platform.background,
          color: platform.foreground,
        }}
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

    return `translate(-50%, -50%) rotate(calc(${angle}deg + var(--orbit-offset, 0deg))) translateX(calc(var(--orbit-size) / 2)) rotate(calc(${-angle}deg - var(--orbit-offset, 0deg)))`;
  });
  const opacity = useTransform(progress, (value) => {
    const distanceFromVisibleArc = Math.abs(orbitAngle(value, index));

    if (distanceFromVisibleArc <= 84) return 1;
    if (distanceFromVisibleArc >= 96) return 0;
    return (96 - distanceFromVisibleArc) / 12;
  });

  return (
    <motion.li
      className="absolute left-1/2 top-1/2"
      style={{ transform, opacity }}
    >
      <PlatformCardFace platform={platform} active={active} />
    </motion.li>
  );
}

export function PlatformTimelineSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const activePlatform = platforms[activeIndex];
  const visiblePlatforms = platforms;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 80px", "end end"],
  });
  const steppedProgress = useTransform(
    scrollYProgress,
    (progress) =>
      Math.round(progress * (platforms.length + 1)) / (platforms.length + 1),
  );
  const orbitProgress = useSpring(steppedProgress, {
    stiffness: 280,
    damping: 28,
    mass: 0.6,
  });
  const pointerTransform = useTransform(orbitProgress, (progress) => {
    const angle = orbitAngle(progress, activeIndex);
    return `translate(-50%, -50%) rotate(calc(${angle}deg + var(--orbit-offset, 0deg))) translateX(calc(var(--orbit-size) / 2 + var(--pointer-offset)))`;
  });

  useMotionValueEvent(orbitProgress, "change", (progress) => {
    const nextIndex = Math.max(
      0,
      Math.min(
        platforms.length - 1,
        Math.floor(progress * (platforms.length + 1) + 0.05) - 1,
      ),
    );
    setActiveIndex((current) => (current === nextIndex ? current : nextIndex));
  });

  function goToPlatform(index: number) {
    const section = sectionRef.current;
    if (!section) return;
    const start = window.scrollY + section.getBoundingClientRect().top - 80;
    const travel = section.offsetHeight - window.innerHeight + 80;
    const progress = (index + 1) / (platforms.length + 1);
    window.scrollTo({ top: start + travel * progress, behavior: "instant" });
  }

  return (
    <section
      ref={sectionRef}
      aria-labelledby="platform-timeline-heading"
      className={`${styles.section} transition-colors duration-500`}
      style={
        {
          backgroundColor:
            backdropColors[activePlatform.name] ?? activePlatform.background,
          color: activePlatform?.foreground ?? "#ffffff",
          "--timeline-background":
            backdropColors[activePlatform.name] ?? activePlatform.background,
          "--timeline-height": `${100 + (platforms.length + 1) * 60}svh`,
        } as CSSProperties
      }
    >
      <h2 id="platform-timeline-heading" className="sr-only">
        Explore WorldStreet platforms
      </h2>

      <div
        className={`${styles.orbitLayout} sticky top-10 mx-auto h-[calc(100svh-80px)] w-full max-w-7xl`}
      >
        <PlatformBackdrop name={activePlatform.name} />
        <div className={`${styles.orbitStage} relative min-w-0`}>
          <div aria-hidden="true" className={styles.orbitCutout} />
          <div
            aria-hidden="true"
            className={`${styles.orbitCircle} ${styles.orbitRail}`}
          />

          <ol aria-label="WorldStreet platforms" className={styles.orbitCircle}>
            {visiblePlatforms.map((platform, index) =>
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
              ),
            )}
          </ol>

          <div
            aria-hidden="true"
            className={`${styles.orbitCircle} ${styles.pointerTrack}`}
          >
            <motion.div
              className={styles.orbitPointer}
              style={{ transform: pointerTransform }}
            />
          </div>

          {!shouldReduceMotion && (
            <div
              aria-hidden="true"
              className={`${styles.orbitLabel} absolute left-0 top-1/2 size-[var(--orbit-size)] -translate-x-1/2 -translate-y-1/2`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {activeIndex >= 0 && (
                  <motion.span
                    key={
                      activePlatform.name === "XStream"
                        ? "Xtream"
                        : activePlatform.name
                    }
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.24, ease: "easeOut" }}
                    className="absolute left-[70%] top-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-xs font-medium tracking-tight md:text-base lg:left-3/4 lg:text-lg xl:text-xl"
                  >
                    {activePlatform.name === "XStream"
                      ? "Xtream"
                      : activePlatform.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div
          className={`${styles.platformDetails} ${styles.xtreamDetails} flex min-w-0 flex-col gap-2`}
        >
          <nav
            aria-label="Browse platforms"
            className="flex items-center justify-between gap-1"
          >
            <p className="text-xs tabular-nums opacity-75">
              {String(activeIndex + 1).padStart(2, "0")} / {platforms.length}{" "}
              platforms
            </p>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-inherit hover:bg-white/15 hover:text-inherit"
                aria-label="Previous platform"
                disabled={activeIndex === 0}
                onClick={() => goToPlatform(activeIndex - 1)}
              >
                <ArrowLeft size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-inherit hover:bg-white/15 hover:text-inherit"
                aria-label="Next platform"
                disabled={activeIndex === platforms.length - 1}
                onClick={() => goToPlatform(activeIndex + 1)}
              >
                <ArrowRight size={20} />
              </Button>
            </div>
          </nav>
          <div
            className={styles.detailScroller}
            aria-label={`${activePlatform.name} details`}
          >
            <div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activePlatform.name}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="min-w-0"
                >
                  <PlatformView name={activePlatform.name} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.stackedLayout}>
        {platforms.map((platform) => (
          <div
            key={platform.name}
            className="relative isolate px-2 py-6 md:px-6"
            style={{
              backgroundColor: platform.background,
              color: platform.foreground,
            }}
          >
            <PlatformBackdrop name={platform.name} />
            <div className="mx-auto max-w-[560px]">
              <PlatformView name={platform.name} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
