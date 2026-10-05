import Image from "next/image";
import { Heart, Play, Star } from "@phosphor-icons/react/dist/ssr";
import { WidgetCard as Card } from "./widget-card";

/** Static featured film preview supplied for the landing page. */
export function XStreamWidget() {
  return (
    <Card role="group" aria-label="Featured film: Dune: Part Two" className="relative h-[248px] w-full gap-2! rounded-[24px]! p-2! text-xs text-white">
      <Image data-widget-motion="artwork" src="/assets/images/dune-0.jpg" alt="" fill sizes="400px" className="object-cover opacity-70" />
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,#100F1420_0%,#100F1440_35%,#100F1499_100%)]" />
      <div className="relative flex items-center gap-1">
        <span className="rounded-full bg-white/15 p-1">Science fiction</span>
        <span className="rounded-full bg-white/15 p-1">Adventure</span>
        <span aria-label="Rating: 4.8" className="ml-auto flex items-center gap-1 rounded-full bg-white p-1 font-medium text-[#34323C]">
          4.8 <Star size={20} weight="fill" className="text-[#E4B626]" aria-hidden="true" />
        </span>
      </div>
      <div className="relative mt-auto flex flex-col gap-2">
        <p className="text-base leading-3 font-semibold tracking-tight">In Dune: Part Two, Paul Atreides joins the fight for Arrakis.</p>
        <div className="flex items-center gap-1">
          <span className="flex h-5 items-center justify-center gap-1 rounded-full bg-[#7052E4] px-2">
            <Play size={20} weight="fill" aria-hidden="true" /> Watch
          </span>
          <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20">
            <Heart size={20} weight="fill" />
          </span>
          <div className="ml-auto flex -space-x-1" aria-hidden="true">
            {[1, 2, 3].map((index) => (
              <Image key={index} src={`/assets/images/dune-${index}.jpg`} alt="" width={32} height={32} sizes="32px" className="size-4 rounded-full object-cover ring-1 ring-white" />
            ))}
            <span className="relative flex size-4 items-center justify-center rounded-full bg-[#796A79] ring-1 ring-white">3+</span>
          </div>
          <span className="leading-[20px] text-white/85">Friends are<br />watching</span>
        </div>
      </div>
    </Card>
  );
}
