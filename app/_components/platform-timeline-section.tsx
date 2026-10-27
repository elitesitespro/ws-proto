"use client";

import { Fragment, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { useLenis } from "lenis/react";
import { Icon, type IconName } from "@/components/icon";
import { tick } from "@/lib/haptics";
import { Button } from "@/components/ui/button";
import { PlatformView } from "./platform-view";
import { PlatformBackdrop } from "./platform-backdrop";
import { hueAttrs } from "./platform-showcase-content";
import styles from "./platform-timeline-section.module.css";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from "motion/react";
import { useMediaQuery } from "@/lib/use-media-query";
import { usePauseOffscreen } from "@/lib/use-pause-offscreen";
import { useReducedMotion } from "@/lib/use-reduced-motion";

// Each platform wears its own colour (hueAttrs, the hub's family); the
// section takes the active one's as its fill, with stone ink on it.
export const platforms = [
  { name: "WorldSpace", label: "WorldSpace", category: "Connect", icon: "users" },
  { name: "WorldMeet", label: "WorldMeet", category: "Connect", icon: "video" },
  { name: "XStream", label: "Xtream", category: "Entertainment", icon: "play" },
  { name: "Vsion", label: "Vision", category: "Entertainment", icon: "film" },
  { name: "AI Movie", label: "AI Movie", category: "Entertainment", icon: "sparkle" },
  { name: "Arcade", label: "Arcade", category: "Entertainment", icon: "gamepad" },
  { name: "WorldStore", label: "WorldStore", category: "Lifestyle", icon: "shopping-bag" },
  { name: "WorkWorld", label: "Worldwork", category: "Lifestyle", icon: "briefcase" },
  { name: "Academy", label: "Mastery Academy", category: "Lifestyle", icon: "graduation" },
  { name: "WorldHealth", label: "WorldHealth", category: "Lifestyle", icon: "heart-pulse" },
  { name: "Forex", label: "Forex", category: "Markets", icon: "chart-up" },
  { name: "Crypto", label: "Crypto", category: "Markets", icon: "bitcoin" },
  { name: "Prediction", label: "Prediction", category: "Markets", icon: "target" },
] as const satisfies readonly {
  name: string;
  /** Its name in the product, where that differs from the key (Vsion is Vision). */
  label: string;
  category: string;
  icon: IconName;
}[];
type Platform = (typeof platforms)[number];

// How each platform's section is filled while it shows: "dark" (stone, with
// light text: its backdrop is a dark scene), a paper colour of its own (ink
// text), or, left out, its colour from the family (app/hues.css). Its
// backdrop (platform-backdrop) paints the scene over this.
const scenes: Partial<Record<Platform["name"], "dark" | `#${string}`>> = {
  WorldSpace: "dark",
  WorldMeet: "#fffcf5",
  XStream: "dark",
  Vsion: "dark",
  "AI Movie": "dark",
  Arcade: "#f6f3ec",
  WorldStore: "dark",
  WorkWorld: "dark",
  Academy: "dark",
  WorldHealth: "#f4f8f7",
  Forex: "#f5f1e8",
  Crypto: "dark",
  Prediction: "#f6f3ec",
};

function sectionColours(name: Platform["name"]) {
  const scene = scenes[name];
  const dark = scene === "dark";
  return {
    fill: dark ? "var(--cx-bg)" : (scene ?? "var(--hue)"),
    text: dark ? "var(--cx-text)" : "var(--hue-on)",
  };
}

// The count and the arrows float over the platform's colour or its scene, so
// they sit on liquid glass: light (frosted white, ink) on the pastel fills
// and papers, dark on the dark scenes. The arrows are the dock's quiet buttons.
function navGlassTone(name: Platform["name"]) {
  return scenes[name] === "dark" ? "cx-glass-dark" : "cx-glass-light";
}
const navButtonClass =
  "text-inherit hover:text-inherit disabled:bg-transparent disabled:text-inherit disabled:opacity-40";

const cardAngleStep = 36;
const LAST = platforms.length - 1;
// How far the page scrolls from one platform to the next, in screen heights
// (vh). The page never stops on the way: a few turns of the wheel bring the
// next platform round.
const STEP_VH = 32;
// Seconds to glide to a platform picked on the dial or by the arrows
const GLIDE = 0.8;
// The world under the dial turns with it, a third as fast
const GLOBE_TURN = cardAngleStep / 3;
// The bezel's marks, one every 6°: a longer one at each platform's place
const TICKS = Array.from({ length: 60 }, (_, index) => index * 6);

// With an intro, how far the page scrolls with the section pinned before the
// platforms start, in screen heights (vh): the heading holds, then the dial
// and the details come in
const INTRO_VH = 150;
// With an intro, the section comes up over the last stretch of the dive
// before it, in screen heights: the page above holds its stage (the dive,
// ending in the sky) on screen until its own end, so the heading rises into
// that sky as the dive comes out of the cloud instead of a screen after it.
// The section's own sky stays clear over the stage until the dive's has
// filled the screen, then takes over just before the stage lets go, as the
// section's top passes DIVE_OVERLAP from the bottom of the screen.
const DIVE_OVERLAP = 0.6;

/** How far `v` is through the span [from, to], 0 to 1. */
const along = (v: number, from: number, to: number) => Math.min(Math.max((v - from) / (to - from), 0), 1);
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

// The page scrolls on freely, and the dial eases into each platform's place
// and out again, so wherever the page comes to rest it's all but lined up
function detent(progress: number) {
  const turns = progress * LAST;
  const from = Math.min(Math.floor(turns), LAST - 1);
  return (from + (1 - Math.cos(Math.PI * (turns - from))) / 2) / LAST;
}

// The first platform sits at the pointer as the section pins, the last as it
// lets go. The ones still to come wait below the pointer and the dial turns
// them up into place, so it moves the way the page does as you scroll down.
function orbitAngle(progress: number, index: number) {
  return (index - progress * LAST) * cardAngleStep;
}

// Moving from one platform to the next. The page on the right slides the
// way you're going and fades: the one you're leaving lifts away and goes
// first, the next rises in a beat behind it, so they never sit on top of
// each other.
const SLIDE = [0.22, 1, 0.36, 1] as const;
const page: Variants = {
  enter: (direction: number) => ({ y: direction > 0 ? "28vh" : "-28vh", opacity: 0 }),
  centre: {
    y: "0vh",
    opacity: 1,
    transition: { y: { duration: 0.9, ease: SLIDE }, opacity: { duration: 0.5, delay: 0.26, ease: "easeOut" } },
  },
  exit: (direction: number) => ({
    y: direction > 0 ? "-28vh" : "28vh",
    opacity: 0,
    transition: { y: { duration: 0.7, ease: SLIDE }, opacity: { duration: 0.24, ease: "easeIn" } },
  }),
};
// The colour and scene behind it don't slide past each other (two colours
// would meet at a hard line): the next fades in over the last, which holds
// still underneath until it's covered, both drifting a little the same way.
// (With reduced motion neither has variants, so the switch is instant.)
const scenery: Variants = {
  enter: (direction: number) => ({ y: direction > 0 ? "6vh" : "-6vh", opacity: 0, zIndex: 1 }),
  centre: { y: "0vh", opacity: 1, zIndex: 1, transition: { duration: 0.8, ease: SLIDE } },
  exit: (direction: number) => ({
    y: direction > 0 ? "-6vh" : "6vh",
    opacity: 1,
    zIndex: 0,
    transition: { duration: 0.8, ease: SLIDE },
  }),
};

// The name in the dial rolls the way the page is going
const roll = {
  enter: (direction: number) => ({ y: direction > 0 ? "70%" : "-70%", opacity: 0 }),
  centre: { y: "0%", opacity: 1 },
  exit: (direction: number) => ({ y: direction > 0 ? "-70%" : "70%", opacity: 0 }),
};

/** One word of the intro heading coming up out of a blur as the section
 *  rises into the middle of the screen, a beat after the one before. */
function IntroWord({
  children,
  index,
  arrive,
}: {
  children: string;
  index: number;
  arrive: MotionValue<number>;
}) {
  const start = 0.5 + index * 0.15;
  const opacity = useTransform(arrive, [start, start + 0.35], [0, 1]);
  const y = useTransform(arrive, [start, start + 0.35], [40, 0]);
  const blur = useTransform(arrive, [start, start + 0.25], [16, 0]);
  const filter = useMotionTemplate`blur(${blur}px)`;

  return (
    <motion.span
      className="inline-block motion-reduce:[filter:none]! motion-reduce:[transform:none]! motion-reduce:opacity-100!"
      style={{ opacity, y, filter }}
    >
      {children}
    </motion.span>
  );
}

function PlatformCardFace({
  platform,
  active = false,
}: {
  platform: Platform;
  active?: boolean;
}) {
  const hue = hueAttrs(platform.name);
  return (
    <motion.div
      animate={{
        scale: active ? [1, 1.16, 1.08] : 1,
        rotate: active ? [0, -7, 0] : 0,
      }}
      transition={{ duration: 0.32, times: [0, 0.45, 1], ease: "easeOut" }}
      className="flex size-9 items-center justify-center rounded-card bg-background transition-colors duration-500"
    >
      <div
        data-hue={hue["data-hue"]}
        className={`flex size-7 items-center justify-center rounded-md border-2 bg-[var(--hue)] text-[var(--hue-on)] ${active ? "border-ember" : "border-transparent"}`}
        style={hue.style}
      >
        <Icon name={platform.icon} size={24} tone="current" />
        <span className="sr-only">{platform.label}</span>
      </div>
    </motion.div>
  );
}

function OrbitCard({
  index,
  progress,
  sweep,
  active,
  near,
  onSelect,
}: {
  index: number;
  progress: MotionValue<number>;
  /** An extra turn of the ring, in degrees, while it comes in. */
  sweep: MotionValue<number>;
  active: boolean;
  /** On the visible arc, so it can be clicked. */
  near: boolean;
  onSelect: (index: number) => void;
}) {
  const platform = platforms[index];
  const hue = hueAttrs(platform.name);
  const transform = useTransform([progress, sweep], ([value, turn]: number[]) => {
    const angle = orbitAngle(value, index) + turn;
    // Further round from the pointer, smaller, so the dial reads as a wheel turning away
    const depth = 1 - 0.3 * Math.min(Math.abs(angle) / 96, 1);

    return `translate(-50%, -50%) rotate(calc(${angle}deg + var(--orbit-offset, 0deg))) translateX(calc(var(--orbit-size) / 2)) rotate(calc(${-angle}deg - var(--orbit-offset, 0deg))) scale(${depth})`;
  });
  const opacity = useTransform([progress, sweep], ([value, turn]: number[]) => {
    const distanceFromVisibleArc = Math.abs(orbitAngle(value, index) + turn);

    if (distanceFromVisibleArc <= 84) return 1;
    if (distanceFromVisibleArc >= 96) return 0;
    return (96 - distanceFromVisibleArc) / 12;
  });

  return (
    // Thirteen platforms go more than once round the ring: the hidden ones
    // lie over the visible ones and must let their clicks through
    <motion.li
      className={`absolute left-1/2 top-1/2 ${near ? "" : "pointer-events-none"}`}
      style={{ transform, opacity }}
    >
      {/* The platform at the pointer glows in its colour */}
      <span
        aria-hidden="true"
        data-hue={hue["data-hue"]}
        style={hue.style}
        className={`pointer-events-none absolute inset-0 rounded-card bg-[var(--hue)] blur-xl transition-opacity duration-500 ${active ? "opacity-60" : "opacity-0"}`}
      />
      {/* Click a platform on the dial to go straight to it */}
      <button
        type="button"
        aria-label={`Go to ${platform.label}`}
        aria-current={active || undefined}
        tabIndex={near ? 0 : -1}
        onClick={() => onSelect(index)}
        className={`relative block rounded-card transition-transform duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${active ? "cursor-default" : "cursor-pointer hover:scale-110 active:scale-95"}`}
      >
        <PlatformCardFace platform={platform} active={active} />
      </button>
    </motion.li>
  );
}

type PlatformTimelineSectionProps = {
  /**
   * A heading to open on, as on the globe preview, where the section follows
   * the dive into the first platform's colour. It rises into the middle as
   * the section comes up and holds there; then the page carries on through
   * it as the dial rolls in from the left and the details rise into place.
   */
  intro?: string;
  /** A line under the intro heading, coming up as its last word lands. */
  introLine?: string;
};

export function PlatformTimelineSection({ intro, introLine }: PlatformTimelineSectionProps = {}) {
  const sectionRef = useRef<HTMLElement>(null);
  usePauseOffscreen(sectionRef);
  // The platforms one under another, for short windows and reduced motion:
  // only there, so its thirteen scenes aren't all playing out of sight
  const stacked = useMediaQuery("(max-height: 560px), (prefers-reduced-motion: reduce)");
  // Which platform is at the pointer, and which way the dial last turned
  const [step, setStep] = useState({ index: 0, direction: 1 });
  const activeIndex = step.index;
  const shouldReduceMotion = useReducedMotion();
  const activePlatform = platforms[activeIndex];
  const visiblePlatforms = platforms;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: [intro ? `${INTRO_VH}vh 80px` : "start 80px", "end end"],
  });
  // With an intro: 0 as the section's top comes up into view, 1 once it has
  // pinned; then `entered` runs 0 to 1 over the pinned intro. Without one,
  // everything is in from the start.
  const { scrollYProgress: arrive } = useScroll({
    target: sectionRef,
    offset: ["start end", "start 80px"],
  });
  const { scrollYProgress: opening } = useScroll({
    target: sectionRef,
    offset: ["start 80px", `${INTRO_VH}vh 80px`],
  });
  const entered = useTransform(opening, (v) => (intro ? v : 1));
  // The heading holds, then the page carries on through it: it grows a
  // little and blurs away
  const headingOpacity = useTransform(entered, [0.25, 0.55], [1, 0]);
  const headingScale = useTransform(entered, [0.25, 0.6], [1, 1.12]);
  const headingBlur = useTransform(entered, [0.25, 0.6], [0, 16]);
  const headingFilter = useMotionTemplate`blur(${headingBlur}px)`;
  // The line under it comes up as the heading's last word lands, and goes with it
  const lineOpacity = useTransform([arrive, entered], ([a, v]: number[]) => along(a, 0.8, 1) * (1 - along(v, 0.2, 0.45)));
  const lineY = useTransform(arrive, [0.8, 1], [16, 0]);
  // The dial rolls in from the left, its platforms coming round the ring
  // into place, then its pointer and name
  const stageX = useTransform(entered, (v) => `${-60 * (1 - easeOut(along(v, 0.3, 0.85)))}vw`);
  const stageOpacity = useTransform(entered, [0.3, 0.45], [0, 1]);
  const sweep = useTransform(entered, (v) => 140 * (1 - easeOut(along(v, 0.35, 1))));
  const pointerOpacity = useTransform(entered, [0.8, 1], [0, 1]);
  const labelOpacity = useTransform(entered, [0.7, 0.95], [0, 1]);
  // The platform's details rise into place behind it, the count and arrows
  // first. No blur here: a filter would stop their glass blurring the scene.
  const navOpacity = useTransform(entered, [0.5, 0.75], [0, 1]);
  const navY = useTransform(entered, [0.5, 0.8], [32, 0]);
  const detailsOpacity = useTransform(entered, [0.58, 0.85], [0, 1]);
  const detailsY = useTransform(entered, [0.58, 0.9], [48, 0]);
  const backdropOpacity = useTransform(entered, [0.5, 0.85], [0, 1]);
  // The sky the dive came out into holds behind the heading, then night comes
  // down over it from the top (back up into space, with no grey half-way of a
  // fade) and the first platform's own scene (WorldSpace's is space) comes up
  // on the dark. Coming up over the dive's end, it's clear until the dive's
  // own sky has filled the screen.
  const nightfall = useTransform(entered, (v) => `${-100 + 100 * easeInOut(along(v, 0.3, 0.62))}%`);
  const { scrollYProgress: skyIn } = useScroll({
    target: sectionRef,
    offset: [`start ${Math.round((1.07 - DIVE_OVERLAP) * 100) / 100}`, `start ${Math.round((1 - DIVE_OVERLAP) * 100) / 100}`],
  });
  const skyOpacity = useTransform([skyIn, entered], ([shown, v]: number[]) => shown * (1 - along(v, 0.62, 0.7)));
  // Leaving the last platform, the dial and its scene fade out at their foot
  // instead of being cut off by the section's edge, so the tour's cream runs
  // straight on into the street's
  const { scrollYProgress: leaving } = useScroll({ target: sectionRef, offset: ["end end", "end start"] });
  // (eased, so there's no line across the planet where it starts)
  const footFade = useTransform(leaving, (v) => {
    const fade = Math.round(320 * Math.min(v / 0.12, 1));
    if (fade === 0) return "none";
    const stops = Array.from({ length: 9 }, (_, i) => {
      const t = i / 8;
      return `rgba(0, 0, 0, ${(1 - easeInOut(t)).toFixed(3)}) calc(100% - ${Math.round(fade * (1 - t))}px)`;
    });
    return `linear-gradient(to bottom, ${stops.join(", ")})`;
  });
  // The dial follows the scroll on a light spring, so it settles onto each
  // platform with a little give
  const turned = useTransform(scrollYProgress, detent);
  const orbitProgress = useSpring(turned, {
    stiffness: 280,
    damping: 28,
    mass: 0.6,
  });
  // The pointer holds on whichever platform the dial is nearest
  const pointerTransform = useTransform(orbitProgress, (progress) => {
    const angle = orbitAngle(progress, Math.max(0, Math.min(LAST, Math.round(progress * LAST))));
    return `translate(-50%, -50%) rotate(calc(${angle}deg + var(--orbit-offset, 0deg))) translateX(calc(var(--orbit-size) / 2 + var(--pointer-offset)))`;
  });
  // The bezel turns with the platforms; the world beneath turns slower
  const bezelTransform = useTransform(
    [orbitProgress, sweep],
    ([progress, turn]: number[]) => `rotate(calc(${turn - progress * LAST * cardAngleStep}deg + var(--orbit-offset, 0deg)))`,
  );
  const globeRotate = useTransform(
    [orbitProgress, sweep],
    ([progress, turn]: number[]) => turn / 3 - progress * LAST * GLOBE_TURN,
  );

  // A platform picked on the dial, while the page glides to it
  const picked = useRef<number | null>(null);
  const ticked = useRef(0);
  useMotionValueEvent(orbitProgress, "change", (progress) => {
    const nextIndex = Math.max(0, Math.min(LAST, Math.round(progress * LAST)));
    // The ones it passes on the way don't show
    if (picked.current !== null) {
      if (nextIndex !== picked.current) return;
      picked.current = null;
    }
    // Each platform clicks into place under your thumb
    if (nextIndex !== ticked.current) {
      ticked.current = nextIndex;
      tick();
    }
    setStep((current) =>
      current.index === nextIndex ? current : { index: nextIndex, direction: nextIndex > current.index ? 1 : -1 },
    );
  });

  // Where each platform sits on the page, for the dial and the arrows to glide to
  const stops = () => {
    const section = sectionRef.current;
    // Where the platforms stack (short windows), the page just scrolls
    if (!section || window.matchMedia("(max-height: 560px)").matches) return null;
    const view = document.documentElement.clientHeight;
    // The platforms start after the intro, if there is one
    const lead = intro ? (INTRO_VH / 100) * view : 0;
    const start = window.scrollY + section.getBoundingClientRect().top - 80 + lead;
    const travel = section.offsetHeight - view + 80 - lead;
    return platforms.map((_, index) => start + (travel * index) / LAST);
  };
  const lenis = useLenis();
  const goToPlatform = (index: number) => {
    const to = stops()?.[index];
    if (to === undefined) return;
    if (lenis) lenis.scrollTo(to, { duration: GLIDE, easing: easeInOut, lock: true, force: true });
    else window.scrollTo({ top: to, behavior: "instant" });
  };
  // Its page shows at once, and the dial turns it round to the pointer
  const pickPlatform = (index: number) => {
    if (index === activeIndex || !stops()) return;
    picked.current = index;
    setStep({ index, direction: index > activeIndex ? 1 : -1 });
    goToPlatform(index);
  };

  // On a touchscreen, swipe the platform aside for the next one (or back
  // for the last): it gives a little under your finger as you drag
  const dragX = useMotionValue(0);
  const swipeFrom = useRef<{ x: number; y: number } | null>(null);
  const swipeStart = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch" || shouldReduceMotion) return;
    // Not from something that scrolls across by itself (a row of chips)
    for (let el = event.target as HTMLElement | null; el && el !== event.currentTarget; el = el.parentElement) {
      if (el.scrollWidth > el.clientWidth && /auto|scroll/.test(getComputedStyle(el).overflowX)) return;
    }
    swipeFrom.current = { x: event.clientX, y: event.clientY };
  };
  const swipeMove = (event: PointerEvent<HTMLDivElement>) => {
    const from = swipeFrom.current;
    if (!from) return;
    const dx = event.clientX - from.x;
    if (Math.abs(dx) > Math.abs(event.clientY - from.y)) dragX.set(dx * 0.3);
  };
  const swipeEnd = (event: PointerEvent<HTMLDivElement>) => {
    const from = swipeFrom.current;
    swipeFrom.current = null;
    animate(dragX, 0, { type: "spring", stiffness: 420, damping: 32 });
    if (!from || event.type === "pointercancel") return;
    const dx = event.clientX - from.x;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(event.clientY - from.y) * 1.4) return;
    const to = activeIndex + (dx < 0 ? 1 : -1);
    if (to >= 0 && to <= LAST) goToPlatform(to);
  };
  // The first time the platforms come in on a touchscreen, the page leans
  // aside and back, once, to show it can be swiped
  const nudged = useRef(false);
  useMotionValueEvent(entered, "change", (v) => {
    if (v < 1 || nudged.current || shouldReduceMotion) return;
    nudged.current = true;
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    animate(dragX, [0, -28, 0], { duration: 0.9, delay: 0.5, ease: "easeInOut" });
  });

  const activeHue = hueAttrs(activePlatform.name);
  const activeColours = sectionColours(activePlatform.name);
  // The intro sits in the first platform's colour: the sky the dive came out into
  const firstHue = hueAttrs(platforms[0].name);

  return (
    <section
      ref={sectionRef}
      id={intro ? "discover" : undefined}
      aria-labelledby="platform-timeline-heading"
      data-hue={activeHue["data-hue"]}
      className={`${styles.section} ${intro ? styles.overDive : ""} transition-colors duration-500`}
      style={
        {
          ...activeHue.style,
          "--dive-overlap": `${DIVE_OVERLAP * 100}svh`,
          backgroundColor: activeColours.fill,
          color: activeColours.text,
          "--timeline-background": "var(--hue)",
          "--timeline-height": `${100 + (intro ? INTRO_VH : 0) + LAST * STEP_VH}svh`,
        } as CSSProperties
      }
    >
      {intro && (
        <div aria-hidden="true" className={styles.sky} {...firstHue}>
          <motion.div className={styles.skyFill} style={{ opacity: skyOpacity }}>
            <motion.div className={styles.nightfall} style={{ y: nightfall }} />
          </motion.div>
        </div>
      )}
      {intro ? (
        <div className={styles.intro} {...firstHue}>
          <div className={styles.introStage}>
            <motion.h2
              id="platform-timeline-heading"
              style={{ opacity: headingOpacity, scale: headingScale, filter: headingFilter }}
              className="text-center text-4xl leading-[1.05] font-normal lg:text-display-sm motion-reduce:opacity-100! motion-reduce:[filter:none]! motion-reduce:[transform:none]!"
            >
              {intro.split(" ").map((word, index) => (
                <Fragment key={`${index}-${word}`}>
                  {index > 0 ? " " : null}
                  <IntroWord index={index} arrive={arrive}>
                    {word}
                  </IntroWord>
                </Fragment>
              ))}
            </motion.h2>
            {introLine && (
              <motion.p
                style={{ opacity: lineOpacity, y: lineY }}
                className={`${styles.introLine} motion-reduce:opacity-100! motion-reduce:[transform:none]!`}
              >
                {/* A sentence to a line */}
                {introLine.split(/(?<=\.)\s+/).map((sentence) => (
                  <span key={sentence} className="block">
                    {sentence}
                  </span>
                ))}
              </motion.p>
            )}
          </div>
        </div>
      ) : (
        <h2 id="platform-timeline-heading" className="sr-only">
          Explore WorldStreet platforms
        </h2>
      )}

      <motion.div
        className={`${styles.orbitLayout} sticky top-10 h-[calc(100svh-80px)] w-full`}
        style={{ maskImage: footFade, WebkitMaskImage: footFade }}
      >
        <motion.div
          className="absolute inset-0 -z-10"
          style={intro ? { opacity: backdropOpacity } : undefined}
        >
          {/* Each platform's colour and scene, a screen tall, scrolling on
              with its page on the right */}
          <AnimatePresence initial={false} custom={step.direction}>
            <motion.div
              key={activePlatform.name}
              custom={step.direction}
              variants={shouldReduceMotion ? undefined : scenery}
              initial="enter"
              animate="centre"
              exit="exit"
              className={styles.scenery}
              {...hueAttrs(activePlatform.name)}
              style={{
                ...hueAttrs(activePlatform.name).style,
                x: "-50%",
                backgroundColor: activeColours.fill,
              }}
            >
              <PlatformBackdrop name={activePlatform.name} />
            </motion.div>
          </AnimatePresence>
        </motion.div>
        <motion.div
          className={`${styles.orbitStage} relative min-w-0`}
          style={{ x: stageX, opacity: stageOpacity }}
        >
          {/* The world at night, seen from over the pole, turning as the dial does */}
          <div aria-hidden="true" className={styles.orbitCutout}>
            <motion.div className={styles.globe} style={{ rotate: globeRotate }} />
          </div>
          <div aria-hidden="true" className={styles.orbitCircle}>
            <motion.svg
              viewBox="-100 -100 200 200"
              className={styles.bezel}
              style={{ transform: bezelTransform }}
            >
              <circle r="99.5" className={styles.bezelRail} />
              {TICKS.map((angle) => (
                <line
                  key={angle}
                  x1="99"
                  x2={angle % cardAngleStep === 0 ? 94 : 97}
                  transform={`rotate(${angle})`}
                  className={angle % cardAngleStep === 0 ? styles.tickMajor : styles.tick}
                />
              ))}
            </motion.svg>
          </div>

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
                  sweep={sweep}
                  active={activeIndex === index}
                  near={Math.abs(index - activeIndex) <= 2}
                  onSelect={pickPlatform}
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
              style={{ transform: pointerTransform, opacity: pointerOpacity }}
            />
          </div>

          {!shouldReduceMotion && (
            <motion.div
              aria-hidden="true"
              className={`${styles.orbitLabel} absolute left-0 top-1/2 size-[var(--orbit-size)] -translate-x-1/2 -translate-y-1/2`}
              style={{ opacity: labelOpacity }}
            >
              <div className="absolute left-[70%] top-1/2 h-12 w-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden lg:left-3/4">
                <AnimatePresence initial={false} custom={step.direction}>
                  <motion.div
                    key={activePlatform.name}
                    custom={step.direction}
                    variants={roll}
                    initial="enter"
                    animate="centre"
                    exit="exit"
                    transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 text-center [text-shadow:0_1px_12px_rgba(12,10,9,0.9)]"
                  >
                    <span className="text-xs opacity-60">{activePlatform.category}</span>
                    <span className="text-xs font-medium tracking-tight md:text-base lg:text-lg xl:text-xl">
                      {activePlatform.label}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          className={`${styles.platformDetails} ${styles.xtreamDetails} flex min-w-0 flex-col gap-2`}
          style={{ x: dragX }}
          onPointerDown={swipeStart}
          onPointerMove={swipeMove}
          onPointerUp={swipeEnd}
          onPointerCancel={swipeEnd}
        >
          <motion.nav
            aria-label="Browse platforms"
            className={`${navGlassTone(activePlatform.name)} relative z-10 flex items-center justify-between gap-1`}
            style={{ opacity: navOpacity, y: navY }}
          >
            <p className="cx-liquid cx-liquid--pill flex h-[48px] items-center px-cx-5 text-xs tabular-nums">
              {String(activeIndex + 1).padStart(2, "0")} / {platforms.length}{" "}
              platforms
            </p>
            <div className="cx-liquid cx-liquid-dock">
              <Button
                variant="ghost"
                size="icon-sm"
                className={navButtonClass}
                aria-label="Previous platform"
                disabled={activeIndex === 0}
                onClick={() => goToPlatform(activeIndex - 1)}
              >
                <Icon name="arrow-left" size={20} tone="current" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className={navButtonClass}
                aria-label="Next platform"
                disabled={activeIndex === platforms.length - 1}
                onClick={() => goToPlatform(activeIndex + 1)}
              >
                <Icon name="arrow-right" size={20} tone="current" />
              </Button>
            </div>
          </motion.nav>
          <motion.div
            className={styles.detailScroller}
            aria-label={`${activePlatform.label} details`}
            style={{ opacity: detailsOpacity, y: detailsY }}
          >
            <div className={styles.detailPages}>
              <AnimatePresence mode="popLayout" initial={false} custom={step.direction}>
                <motion.div
                  key={activePlatform.name}
                  custom={step.direction}
                  variants={shouldReduceMotion ? undefined : page}
                  initial="enter"
                  animate="centre"
                  exit="exit"
                  className="min-w-0"
                  style={{ color: activeColours.text }}
                >
                  <PlatformView name={activePlatform.name} />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
      {stacked && (
        <div className={styles.stackedLayout}>
          {platforms.map((platform) => {
            const hue = hueAttrs(platform.name);
            const colours = sectionColours(platform.name);
            return (
              <div
                key={platform.name}
                data-hue={hue["data-hue"]}
                className="relative isolate px-2 py-6 md:px-6"
                style={{
                  ...hue.style,
                  backgroundColor: colours.fill,
                  color: colours.text,
                }}
              >
                <PlatformBackdrop name={platform.name} />
                <div className="mx-auto max-w-[560px]">
                  <PlatformView name={platform.name} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
