"use client";

import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { PlatformMarkStack } from "@/components/ui/platform-mark-stack";
import { ACCOUNT_LINKS, NAV_CHAPTERS, NAV_PLATFORMS } from "./nav-links";
import { ChapterLink, NAV_FOCUS, NavGroupLabel, NavPlatformItem } from "./nav-items";

/** The network's app icons, popping in as the panel opens (the statement's stack). */
function EcosystemMarks() {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return <PlatformMarkStack shown={shown} className="self-start text-4xl" />;
}

/**
 * What Platforms opens on a laptop, as on the live nav: the ecosystem card,
 * the landing's chapters, then every platform at its real address. One glass
 * panel over the page, with everything sat straight on it (never glass on
 * glass).
 */
export function PlatformsPanel({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const chaptersId = useId();
  const platformsId = useId();

  return (
    <div className="cx-liquid cx-liquid--panel grid grid-cols-[240px_224px_minmax(0,1fr)] gap-2 p-2 xl:grid-cols-[280px_240px_minmax(0,1fr)]">
      {/* The ecosystem: one account opens all of it */}
      <div className="flex flex-col justify-between gap-3 rounded-card bg-white/5 p-3">
        <p className="text-xs font-medium text-[var(--cx-glass-text-2)]">The ecosystem</p>
        <div className="flex flex-col gap-2">
          <EcosystemMarks />
          <p className="text-base font-medium">
            <span className="text-[var(--cx-glass-text-2)]">One account.</span>
            <br />
            Every platform.
          </p>
          {/* The header's gold button is the view's one primary: this is its partner */}
          <a
            href={ACCOUNT_LINKS.join}
            onClick={onNavigate}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "self-start")}
          >
            Open an account
            <Icon name="arrow-up-right" size={18} tone="current" />
          </a>
        </div>
      </div>

      {/* On the page: the landing's chapters */}
      <div className="flex flex-col p-2">
        <NavGroupLabel id={chaptersId}>On the page</NavGroupLabel>
        <ul aria-labelledby={chaptersId} className="flex flex-col">
          {NAV_CHAPTERS.map((chapter, index) => (
            <li key={chapter.id}>
              <ChapterLink
                chapter={chapter}
                pathname={pathname}
                onNavigate={onNavigate}
                className={cn(
                  "flex min-h-5 items-center gap-2 rounded-md px-1 transition-colors hover:bg-white/10",
                  NAV_FOCUS
                )}
              >
                <span className="w-3 shrink-0 text-xs text-[var(--cx-glass-text-2)] tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-base font-medium">{chapter.label}</span>
              </ChapterLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Every platform, at its real address */}
      <div className="flex min-w-0 flex-col p-2">
        <NavGroupLabel id={platformsId}>Every platform</NavGroupLabel>
        <ul aria-labelledby={platformsId} className="grid grid-cols-2 xl:grid-cols-3">
          {NAV_PLATFORMS.map((platform) => (
            <li key={platform.name} className="min-w-0">
              <NavPlatformItem platform={platform} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
