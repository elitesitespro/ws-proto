"use client";

import { useEffect, useRef } from "react";

export type LogoMarqueeItem = {
  name: string;
  src: string;
};

type LogoMarqueeProps = {
  logos: LogoMarqueeItem[];
};

const logoSize = 120;
const logoGap = 16;
const visibleSteps = 5;
const minimumScale = 0.2;
const bufferItems = 8;
const millisecondsPerLogo = 3000;

function logoScale(distance: number) {
  const progress = Math.min(Math.abs(distance) / visibleSteps, 1);
  return minimumScale + (1 - minimumScale) * progress;
}

function logoPositions(phase: number, logoCount: number) {
  const indices = Array.from(
    { length: logoCount + bufferItems * 2 + 1 },
    (_, index) => index - bufferItems
  );
  const scales = indices.map((index) => logoScale(index - phase));
  const widths = scales.map((scale) => logoSize * scale);
  const centers = new Array<number>(indices.length);
  const nearestIndex = Math.floor(phase) + bufferItems;
  const fraction = phase - Math.floor(phase);
  const nextDistance =
    (widths[nearestIndex] + widths[nearestIndex + 1]) / 2 + logoGap;

  centers[nearestIndex] = -fraction * nextDistance;

  for (let index = nearestIndex + 1; index < indices.length; index++) {
    centers[index] =
      centers[index - 1] + (widths[index - 1] + widths[index]) / 2 + logoGap;
  }

  for (let index = nearestIndex - 1; index >= 0; index--) {
    centers[index] =
      centers[index + 1] - (widths[index + 1] + widths[index]) / 2 - logoGap;
  }

  return indices.map((index, position) => ({
    index,
    center: centers[position],
    scale: scales[position],
  }));
}

function logoTransform(center: number, scale: number) {
  return `translate3d(calc(-50% + ${center}px), -50%, 0) scale(${scale})`;
}

export function LogoMarquee({ logos }: LogoMarqueeProps) {
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || logos.length === 0) return;

    const items = Array.from(viewport.querySelectorAll<HTMLElement>("[data-logo-item]"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let isVisible = false;
    let startedAt = performance.now();

    const update = (time: number) => {
      frame = 0;
      const phase = reducedMotion.matches
        ? 0
        : ((time - startedAt) / millisecondsPerLogo) % logos.length;
      const positions = logoPositions(phase, logos.length);

      items.forEach((item, index) => {
        const position = positions[index];
        item.style.transform = logoTransform(position.center, position.scale);
      });

      if (isVisible && !reducedMotion.matches) {
        frame = requestAnimationFrame(update);
      }
    };

    const scheduleUpdate = () => {
      if (isVisible && !frame) frame = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          scheduleUpdate();
        } else {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { rootMargin: "200px" }
    );

    const handleMotionChange = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      startedAt = performance.now();
      scheduleUpdate();
    };

    observer.observe(viewport);
    reducedMotion.addEventListener("change", handleMotionChange);

    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", handleMotionChange);
      cancelAnimationFrame(frame);
    };
  }, [logos.length]);

  if (logos.length === 0) return null;

  return (
    <div
      ref={viewportRef}
      className="relative z-10 h-15 w-full overflow-hidden"
      aria-hidden="true"
    >
      {logoPositions(0, logos.length).map(({ index, center, scale }) => (
        <div
          key={index}
          data-logo-item
          className="absolute top-1/2 left-1/2 flex size-15 items-center justify-center will-change-transform"
          style={{ transform: logoTransform(center, scale) }}
        >
          {/* Brandfetch assets must be loaded directly from their CDN. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logos[((index % logos.length) + logos.length) % logos.length].src}
            alt=""
            width={120}
            height={120}
            loading="eager"
            decoding="async"
            className="size-15 object-contain opacity-90"
          />
        </div>
      ))}
    </div>
  );
}
