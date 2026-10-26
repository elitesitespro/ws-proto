import type { CSSProperties } from "react";
import { Icon as CxIcon, type IconName, type IconTone } from "@/ds/components/icon";

export type { IconName };

/**
 * The app's one icon entry point. Every glyph is the design system's duotone
 * set (ds/components/icon, vendored; add new ones to worldstreet/design-system
 * and run `pnpm ds:sync`).
 *
 * Tone: the WorldStreet gold gradient by default. When the className sets a
 * text colour that carries meaning (money direction, ink on gold, white on a
 * photo or a coloured tile), the icon follows currentColor instead.
 */
const MEANING =
  /(?:^|\s)(?:[a-z-]+:)*text-(?:credit|debit|destructive|primary-foreground|on-primary|background|white|black|current|inherit|\[)/;

export function Icon({
  name,
  size = 20,
  tone,
  label,
  className,
  style,
}: {
  name: IconName;
  size?: number;
  tone?: IconTone;
  /** Accessible name; omit for decorative icons. */
  label?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const t = tone ?? (className && MEANING.test(className) ? "current" : "gradient");
  return <CxIcon name={name} size={size} tone={t} label={label} className={className} style={style} />;
}
