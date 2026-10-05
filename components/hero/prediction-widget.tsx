import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { WidgetCard as Card } from "./widget-card";

/** Static sample market supplied for the landing page. */
export function PredictionWidget() {
  return (
    <Card role="group" aria-label="Sample Bitcoin prediction market" className="w-full flex-row! gap-2! rounded-[24px]! p-2! text-xs text-white">
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-white/60">Crypto</span>
          <span className="flex items-center gap-1 text-white/70">Rules <ArrowUpRight size={20} aria-hidden="true" /></span>
        </div>
        <p className="leading-[20px] font-semibold">Will Bitcoin hit $100,000 by December 31, 2026?</p>
        <div className="flex flex-col gap-1 text-white/60">
          <span>$124.8k volume</span>
          <span>Closes Dec 31</span>
        </div>
      </div>
      <div className="flex w-[216px] shrink-0 flex-col justify-between gap-1">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1">
            <span className="text-lg leading-4 font-semibold tracking-tight text-white">68%</span>
            <span className="font-medium text-white/65">chance</span>
          </div>
          <span className="flex h-4 items-center rounded-full bg-[#203B31] px-1 font-semibold text-[#95D8B8]">Open</span>
        </div>
        <div className="h-[4px] overflow-hidden rounded-[4px] bg-white/15" aria-hidden="true">
          <div data-widget-motion="shine" className="h-full w-[68%] rounded-[4px] bg-[#71B99B]" />
        </div>
        <div className="flex gap-1 font-semibold">
          <span className="flex h-5 flex-1 items-center justify-center whitespace-nowrap rounded-full bg-[#203B31] text-[#95D8B8]">Buy yes 68¢</span>
          <span className="flex h-5 flex-1 items-center justify-center whitespace-nowrap rounded-full bg-[#3E242D] text-[#FFA5B6]">Buy no 32¢</span>
        </div>
      </div>
    </Card>
  );
}
