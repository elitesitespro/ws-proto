"use client";

import { useRef, useState } from "react";
import {
  BriefcaseBusiness,
  Gamepad2,
  GraduationCap,
  Play,
  ShoppingBag,
  UsersRound,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

const platforms = [
  { name: "WorldSpace", category: "Connect", Icon: UsersRound, color: "bg-amber-400 text-[#070405]" },
  { name: "XStream", category: "Watch & create", Icon: Play, color: "bg-violet-600 text-white" },
  { name: "WorldStore", category: "Work & shop", Icon: ShoppingBag, color: "bg-emerald-500 text-white" },
  { name: "WorkWorld", category: "Work & shop", Icon: BriefcaseBusiness, color: "bg-blue-600 text-white" },
  { name: "Academy", category: "Learn & wellness", Icon: GraduationCap, color: "bg-orange-500 text-white" },
  { name: "Arcade", category: "Play & markets", Icon: Gamepad2, color: "bg-pink-600 text-white" },
] as const;

const cardAngleStep = 36;
type Platform = (typeof platforms)[number];

function PlatformCardFace({ platform, active = false }: { platform: Platform; active?: boolean }) {
  return (
    <motion.div
      animate={{ scale: active ? 1.08 : 1 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className={`flex size-7 items-center justify-center rounded-lg ring-8 ring-[#070405] ${platform.color}`}
    >
      <platform.Icon aria-hidden="true" className="size-3" />
      <span className="sr-only">{platform.name}</span>
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
    const angle = (value * (platforms.length + 1) - index - 1) * cardAngleStep;

    return `translate(-50%, -50%) rotate(${angle}deg) translateX(calc(var(--orbit-size) / 2)) rotate(${-angle}deg)`;
  });

  return (
    <motion.li className="absolute left-1/2 top-1/2" style={{ transform }}>
      <PlatformCardFace platform={platform} active={active} />
    </motion.li>
  );
}

export function PlatformTimelineSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 80px", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const nextIndex = Math.min(
      platforms.length - 1,
      Math.floor(progress * (platforms.length + 1)) - 1,
    );
    setActiveIndex((current) => current === nextIndex ? current : nextIndex);
  });

  return (
    <section
      ref={sectionRef}
      aria-labelledby="platform-timeline-heading"
      className={`bg-[#070405] text-white ${shouldReduceMotion ? "" : "h-[520svh]"}`}
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
            className="absolute left-0 top-1/2 size-[var(--orbit-size)] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/35"
          />

          <ol
            aria-label="WorldStreet platforms"
            className="absolute left-0 top-1/2 size-[var(--orbit-size)] -translate-x-1/2 -translate-y-1/2"
          >
            {platforms.map((platform, index) => (
              shouldReduceMotion ? (
                <li
                  key={platform.name}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${(index - (platforms.length - 1) / 2) * cardAngleStep}deg) translateX(calc(var(--orbit-size) / 2)) rotate(${-(index - (platforms.length - 1) / 2) * cardAngleStep}deg)`,
                  }}
                >
                  <PlatformCardFace platform={platform} />
                </li>
              ) : (
                <OrbitCard
                  key={platform.name}
                  index={index}
                  progress={scrollYProgress}
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
                    className="absolute left-3/4 top-[30%] w-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-xs font-medium tracking-tight md:text-lg xl:text-xl"
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
                  <p className="text-xs text-white/65 md:text-sm">
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
