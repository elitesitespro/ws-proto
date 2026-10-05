"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { ArrowRight, Check, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import s from "./walkthrough.module.css";

export type Playback = { stage: number; progress: number };
type Props = {
  brand: string;
  captions: readonly string[];
  actions: readonly string[];
  tone: "entertainment" | "lifestyle" | "markets";
  children: (state: Playback) => ReactNode;
};

export function Walkthrough(props: Props) {
  const [run, setRun] = useState(0);
  return (
    <PlaybackScene key={run} {...props} replay={() => setRun((v) => v + 1)} />
  );
}
function PlaybackScene({
  brand,
  captions,
  actions,
  tone,
  children,
  replay,
}: Props & { replay: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const clock = useRef(0);
  const [time, setTime] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    const stop = () => {
      clearInterval(timer);
      timer = undefined;
    };
    const sync = () => {
      stop();
      if (!visible || document.hidden) return;
      if (motion.matches) {
        clock.current = 9000;
        setTime(9000);
        return;
      }
      if (paused || clock.current >= 9000) return;
      timer = setInterval(() => {
        clock.current = Math.min(9000, clock.current + 100);
        setTime(clock.current);
        if (clock.current === 9000) stop();
      }, 100);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.intersectionRatio >= 0.6;
        sync();
      },
      { threshold: [0, 0.6] },
    );
    observer.observe(node);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
    };
  }, [paused]);
  const stage = time < 2000 ? 0 : time < 4000 ? 1 : time < 6500 ? 2 : 3;
  const next = () => {
    const nextTime = [2000, 4000, 6500][stage];
    if (nextTime === undefined) {
      replay();
      return;
    }
    clock.current = nextTime;
    setTime(nextTime);
  };
  return (
    <div
      ref={root}
      className={`${s.scene} ${s[tone]}`}
      data-stage={stage}
      data-complete={time === 9000}
      data-paused={paused}
    >
      <header className={s.header}>
        <span>{brand}</span>
        <span className={s.demo}>Demo</span>
        <Button
          variant="ghost"
          size="icon"
          className={s.iconButton}
          aria-label={paused ? "Play walkthrough" : "Pause walkthrough"}
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
        >
          {paused ? <Play size={20} /> : <Pause size={20} />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={s.iconButton}
          aria-label="Replay walkthrough"
          onClick={replay}
        >
          <RotateCcw size={20} />
        </Button>
      </header>
      <div className={s.body}>{children({ stage, progress: time / 9000 })}</div>
      <footer className={s.footer}>
        <div className={s.steps} aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <i key={i} data-done={stage >= i} />
          ))}
        </div>
        <p aria-live="polite">{captions[stage]}</p>
        <Button
          className={s.action}
          onClick={next}
          data-pressing={
            !paused &&
            ((time >= 1700 && time < 2000) ||
              (time >= 3700 && time < 4000) ||
              (time >= 6200 && time < 6500))
          }
        >
          {actions[stage]}
          {stage === 3 ? <RotateCcw size={20} /> : <ArrowRight size={20} />}
        </Button>
      </footer>
    </div>
  );
}
export function Photo({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={`${s.photo} ${className}`}>
      <Image
        src={`/assets/images/${src}`}
        alt={alt}
        fill
        sizes="(max-width: 600px) 280px, 800px"
      />
    </div>
  );
}
export function Status({ children }: { children: ReactNode }) {
  return (
    <span className={s.status}>
      <Check size={20} />
      {children}
    </span>
  );
}
export function Chart({ progress = 1 }: { progress?: number }) {
  return (
    <svg
      className={s.chart}
      viewBox="0 0 600 180"
      preserveAspectRatio="none"
      aria-label="Illustrative price movement"
      role="img"
    >
      <path d="M0 45H600 M0 90H600 M0 135H600" className={s.gridLine} />
      <path
        d="M0 140L35 132L70 150L100 106L145 114L180 75L215 98L260 62L300 83L340 40L370 57L410 29L450 68L485 37L530 50L570 15L600 24"
        pathLength="1"
        style={{ strokeDasharray: 1, strokeDashoffset: 1 - progress }}
        className={s.chartLine}
      />
    </svg>
  );
}
