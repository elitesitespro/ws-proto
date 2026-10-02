import type { CSSProperties, ComponentProps } from "react";
import { cn } from "cn";

type GradientVariant = "arctic" | "purple" | "emerald" | "warm" | "yellow";

type GradientColors = Partial<{
  top: string;
  middle: string;
  deep: string;
  bottom: string;
  left: string;
  right: string;
}>;

type GrainyGradientProps = ComponentProps<"div"> & {
  variant?: GradientVariant;
  colors?: GradientColors;
  grainOpacity?: number;
  seed?: string | number;
};

export const YELLOW_GRADIENT_SEED = 61;

const palettes = {
  arctic:
    "[--gradient-top:#8be8f4] [--gradient-middle:#2376b5] [--gradient-deep:#102f70] [--gradient-bottom:#050b22] [--gradient-left:#168fc2] [--gradient-right:#66def0]",
  purple:
    "[--gradient-top:#b89bff] [--gradient-middle:#724bce] [--gradient-deep:#321278] [--gradient-bottom:#110622] [--gradient-left:#9658f0] [--gradient-right:#e0a4ff]",
  emerald:
    "[--gradient-top:#8debc9] [--gradient-middle:#0e9c7b] [--gradient-deep:#075447] [--gradient-bottom:#031b18] [--gradient-left:#11bc88] [--gradient-right:#80f3b8]",
  warm:
    "[--gradient-top:#ffc7a4] [--gradient-middle:#d47777] [--gradient-deep:#803054] [--gradient-bottom:#1c0719] [--gradient-left:#e16d5c] [--gradient-right:#ffaf7c]",
  yellow:
    "[--gradient-top:#ffe375] [--gradient-middle:#e6a700] [--gradient-deep:#81500d] [--gradient-bottom:#241302] [--gradient-left:#ffc21f] [--gradient-right:#fff076]",
} satisfies Record<GradientVariant, string>;

const noiseImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.88' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='128' height='128' filter='url(%23grain)'/%3E%3C/svg%3E";

const colorFields = [
  { color: "top", x: 52, y: 8, width: 82, height: 84, opacity: 0.78 },
  { color: "left", x: 12, y: 50, width: 72, height: 88, opacity: 0.64 },
  { color: "right", x: 88, y: 42, width: 68, height: 78, opacity: 0.68 },
  { color: "middle", x: 53, y: 71, width: 56, height: 64, opacity: 0.38 },
] as const;

function createRandom(seed: string | number) {
  let state = 2166136261;

  for (const character of String(seed)) {
    state = Math.imul(state ^ character.charCodeAt(0), 16777619);
  }

  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function createFields(seed: string | number) {
  const random = createRandom(seed);

  return colorFields.map((field) => {
    const corners = Array.from({ length: 8 }, () => Math.round(25 + random() * 50));

    return {
      left: `${field.x + Math.round((random() - 0.5) * 36)}%`,
      top: `${field.y + Math.round((random() - 0.5) * 36)}%`,
      width: `${field.width + Math.round((random() - 0.5) * 24)}%`,
      height: `${field.height + Math.round((random() - 0.5) * 24)}%`,
      borderRadius: `${corners.slice(0, 4).join("% ")}% / ${corners.slice(4).join("% ")}%`,
      backgroundColor: `var(--gradient-${field.color})`,
      opacity: field.opacity,
      transform: `translate(-50%, -50%) rotate(${Math.round((random() - 0.5) * 90)}deg)`,
    } satisfies CSSProperties;
  });
}

export function GrainyGradient({
  variant = "arctic",
  colors,
  grainOpacity,
  seed,
  className,
  style,
  children,
  ...props
}: GrainyGradientProps) {
  const fields = createFields(seed ?? variant);
  const gradientStyle = {
    ...style,
    ...(colors?.top && { "--gradient-top": colors.top }),
    ...(colors?.middle && { "--gradient-middle": colors.middle }),
    ...(colors?.deep && { "--gradient-deep": colors.deep }),
    ...(colors?.bottom && { "--gradient-bottom": colors.bottom }),
    ...(colors?.left && { "--gradient-left": colors.left }),
    ...(colors?.right && { "--gradient-right": colors.right }),
    ...(grainOpacity !== undefined && { "--grain-opacity": grainOpacity }),
  } as CSSProperties;

  return (
    <div
      {...props}
      data-variant={variant}
      className={cn(
        "relative isolate overflow-hidden rounded-xl bg-[linear-gradient(180deg,var(--gradient-top)_0%,var(--gradient-middle)_38%,var(--gradient-deep)_68%,var(--gradient-bottom)_100%)] text-white [--grain-opacity:0.5]",
        palettes[variant],
        className
      )}
      style={gradientStyle}
    >
      <div className="pointer-events-none absolute inset-0 z-0 blur-[24px]" aria-hidden="true">
        {fields.map((fieldStyle, index) => (
          <span key={index} className="absolute block" style={fieldStyle} />
        ))}
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_94%_88%_at_50%_32%,transparent_40%,#02040d85_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,transparent_42%,#02030c8f_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 z-20 bg-repeat opacity-[var(--grain-opacity)] mix-blend-overlay contrast-[1.35] [background-size:128px_128px]"
        style={{ backgroundImage: `url("${noiseImage}")` }}
        aria-hidden="true"
      />
      <div className="relative z-30">{children}</div>
    </div>
  );
}
