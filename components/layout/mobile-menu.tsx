"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { cn } from "cn";
import { Button, buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { ACCOUNT_LINKS, CONTACT_LINK, NAV_CHAPTERS, NAV_PAGES, NAV_PLATFORMS } from "./nav-links";
import { ChapterLink, NAV_FOCUS, NavGroupLabel, NavPlatformItem } from "./nav-items";
import styles from "./mobile-menu.module.css";

const ROW_LINK = cn(
  "flex min-h-6 items-center rounded-pill px-2 text-xs font-medium transition-colors hover:bg-white/10",
  NAV_FOCUS
);

/**
 * Below the laptop layout, everything the live nav holds, grouped: the
 * landing's chapters, every platform, the WorldStreet pages (with Contact),
 * then the account actions. On a phone the bar is just the mark and the
 * menu button: the menu carries both actions.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const sheetId = useId();
  const chaptersId = useId();
  const platformsId = useId();
  const pagesId = useId();
  const close = () => setOpen(false);
  const lenis = useLenis();

  // The page holds still behind it while it's open (a wheel over the bar
  // would scroll it, and the bar change shape under the menu); the menu's
  // own list still scrolls
  useEffect(() => {
    if (!open || !lenis) return;
    lenis.stop();
    return () => lenis.start();
  }, [open, lenis]);

  // While open: Escape closes it and hands focus back to the button; a tap
  // outside closes it; widening into the laptop layout closes it too
  useEffect(() => {
    if (!open) return;
    const laptop = window.matchMedia("(min-width: 64rem)");
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    }
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleWide() {
      if (laptop.matches) setOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);
    laptop.addEventListener("change", handleWide);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
      laptop.removeEventListener("change", handleWide);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn(styles.root, "flex items-center gap-1")}>
      <Button
        ref={toggleRef}
        type="button"
        variant="ghost"
        size="icon"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls={sheetId}
        onClick={() => setOpen((current) => !current)}
      >
        <Icon name={open ? "close" : "menu"} size={20} tone="current" />
      </Button>

      <div
        id={sheetId}
        // The menu scrolls on its own, not the page behind it
        data-lenis-prevent
        className={cn(
          // A glass panel dropping out of the header capsule, over the page
          "cx-liquid cx-liquid--panel absolute inset-x-0 top-full mt-1 max-h-[calc(100svh-96px)] overflow-y-auto overscroll-contain p-2",
          !open && "hidden"
        )}
      >
        <nav aria-label="Mobile navigation" className="flex flex-col gap-2">
          <div>
            <NavGroupLabel id={chaptersId}>On the page</NavGroupLabel>
            <ul aria-labelledby={chaptersId} className="grid grid-cols-2 gap-x-1">
              {NAV_CHAPTERS.map((chapter) => (
                <li key={chapter.label}>
                  <ChapterLink chapter={chapter} pathname={pathname} onNavigate={close} className={ROW_LINK}>
                    {chapter.label}
                  </ChapterLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <NavGroupLabel id={platformsId}>Every platform</NavGroupLabel>
            <ul aria-labelledby={platformsId} className="grid grid-cols-2">
              {NAV_PLATFORMS.map((platform) => (
                <li key={platform.name} className="min-w-0">
                  <NavPlatformItem platform={platform} onNavigate={close} compact />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <NavGroupLabel id={pagesId}>WorldStreet</NavGroupLabel>
            <ul aria-labelledby={pagesId} className="flex flex-wrap gap-1">
              {[...NAV_PAGES, CONTACT_LINK].map((page) => (
                <li key={page.href}>
                  <a href={page.href} onClick={close} className={cn(ROW_LINK, "bg-white/5")}>
                    {page.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* A tablet's bar already shows both */}
        <div className="mt-2 flex flex-col gap-1 border-t border-white/10 pt-2 md:hidden">
          <a
            href={ACCOUNT_LINKS.join}
            onClick={close}
            className={cn(buttonVariants({ variant: "default", size: "lg" }), "w-full")}
          >
            Open an account
          </a>
          <a
            href={ACCOUNT_LINKS.signIn}
            onClick={close}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
          >
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}
