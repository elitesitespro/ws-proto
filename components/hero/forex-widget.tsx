import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { WidgetCard as Card } from "./widget-card";

const marketBars = [
  25.333, 29.333, 26.667, 20.667, 23.333, 30.667, 35.333,
  32, 26, 28.667, 38.667, 43.333, 37.333, 32.667,
  36, 30, 24.667, 31.333, 40.667, 48, 42,
  36.667, 41.333, 45.333, 25.333, 29.333, 26.667,
  20.667, 23.333, 30.667,
];
const barWidth = (264 - (marketBars.length - 1) * 4) / marketBars.length;

/** Static sample figures supplied for the landing page. */
export function ForexWidget() {
  return (
    <Card
      role="group"
      aria-label="Sample forex quote: EUR / USD, 1.0846, up 0.42 percent over 24 hours"
      className="w-full gap-3! rounded-[24px]! pt-2! pb-0! text-white"
    >
      <div className="px-2">
        <div className="flex items-center justify-between text-xs leading-3">
          <span className="font-medium text-white/70">EUR / USD</span>
          <span className="text-white/60">24h</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xl leading-[44px] font-semibold tracking-tight">1.0846</span>
          <span className="flex h-4 shrink-0 items-center gap-1 rounded-full bg-[#203B31] px-1 text-xs font-medium text-[#95D8B8]">
            <ArrowUpRight size={20} weight="bold" aria-hidden="true" />
            +0.42%
          </span>
        </div>
      </div>
      <svg
        viewBox="0 0 264 48"
        preserveAspectRatio="none"
        className="h-6 w-full shrink-0 text-[#79B8A6]"
        aria-hidden="true"
      >
        {marketBars.map((height, index) => (
          <rect
            key={index}
            data-widget-motion={index === marketBars.length - 1 ? "latest-bar" : "bar"}
            style={{ animationDelay: `${index * -0.19}s` }}
            x={index * (barWidth + 4)}
            y={48 - height}
            width={barWidth}
            height={height}
            rx={2}
            fill="currentColor"
          />
        ))}
      </svg>
    </Card>
  );
}
