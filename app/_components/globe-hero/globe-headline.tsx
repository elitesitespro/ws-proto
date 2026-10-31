"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "cn";
import { hueAttrs, type ShowcasePlatformName } from "@/app/_components/platform-showcase-content";
import entrance from "./hero-copy.module.css";

// A word for each of the main WorldStreet platforms, worn in that platform's
// hub colour. Trading leads, in WorldStreet's own gold rather than Forex's
// jade (Owen, 30 Oct 2026: "not going to be green"), so the headline opens on
// the brand; the rest are mixed so neighbouring words come from different
// parts of life.
const words: readonly { word: string; platform: ShowcasePlatformName; gold?: boolean }[] = [
  { word: "trading", platform: "Forex", gold: true },
  { word: "streaming", platform: "XStream" },
  { word: "chatting", platform: "WorldSpace" },
  { word: "gaming", platform: "Arcade" },
  { word: "shopping", platform: "WorldStore" },
  { word: "learning", platform: "Academy" },
  { word: "investing", platform: "Crypto" },
];
const spoken = `${words.slice(0, -1).map((w) => w.word).join(", ")} and ${words[words.length - 1].word}`;
const LETTERS = "abcdefghijklmnopqrstuvwxyz";
const HOLD_MS = 4500; // how long each word rests, with time to look at its pins on the globe
const LOCK_MS = 110; // gap between one letter locking in and the next
const SHUFFLE_MS = 80; // how often the unlocked letters reshuffle

type Glyph = { char: string; locked: boolean };

const settled = (word: string): Glyph[] => [...word].map((char) => ({ char, locked: true }));

/** `from` mid-way to `to`: letters lock in left to right, the rest shuffle. */
function shuffle(from: string, to: string, elapsed: number): Glyph[] {
  const locked = Math.floor(elapsed / LOCK_MS);
  const glyphs: Glyph[] = [];
  for (let i = 0; i < Math.max(from.length, to.length); i++) {
    if (i >= locked) glyphs.push({ char: LETTERS[Math.floor(Math.random() * LETTERS.length)], locked: false });
    else if (i < to.length) glyphs.push({ char: to[i], locked: true });
  }
  return glyphs;
}

type GlobeHeadlineProps = {
  /** Called with the current platform and its colour as "r, g, b" each time the word changes. */
  onWordChange?: (platform: ShowcasePlatformName, rgb: string) => void;
  /** Holds the current word (and its bar), e.g. while one of its pins is under the pointer. */
  paused?: boolean;
  /** Keeps the first word up, its bar empty, until this turns false (the
   *  globe's intro has landed), then gives it a full rest from there. */
  waiting?: boolean;
  /** Its place in the hero's entrance on load (hero-copy.module.css): the
   *  line rises in at this step, the word and its bar at the next. Left out,
   *  both are simply there. */
  rise?: number;
};

export function GlobeHeadline({ onWordChange, paused = false, waiting = false, rise }: GlobeHeadlineProps) {
  const [glyphs, setGlyphs] = useState(() => settled(words[0].word));
  const [current, setCurrent] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const pausedRef = useRef(paused);
  const waitingRef = useRef(waiting);

  useEffect(() => {
    pausedRef.current = paused;
    waitingRef.current = waiting;
  }, [paused, waiting]);

  // The colour lives in the hub's CSS (app/hues.css), so read it off the word
  useEffect(() => {
    const word = wordRef.current;
    if (word && onWordChange) onWordChange(words[current].platform, getComputedStyle(word).getPropertyValue("--hue-rgb").trim());
  }, [current, onWordChange]);

  useEffect(() => {
    const heading = headingRef.current;
    if (!heading || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let index = 0;
    let onScreen = false;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
    });
    observer.observe(heading);

    const play = (from: string, to: string) => {
      const start = performance.now();
      const duration = LOCK_MS * Math.max(from.length, to.length);
      let shown = "";
      const step = (now: number) => {
        const elapsed = now - start;
        if (elapsed >= duration) {
          setGlyphs(settled(to));
          return;
        }
        // Only re-render when a letter locks or the shuffle ticks over
        const beat = `${Math.floor(elapsed / LOCK_MS)}:${Math.floor(elapsed / SHUFFLE_MS)}`;
        if (beat !== shown) {
          shown = beat;
          setGlyphs(shuffle(from, to, elapsed));
        }
        frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };

    // The word's rest only runs while it's free to move on: not before the
    // globe's intro has landed, not while held, hidden or scrolled away. The
    // bar under it shows how far along it is, and the word moves on when it's full.
    let rested = 0;
    let last = performance.now();
    let clock = 0;
    const run = (now: number) => {
      const dt = Math.min(now - last, 100);
      last = now;
      if (!waitingRef.current && !pausedRef.current && onScreen && !document.hidden) rested += dt;
      if (rested >= HOLD_MS) {
        rested = 0;
        const from = words[index].word;
        index = (index + 1) % words.length;
        // The colour turns over as the shuffle starts, so the scramble hides the change
        setCurrent(index);
        play(from, words[index].word);
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${(rested / HOLD_MS).toFixed(4)})`;
      clock = requestAnimationFrame(run);
    };
    clock = requestAnimationFrame(run);

    return () => {
      cancelAnimationFrame(clock);
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  // "gold" has no entry in app/hues.css, so it wears the [data-hue] defaults:
  // WorldStreet gold, its pins on the globe too
  const hue = words[current].gold ? { "data-hue": "gold", style: {} } : hueAttrs(words[current].platform);
  const rising = rise === undefined ? undefined : entrance.rise;
  const step = (n: number) => (rise === undefined ? undefined : ({ "--rise": rise + n } as CSSProperties));

  return (
    <h1
      ref={headingRef}
      id="globe-preview-heading"
      className="cx-h1 max-w-[560px] bg-none text-3xl leading-[56px] md:text-4xl md:leading-[64px]"
    >
      {/* The line wears the heading's gradient itself, not the h1: text that
          rises in on its own drops out of a parent's clipped gradient and
          would show nothing until it landed */}
      <span className={cn("block bg-[image:var(--cx-heading-hero)] bg-clip-text", rising)} style={step(0)}>
        Your world of
      </span>
      <span className="sr-only"> {spoken}</span>
      <span
        ref={wordRef}
        aria-hidden="true"
        data-hue={hue["data-hue"]}
        style={{ ...hue.style, ...step(1) }}
        className={cn("block", rising)}
      >
        <span className="block text-(--hue-ink) [-webkit-text-fill-color:var(--hue-ink)]">
          {glyphs.map((glyph, i) => (
            <span key={i} className={glyph.locked ? undefined : "opacity-40"}>
              {glyph.char}
            </span>
          ))}
        </span>
        {/* How long until the next word: a hairline that fills in the platform's colour */}
        <span className="mt-1 block h-[2px] w-[96px] overflow-hidden rounded-pill bg-white/10 motion-reduce:hidden max-md:mx-auto md:w-[120px]">
          <span
            ref={barRef}
            className="block h-full origin-left rounded-pill bg-[var(--hue)] transition-[background-color] duration-500"
            style={{ transform: "scaleX(0)" }}
          />
        </span>
      </span>
    </h1>
  );
}
