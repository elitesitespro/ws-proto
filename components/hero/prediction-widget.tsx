import { Icon } from "@/components/icon";
import { WidgetCard as Card } from "./widget-card";

/** Static sample market supplied for the landing page. */
export function PredictionWidget() {
  return (
    <Card data-hue="prediction" role="group" aria-label="Sample Bitcoin prediction market" className="w-full flex-row! gap-2! p-2! text-xs">
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-muted">Crypto</span>
          <span className="flex items-center gap-1 text-muted">Rules <Icon name="arrow-up-right" size={20} tone="current" /></span>
        </div>
        <p className="leading-[20px] font-medium">Will Bitcoin hit $100,000 by December 31, 2026?</p>
        <div className="flex flex-col gap-1 text-muted">
          <span>$124.8k volume</span>
          <span>Closes Dec 31</span>
        </div>
      </div>
      <div className="flex w-[216px] shrink-0 flex-col justify-between gap-1">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1">
            <span className="text-lg leading-4 font-medium text-(--hue-ink) tabular-nums">68%</span>
            <span className="font-medium text-muted">chance</span>
          </div>
          <span className="flex h-4 items-center rounded-pill bg-(--hue-soft) px-1 font-medium text-(--hue-ink)">Open</span>
        </div>
        <div className="h-[4px] overflow-hidden rounded-pill bg-surface-3" aria-hidden="true">
          <div data-widget-motion="shine" className="h-full w-[68%] rounded-pill bg-(--hue)" />
        </div>
        <div className="flex gap-1 font-medium tabular-nums">
          <span className="flex h-5 flex-1 items-center justify-center whitespace-nowrap rounded-pill bg-gain-wash text-gain">Buy yes 68¢</span>
          <span className="flex h-5 flex-1 items-center justify-center whitespace-nowrap rounded-pill bg-loss-wash text-loss">Buy no 32¢</span>
        </div>
      </div>
    </Card>
  );
}
