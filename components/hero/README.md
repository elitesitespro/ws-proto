# Floating hero widgets

`app/_components/hero-section.tsx` composes the message and widget stage.
`FloatingWidgetStage` accepts a layout array and a separate content registry.
`FloatingWidgetSlot` handles position, rotation, scale, depth and motion. It adds
no card, background or clipping to your component.

## Replace a placeholder

In `hero-widget-content.tsx`, import your component and replace the matching entry:

```tsx
import { WorldSpaceWidget } from "@/components/worldspace/worldspace-widget";

export const heroWidgetContent = {
  "slot-01": <WorldSpaceWidget />,
  // Keep the other entries here.
};
```

The import above is an example for a component you provide. The placeholder's
styles disappear with the placeholder. Your component controls its own content,
height, appearance and interactions; it should fit the slot's available width.

## Change the arrangement

Edit `hero-widget-layout.ts`. Each entry has an ID matching the content registry:

```tsx
{
  id: "slot-01",
  desktop: { x: "13%", y: "9%", width: 256, rotation: 9, zIndex: 3 },
  tablet: { x: "4%", y: "8%", width: 200, rotation: 5, zIndex: 3 },
  parallax: 0.06,
}
```

Desktop starts at 1280px; tablet covers 768–1279px; mobile is below 768px.
Omitting a tablet or mobile placement hides that slot at that size. Adding,
removing or reordering entries changes the composition and entrance order.
Positions are measured from the top-left of the stage, which is at most 1600px wide.

The demo keeps a clear central area for the text. When changing a widget's height
or width, adjust its placement to preserve that space.

## Motion

The entrance lasts 900ms, moving 24px upward and scaling from 0.96 to 1. Slots
start 80ms apart and then remain still except for scroll parallax.

`parallax` controls signed vertical movement: `0.1` moves up to 32px, `-0.1`
moves in the opposite direction, and `0` disables it. Movement is capped at 70px.
Reduced-motion preferences disable both entrance and parallax, including before
hydration. There is no pointer animation or continuous bobbing.
