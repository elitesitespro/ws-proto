"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionStyle } from "motion/react";
import { cn } from "cn";
import { NightGlobe, type GlobePlacement, type NightGlobeHandle } from "@/components/globe/night-globe";
import { usePauseOffscreen } from "@/lib/use-pause-offscreen";
import { hueAttrs, type ShowcasePlatformName } from "@/app/_components/platform-showcase-content";
import { GlobeIntro } from "./globe-intro";
import { GlobePins } from "./globe-pins";
import { GlobeCityLayer, useGlobeCity } from "./globe-city";
import { HeroCopy } from "./hero-copy";
import { HeroLoader } from "./hero-loader";

// Where the planet sits: beside the copy in the hero, then centred and sunk
// low under the statement, its top a horizon behind the words. On a phone
// it's centred under the headline and its button, big enough to run off the
// sides and the foot, and just sinks further.
const HERO = { wide: { x: 0.74, y: 0.58, radius: 0.56 }, narrow: { x: 0.5, y: 0.74, radius: 0.33 } };
const SETTLED = { wide: { x: 0.5, y: 1.22, radius: 0.7 }, narrow: { x: 0.5, y: 1.14, radius: 0.46 } };
// How far the globe fades back: as the statement arrives, then a little more
// while its words light, so the line reads clear of the planet
const SETTLED_OPACITY = 0.35;
const LIT_OPACITY = 0.22;
// How far scrolling turns the planet on top of its own turning, the way it
// already goes (radians): about 30° on the way down, 15° more while the words light
const ARRIVE_SPIN = -0.52;
const HOLD_SPIN = -0.26;

// After the statement: the globe rises whole into the middle of the page and
// the sun comes round it, then the page dives down into it. The camera is
// a real perspective one by then (lens 1), so the dive reads as a descent.
const CENTRE = { wide: { x: 0.5, y: 0.5, radius: 0.34, lens: 1 }, narrow: { x: 0.5, y: 0.5, radius: 0.2, lens: 1 } };
// How close the dive gets: the screen is all cloud from about 10.3
const DIVE_RADIUS = 10.6;
// The dive's scroll, in screen heights from the moment the statement lets go
// (the spacer below is DIVE_SCREENS tall: keep the two in step)
const DIVE_SCREENS = 3.5;
const RISE = [0, 1]; // the globe rises to the middle as the statement leaves
const SUNRISE = [0.45, 1.7]; // night to day
const CLOUDS = [0.75, 1.9]; // the clouds come in behind the sun
const DESCENT = [1.2, 3.2]; // the dive: slow at first, then falling faster
const RISE_SPIN = -0.4; // a little more turn as it rises, then it holds still for the dive
// Out through the bottom of the cloud into the sky the next section opens
// on (WorldSpace's blue), so the page carries on in it without an edge: the
// sky opens from the middle, then fills the screen as the stage lets go
const SKY = hueAttrs("WorldSpace");
const SKY_OPENS = [3.12, 3.45];
const SKY_FILLS = [3.3, 3.5];

const mix = (a: GlobePlacement, b: GlobePlacement, k: number): GlobePlacement => ({
  x: a.x + (b.x - a.x) * k,
  y: a.y + (b.y - a.y) * k,
  radius: a.radius + (b.radius - a.radius) * k,
  lens: (a.lens ?? 0) + ((b.lens ?? 0) - (a.lens ?? 0)) * k,
});
const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
/** How far `v` is through the span [from, to], 0 to 1. */
const along = (v: number, [from, to]: number[]) => Math.min(Math.max((v - from) / (to - from), 0), 1);

// Throwaway spike: while the page loads, a loader holds the screen, then
// hands over to the globe as it flies into the hero. The hero's copy on the
// left, the globe on the right. The globe turns to the visitor's side of the
// world; the headline's platform colours its city lights and flies live
// cards out from there to cities; holding a pin, or opening a city, pauses
// both the word and the globe.
// Scrolling on, the globe stays on screen: the copy and cards leave, the
// planet glides to the centre and sinks, and the statement rises over it.
// Past the statement it rises whole, turns from night to a cloudy day in
// its real colours, and the page dives down into it, through the clouds
// and out into the sky the next section opens on.
export function GlobePreviewSection() {
  const globeRef = useRef<NightGlobeHandle>(null);
  const pinsRef = useRef<HTMLDivElement>(null);
  const cityLayerRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLElement>(null);
  const diveRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  usePauseOffscreen(rootRef);
  const [active, setActive] = useState<{ platform: ShowcasePlatformName; rgb: string }>();
  const [held, setHeld] = useState(false);
  const [landed, setLanded] = useState(false);
  // Past halfway to the statement: the globe is scenery, not something to play with
  const [away, setAway] = useState(false);
  // Diving: the planet stops its own turning, which would race past at that zoom
  const [diving, setDiving] = useState(false);
  const onWordChange = useCallback((platform: ShowcasePlatformName, rgb: string) => setActive({ platform, rgb }), []);
  const onLanded = useCallback(() => setLanded(true), []);
  // The loader: the planet showing, then the dark opening onto the hero (the
  // copy comes in, the lights take the word's colour), then the planet in its
  // place (its cards fly out)
  const [globeReady, setGlobeReady] = useState(false);
  const [opened, setOpened] = useState(false);
  const [settled, setSettled] = useState(false);
  const onGlobeReady = useCallback(() => setGlobeReady(true), []);
  const onOpen = useCallback(() => setOpened(true), []);
  const onSettled = useCallback(() => setSettled(true), []);
  const city = useGlobeCity();
  const { open: cityOpen, close: closeCity } = city;

  // 0 with the hero up, 1 once the statement has risen to the middle
  const { scrollYProgress: arrive } = useScroll({ target: introRef, offset: ["start end", "start start"] });
  // From just before it settles until it lets go; the words are all lit a
  // little before the end, so the whole line holds for a moment
  const { scrollYProgress: hold } = useScroll({ target: introRef, offset: ["start 0.1", "end end"] });
  const reveal = useTransform(hold, [0, 0.8], [0, 1]);
  // 0 as the statement lets go, 1 at the end of the dive
  const { scrollYProgress: travel } = useScroll({ target: diveRef, offset: ["start end", "end end"] });
  const leave = useTransform(travel, [0, 0.55 / DIVE_SCREENS], [0, 1]);

  // The copy lifts away a little faster than the page, the cards go first
  const copyOpacity = useTransform(arrive, [0, 0.45], [1, 0]);
  const copyY = useTransform(arrive, [0, 0.6], [0, -64]);
  const cueOpacity = useTransform(arrive, [0, 0.15], [1, 0]);
  const pinsShown = useTransform(arrive, [0, 0.3], [1, 0]);
  const pinsPointer = useTransform(arrive, (v) => (v > 0.1 ? "none" : "auto"));
  const globeOpacity = useTransform([arrive, hold, travel], ([a, h, t]: number[]) => {
    // Back to full strength as it rises out from behind the statement
    if (t > 0) return LIT_OPACITY + (1 - LIT_OPACITY) * along(t * DIVE_SCREENS, [0, 0.8]);
    return a < 1 ? 1 + (SETTLED_OPACITY - 1) * a : SETTLED_OPACITY + (LIT_OPACITY - SETTLED_OPACITY) * Math.min(h / 0.8, 1);
  });
  // The planet's lower half dissolves into the canvas while it sits low, so
  // it never meets the edge of the screen hard; gone again once it rises
  const floorOpacity = useTransform([arrive, travel], ([a, t]: number[]) => along(a, [0.3, 1]) * (1 - along(t * DIVE_SCREENS, [0, 0.6])));
  const skyOpacity = useTransform(travel, (t) => along(t * DIVE_SCREENS, [SKY_OPENS[0], SKY_OPENS[0] + 0.2]));
  const skyScale = useTransform(travel, (t) => 0.4 + 2.4 * easeInOut(along(t * DIVE_SCREENS, SKY_OPENS)));
  const skyFill = useTransform(travel, (t) => along(t * DIVE_SCREENS, SKY_FILLS));

  // The globe glides to the centre and sinks as the statement arrives, turning
  // a little as it goes, and keeps turning gently while the words light. Then
  // it rises whole to the middle, the sun comes up over it and the clouds
  // gather, and the camera falls towards it.
  const stage = () => {
    // Under reduced motion the globe stays put, and the statement sits below it
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const globe = globeRef.current;
    if (!globe) return;
    const a = arrive.get();
    const v = travel.get() * DIVE_SCREENS;
    const k = easeInOut(Math.min(a, 1));
    const size = window.innerWidth < 768 ? "narrow" : "wide";
    const centre = CENTRE[size];
    let placement: GlobePlacement | null = a <= 0 ? null : mix(HERO[size], SETTLED[size], k);
    if (v > 0) placement = mix(SETTLED[size], centre, easeInOut(along(v, RISE)));
    if (v > DESCENT[0]) {
      // Zooming by a constant ratio per step reads as a steady fall; the
      // power holds it nearly still at first, with the whole planet in view
      const fall = along(v, DESCENT) ** 2;
      placement = { ...centre, radius: centre.radius * (DIVE_RADIUS / centre.radius) ** fall };
    }
    globe.frame(placement);
    globe.spin(ARRIVE_SPIN * k + HOLD_SPIN * hold.get() + RISE_SPIN * easeInOut(along(v, [0, 2])));
    globe.daylight(easeInOut(along(v, SUNRISE)));
    globe.clouds(easeInOut(along(v, CLOUDS)));
    setDiving(v > DESCENT[0]);
  };
  useMotionValueEvent(arrive, "change", (v) => {
    setAway(v > 0.5);
    stage();
  });
  useMotionValueEvent(hold, "change", stage);
  useMotionValueEvent(travel, "change", stage);

  useEffect(() => {
    if (away) closeCity();
  }, [away, closeCity]);

  return (
    <div ref={rootRef} className="relative -mt-10 bg-background" data-loading={opened ? undefined : ""}>
      <HeroLoader
        globe={globeRef}
        stage={stageRef}
        hero={HERO}
        globeReady={globeReady}
        onOpen={onOpen}
        onDone={onSettled}
      />
      {/* The stage: the globe and its cards, held on screen behind the hero, the statement and the dive */}
      <div className="absolute inset-0">
        <motion.div
          ref={stageRef}
          style={{ "--layer-shown": pinsShown, "--layer-pointer": pinsPointer } as MotionStyle}
          className="sticky top-0 h-svh overflow-hidden motion-reduce:relative"
        >
          <motion.div style={{ opacity: globeOpacity }} className={cn("absolute inset-0", away && "pointer-events-none")}>
            <NightGlobe
              ref={globeRef}
              placement={HERO.wide}
              mobilePlacement={HERO.narrow}
              lights={away || !opened ? undefined : active?.rgb}
              pins={[pinsRef, cityLayerRef]}
              paused={held || !!cityOpen || diving}
              onReady={onGlobeReady}
              {...city.globeProps}
            />
          </motion.div>
          <motion.div
            aria-hidden="true"
            style={{ opacity: floorOpacity }}
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-background to-transparent"
          />
          <div
            aria-hidden="true"
            data-hue={SKY["data-hue"]}
            style={SKY.style}
            className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden"
          >
            <motion.div
              style={{ opacity: skyOpacity, scale: skyScale }}
              className="absolute top-1/2 left-1/2 size-[100vmax] -translate-1/2 rounded-full bg-[radial-gradient(closest-side,var(--hue)_40%,transparent)]"
            />
            <motion.div style={{ opacity: skyFill }} className="absolute inset-0 bg-[var(--hue)]" />
          </div>
          <GlobePins
            platform={settled ? active?.platform : undefined}
            globe={globeRef}
            layer={pinsRef}
            copy={copyRef}
            onHoldChange={setHeld}
            onLanded={onLanded}
            dimmed={!!cityOpen}
            quiet={away}
          />
          <GlobeCityLayer layer={cityLayerRef} globe={globeRef} hovered={city.hovered} open={cityOpen} onClose={closeCity} />
        </motion.div>
      </div>

      <section
        aria-labelledby="globe-preview-heading"
        className="pointer-events-none relative isolate flex min-h-svh w-full items-center overflow-hidden pt-10 text-foreground"
      >
        <HeroCopy
          copyRef={copyRef}
          opacity={copyOpacity}
          y={copyY}
          cueOpacity={cueOpacity}
          onWordChange={onWordChange}
          paused={held || !!cityOpen}
          waiting={!landed}
        />
      </section>

      <GlobeIntro sectionRef={introRef} reveal={reveal} leave={leave} />
      {/* The dive's scroll: nothing in it but the globe on the stage behind.
          DIVE_SCREENS tall; under reduced motion there's no dive. */}
      <div ref={diveRef} aria-hidden="true" className="h-[350svh] motion-reduce:hidden" />
    </div>
  );
}
