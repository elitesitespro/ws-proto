"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { FIRST_TURN, TURN_ACTIVE, TURN_IDLE, acrossFor, dotsFor, drawGlobe, globePoints, talking } from "./globe-draw";

/**
 * Vivid's mark, as the hub draws it (worldstreet-hub components/vivid/
 * VividGlobe.tsx): a globe of gold dots, turning slowly. The dot count
 * follows the size, so a small one and a big one read as the same object.
 * `active`: it's talking, so it turns faster and its dots swell. It stops
 * drawing off-screen and in a hidden tab, and holds one still frame under
 * reduced motion or when `still`.
 */
export function VividGlobe({
  size,
  active = false,
  still = false,
  className = "",
  style,
}: {
  /** Width and height in px. */
  size: number;
  active?: boolean;
  still?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  // The loop reads these through refs, so a change never restarts it and the
  // globe never jumps
  const activeRef = useRef(active);
  const stillRef = useRef(still);
  const loop = useRef<{ run: () => void; halt: () => void } | null>(null);
  useEffect(() => {
    activeRef.current = active;
    stillRef.current = still;
  });

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const across = acrossFor(size);
    const pts = globePoints(dotsFor(across));
    const half = size / 2;
    const dot = (size / across) * (size < 32 ? 0.3 : 0.27);
    // Room at the rim for a dot at full swell
    const radius = half - dot * 1.4 - 0.5;

    let turn = FIRST_TURN;
    let level = 0;
    let raf = 0;
    let last = 0;
    let onScreen = true;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      drawGlobe(ctx, pts, { cx: half, cy: half, radius, dot, turn, level });
    };
    const frame = (t: number) => {
      const dt = last ? Math.min(t - last, 100) : 16;
      last = t;
      // Turn accumulates, so a speed change bends the motion instead of jumping it
      turn = (turn + dt / (activeRef.current ? TURN_ACTIVE : TURN_IDLE)) % 1;
      const target = activeRef.current ? talking(t) : 0;
      level += (target - level) * 0.12;
      draw();
      raf = requestAnimationFrame(frame);
    };
    const run = () => {
      if (raf || reduced || stillRef.current || !onScreen || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const halt = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    loop.current = { run, halt };

    draw();
    canvas.dataset.drawn = "";

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) run();
      else halt();
    });
    io.observe(canvas);
    const onVisibility = () => (document.hidden ? halt() : run());
    document.addEventListener("visibilitychange", onVisibility);
    run();

    return () => {
      halt();
      loop.current = null;
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [size]);

  useEffect(() => {
    if (still) loop.current?.halt();
    else loop.current?.run();
  }, [still]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      // Fades in on its first frame rather than popping in after hydration
      className={`block shrink-0 opacity-0 transition-opacity duration-500 data-drawn:opacity-100 motion-reduce:transition-none ${className}`}
      style={{ width: size, height: size, ...style }}
    />
  );
}
