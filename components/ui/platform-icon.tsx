import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { cn } from "cn";
import { Icon, type IconName } from "@/components/icon";
import type { ShowcasePlatformName } from "@/app/_components/platform-showcase-content";
import { WorldSpaceLogo } from "./worldspace-logo";
import styles from "./platform-icon.module.css";

/** The WorldStreet W (WorldStore's and Academy's marks), on an 82×56 grid. */
function WorldW() {
  return (
    <svg viewBox="0 0 82 56" className={styles.w} aria-hidden="true">
      <path d="M40.9 25.2 27.6 49 4 7h26.7l10.2 18.2Z" />
      <path d="M77.9 7 54.3 49 40.9 25.2 51.2 7h26.7Z" />
    </svg>
  );
}

/** AI Studio's two peaks, its W turned over (public/assets/ai-movie/mark.webp, redrawn sharp). */
function StudioPeaks() {
  return (
    <svg viewBox="0 0 72 42" className={styles.peaks} aria-hidden="true">
      <path d="M0 42 23 0l13 24-9 18Z" />
      <path d="M45 42 36 24 48 0l24 42Z" />
    </svg>
  );
}

/** WorldMeet's ink globe, as on its app icon (public/assets/worldmeet/mark.svg). */
function MeetGlobe() {
  return (
    <svg viewBox="0 0 32 32" className={styles.full} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <circle cx="16" cy="16" r="8.5" strokeWidth="2" />
        <path d="M7.8 16c2.2-2.6 4.4-2.6 6.2 0s4 2.6 6.2 0 2.9-1.6 4 0" strokeWidth="2" />
        <path d="M16 7.5c-2.6 2.4-3.6 5.3-3.6 8.5s1 6.1 3.6 8.5" strokeWidth="1.6" opacity=".55" />
      </g>
    </svg>
  );
}

/** WorldHealth's heart and pulse, as on its app icon (public/assets/worldhealth/mark.svg). */
function HealthHeart() {
  return (
    <svg viewBox="0 0 256 256" className={styles.heart} aria-hidden="true">
      <g fill="currentColor">
        <path opacity="0.2" d="M232,102c0,66-104,122-104,122S24,168,24,102A54,54,0,0,1,78,48c22.59,0,41.94,12.31,50,32,8.06-19.69,27.41-32,50-32A54,54,0,0,1,232,102Z" />
        <path d="M72,144H32a8,8,0,0,1,0-16H67.72l13.62-20.44a8,8,0,0,1,13.32,0l25.34,38,9.34-14A8,8,0,0,1,136,128h24a8,8,0,0,1,0,16H140.28l-13.62,20.44a8,8,0,0,1-13.32,0L88,126.42l-9.34,14A8,8,0,0,1,72,144ZM178,40c-20.65,0-38.73,8.88-50,23.89C116.73,48.88,98.65,40,78,40a62.07,62.07,0,0,0-62,62c0,.75,0,1.5,0,2.25a8,8,0,1,0,16-.5c0-.58,0-1.17,0-1.75A46.06,46.06,0,0,1,78,56c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46c0,53.61-77.76,102.15-96,112.8-10.83-6.31-42.63-26-66.68-52.21a8,8,0,1,0-11.8,10.82c31.17,34,72.93,56.68,74.69,57.63a8,8,0,0,0,7.58,0C136.21,228.66,240,172,240,102A62.07,62.07,0,0,0,178,40Z" />
      </g>
    </svg>
  );
}

type Look = {
  /** The tile's fill: the platform's own colour, lit from the top */
  fill: string;
  /** The mark's colour on it */
  ink: string;
  /** A hairline round the edge, where the fill is dark */
  rim?: string;
  /** Its colour as light (the dial's glow behind the platform at the pointer) */
  glow: string;
  /** The mark: a picture, a drawing, or the system's glyph */
  mark: IconName | ((size: number) => ReactNode);
};

// Each platform's own mark on its own colours: the same as the mark beside
// its name on its panel (and its app's icon, where it has one), so the dial
// and the panel it opens read as one brand (Owen, 9 Nov 2026: the dial's
// pastel tiles "don't match" and "just look like icons").
const LOOKS: Record<ShowcasePlatformName, Look> = {
  WorldSpace: {
    fill: "radial-gradient(circle at 50% 44%, #123a4c 0%, #081018 58%, #04060b 100%)",
    ink: "#fff",
    rim: "rgba(34, 184, 214, 0.4)",
    glow: "#22b8d6",
    mark: (size) => <WorldSpaceLogo size={size} className={styles.helmet} />,
  },
  WorldMeet: {
    fill: "linear-gradient(160deg, #fff3b0 0%, #facc15 42%, #eab308 100%)",
    ink: "#1c1917",
    glow: "#facc15",
    mark: () => <MeetGlobe />,
  },
  XStream: {
    fill: "radial-gradient(95% 70% at 50% 108%, rgba(248, 88, 16, 0.6), rgba(227, 18, 42, 0.28) 48%, transparent 76%), #0b0708",
    ink: "#fff",
    rim: "rgba(227, 18, 42, 0.5)",
    glow: "#e3122a",
    mark: (size) => <Image src="/assets/xtream/mark.webp" alt="" width={size} height={Math.round(size * 0.76)} className={styles.chilli} />,
  },
  Vsion: {
    fill: "linear-gradient(160deg, #2a220e 0%, #070605 72%)",
    ink: "#fac800",
    rim: "rgba(237, 178, 0, 0.55)",
    glow: "#edb200",
    mark: "play",
  },
  "AI Movie": {
    fill: "linear-gradient(160deg, #2c3364 0%, #1b1f39 55%, #11142a 100%)",
    ink: "#fff",
    rim: "rgba(255, 204, 45, 0.5)",
    glow: "#ffcc2d",
    mark: () => <StudioPeaks />,
  },
  Arcade: {
    fill: "linear-gradient(160deg, #dde8b0 0%, #b5c478 52%, #97a858 100%)",
    ink: "#150f26",
    glow: "#b5c478",
    mark: "gamepad",
  },
  WorldStore: {
    fill: "linear-gradient(160deg, #fde68a 0%, #facc15 45%, #eab308 100%)",
    ink: "#1c1917",
    glow: "#facc15",
    mark: () => <WorldW />,
  },
  WorkWorld: {
    fill: "linear-gradient(160deg, #ffffff 0%, #f5f5f4 55%, #d6d3d1 100%)",
    ink: "#0a0a0a",
    glow: "#fafafa",
    mark: "wrench",
  },
  Academy: {
    fill: "linear-gradient(160deg, #2b2416 0%, #0f0d0a 70%)",
    ink: "#f5c542",
    rim: "rgba(237, 178, 0, 0.5)",
    glow: "#edb200",
    mark: () => <WorldW />,
  },
  WorldHealth: {
    fill: "linear-gradient(160deg, #1d2a27 0%, #0d1211 70%)",
    ink: "#2dd4bf",
    rim: "rgba(45, 212, 191, 0.35)",
    glow: "#14b8a6",
    mark: () => <HealthHeart />,
  },
  "E-Embassy": {
    fill: "linear-gradient(160deg, #3b86f5 0%, #0450c0 55%, #033a8f 100%)",
    ink: "#fff",
    glow: "#2f6fe0",
    mark: "id-card",
  },
  Forex: {
    fill: "linear-gradient(160deg, #26221b 0%, #0c0a09 70%)",
    ink: "#ffcc2d",
    rim: "rgba(255, 204, 45, 0.45)",
    glow: "#ffcc2d",
    mark: "candlestick-chart",
  },
  Crypto: {
    fill: "linear-gradient(160deg, #ffe58f 0%, #ffcc2d 45%, #e6a700 100%)",
    ink: "#0c0a09",
    glow: "#ffcc2d",
    mark: "bitcoin",
  },
  WorldSports: {
    fill: "linear-gradient(160deg, #6ee7b7 0%, #10b981 50%, #047857 100%)",
    ink: "#0a0a0a",
    glow: "#10b981",
    mark: "trophy",
  },
  Prediction: {
    fill: "linear-gradient(160deg, #1b2a2c 0%, #0c0a09 72%)",
    ink: "#7bc6ce",
    rim: "rgba(123, 198, 206, 0.45)",
    glow: "#7bc6ce",
    mark: "target",
  },
};

/** A platform's colour as light: for a glow behind its icon. */
export function platformGlow(name: ShowcasePlatformName) {
  return LOOKS[name].glow;
}

/**
 * A platform's app icon: its own mark on its own colours, as a lit squircle
 * tile. The one way the landing shows a platform as a picture (the dial,
 * the Platforms menu, Vivid's ring, the hero globe's cards). Decorative: the
 * platform's name is always beside it or in its label.
 */
export function PlatformIcon({ name, size, className }: { name: ShowcasePlatformName; size: number; className?: string }) {
  const look = LOOKS[name];
  return (
    <span
      aria-hidden="true"
      className={cn(styles.icon, className)}
      style={
        {
          width: size,
          height: size,
          "--fill": look.fill,
          "--ink": look.ink,
          "--rim": look.rim,
        } as CSSProperties
      }
    >
      {typeof look.mark === "string" ? (
        <Icon name={look.mark} size={Math.round(size * 0.52)} tone="current" />
      ) : (
        look.mark(size)
      )}
    </span>
  );
}
