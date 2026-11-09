import type { ComponentProps, CSSProperties } from "react";
import { Card } from "@/components/ui/card";

/**
 * The floating hero widgets' surface: the design system's stone card
 * (bg-card, corner-lit, 20px). Widgets set only padding, gap and layout.
 */
export function WidgetCard(props: ComponentProps<typeof Card>) {
  return <Card {...props} />;
}

/**
 * WorldMeet's colour (WorldCall became WorldMeet): its own gold, as in the
 * hub's registry and the app, on the stone cards here. Spread it as a card's
 * style, then read var(--hue) … inside, as with data-hue.
 */
export const meetHue = {
  "--hue": "#C6E82B",
  "--hue-rgb": "198, 232, 43",
  "--hue-ink": "#D9F25A",
  "--hue-on": "#0C0A09",
  "--hue-soft": "rgba(198, 232, 43, 0.12)",
  "--hue-line": "rgba(198, 232, 43, 0.2)",
} as CSSProperties;
