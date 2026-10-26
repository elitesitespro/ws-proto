import Image from "next/image";
import { Icon } from "@/components/icon";
import { WidgetCard as Card } from "./widget-card";

/** Static featured film preview supplied for the landing page. */
export function XStreamWidget() {
  return (
    <Card data-hue="xtreme" lit={false} role="group" aria-label="Featured film: Dune: Part Two" className="relative h-[248px] w-full gap-2! p-2! text-xs text-white">
      <Image data-widget-motion="artwork" src="/assets/images/dune-0.jpg" alt="" fill sizes="400px" className="object-cover opacity-70" />
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,9,0.12)_0%,rgba(12,10,9,0.25)_35%,rgba(12,10,9,0.6)_100%)]" />
      <div className="relative flex items-center gap-1">
        <span className="cx-liquid cx-liquid--clear cx-liquid--pill p-1">Science fiction</span>
        <span className="cx-liquid cx-liquid--clear cx-liquid--pill p-1">Adventure</span>
        <span aria-label="Rating: 4.8" className="cx-liquid cx-liquid--clear cx-liquid--pill ml-auto flex items-center gap-1 p-1 font-medium tabular-nums">
          4.8 <Icon name="star" size={20} tone="current" />
        </span>
      </div>
      <div className="relative mt-auto flex flex-col gap-2">
        <p className="text-base leading-3 font-medium">In Dune: Part Two, Paul Atreides joins the fight for Arrakis.</p>
        <div className="flex items-center gap-1">
          <span className="cx-liquid cx-liquid--pill flex h-5 items-center justify-center gap-1 px-2 font-medium">
            <Icon name="play" size={20} tone="current" className="text-(--hue)" /> Watch
          </span>
          <span aria-hidden="true" className="cx-liquid cx-liquid--circle flex size-5 shrink-0 items-center justify-center">
            <Icon name="heart" size={20} tone="current" />
          </span>
          <div className="ml-auto flex -space-x-1" aria-hidden="true">
            {[1, 2, 3].map((index) => (
              <Image key={index} src={`/assets/images/dune-${index}.jpg`} alt="" width={32} height={32} sizes="32px" className="size-4 rounded-full object-cover ring-1 ring-white" />
            ))}
            <span className="relative flex size-4 items-center justify-center rounded-full bg-card ring-1 ring-white">3+</span>
          </div>
          <span className="leading-[20px] text-white/85">Friends are<br />watching</span>
        </div>
      </div>
    </Card>
  );
}
