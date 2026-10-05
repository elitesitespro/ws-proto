"use client";

import { useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import { cn } from "cn";
import { Button, buttonVariants } from "@/components/ui/button";
import { WidgetMotionContext } from "@/components/hero/widget-motion-context";
import activity from "@/components/hero/widget-activity.module.css";
import { platformDetails, type ShowcasePlatformName } from "./platform-showcase-content";
import { PlatformProductPreview } from "./platform-product-preview";

export function PlatformShowcaseCard({ name, category }: { name: ShowcasePlatformName; category: string }) {
  const detail = platformDetails[name];
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reducedMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const playing = inView && !paused && !reducedMotion;
  const hasAnimation = ["social", "call", "meeting", "live", "academy", "forex", "crypto", "prediction"].includes(detail.preview);

  return (
    <article ref={ref} className="flex w-full min-w-0 flex-col gap-2">
      <header>
        <p className="mb-1 text-xs font-medium opacity-75">{category} / {name}</p>
        <h3 className="text-lg leading-[32px] font-medium tracking-tight xl:text-xl xl:leading-[40px]">{detail.headline}</h3>
        <p className="mt-1 max-w-[560px] text-xs leading-3 opacity-80">{detail.description}</p>
      </header>
      <ul className="flex flex-wrap gap-1 text-xs leading-3" aria-label={`${name} features`}>
        {detail.features.map((feature) => <li key={feature} className="rounded-lg border border-current/20 bg-white/10 px-1">{feature}</li>)}
      </ul>
      <WidgetMotionContext.Provider value={Boolean(playing)}>
        <div className={`${activity.activity} w-full max-w-[480px]`} data-playing={Boolean(playing)}>
          <PlatformProductPreview kind={detail.preview} />
        </div>
      </WidgetMotionContext.Provider>
      <div className="flex items-center justify-between gap-1 text-xs">
        <p className="opacity-70">Sample preview</p>
        {hasAnimation && <Button variant="ghost" size="sm" className="text-inherit hover:bg-white/15 hover:text-inherit motion-reduce:hidden" onClick={() => setPaused(!paused)} aria-pressed={paused} aria-label={`${paused ? "Resume" : "Pause"} ${name} preview animations`}>
          {paused ? <Play size={20} /> : <Pause size={20} />} {paused ? "Resume" : "Pause"}
        </Button>}
      </div>
      <a href={detail.href} className={cn(buttonVariants({ size: "lg" }), "self-start bg-[#211C20] text-white hover:bg-[#211C20]/85")}>
        {detail.action}<ArrowUpRight size={20} aria-hidden="true" />
      </a>
    </article>
  );
}
