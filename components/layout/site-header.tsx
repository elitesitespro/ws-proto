"use client";

import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { MobileMenu } from "./mobile-menu";
import { ACCOUNT_LINKS, NAV_PAGES } from "./nav-links";
import { PlatformsPanel } from "./platforms-panel";

const NAV_ITEM =
  "flex min-h-6 items-center gap-1 whitespace-nowrap text-xs font-medium transition-opacity focus-visible:rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null);
  const platformsRef = useRef<HTMLLIElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  // Set when the down arrow opens Platforms, so its first link takes focus
  const focusFirstLink = useRef(false);
  const lastDirection = useRef(0);
  const distanceInDirection = useRef(0);
  const [hidden, setHidden] = useState(false);
  // At the very top the bar is bare; once the page moves, the glass capsule comes in
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const [platformsOpen, setPlatformsOpen] = useState(false);
  const panelId = useId();

  const bare = !scrolled && !platformsOpen;
  const closePlatforms = () => setPlatformsOpen(false);

  // While Platforms is open: Escape closes it, and hands focus back to the
  // button if it was inside; narrowing past the laptop layout closes it too
  useEffect(() => {
    if (!platformsOpen) return;
    const laptop = window.matchMedia("(min-width: 64rem)");
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") return;
      const inside = platformsRef.current?.contains(document.activeElement);
      setPlatformsOpen(false);
      if (inside) triggerRef.current?.focus();
    }
    function handleNarrow() {
      if (!laptop.matches) setPlatformsOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    laptop.addEventListener("change", handleNarrow);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      laptop.removeEventListener("change", handleNarrow);
    };
  }, [platformsOpen]);

  useEffect(() => {
    if (!platformsOpen || !focusFirstLink.current) return;
    focusFirstLink.current = false;
    platformsRef.current?.querySelector<HTMLElement>("a")?.focus();
  }, [platformsOpen]);

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowDown") return;
    event.preventDefault();
    focusFirstLink.current = true;
    setPlatformsOpen(true);
  }

  // Tabbing on past the panel's last link (or back before the button) closes it
  function handlePlatformsBlur(event: FocusEvent<HTMLLIElement>) {
    const next = event.relatedTarget;
    if (next && !event.currentTarget.contains(next)) setPlatformsOpen(false);
  }

  useMotionValueEvent(scrollY, "change", (current) => {
    setScrolled(current > 24);
    const previous = scrollY.getPrevious() ?? current;
    const change = current - previous;
    const menuOpen = headerRef.current?.querySelector('[aria-expanded="true"]');
    const focusInHeader = headerRef.current?.contains(document.activeElement);

    if (current <= 80 || menuOpen || focusInHeader) {
      setHidden(false);
      distanceInDirection.current = 0;
      return;
    }

    if (change === 0) return;

    const direction = Math.sign(change);
    if (direction !== lastDirection.current) {
      lastDirection.current = direction;
      distanceInDirection.current = 0;
    }

    distanceInDirection.current += Math.abs(change);
    if (distanceInDirection.current >= 12) {
      setHidden(direction > 0);
      distanceInDirection.current = 0;
    }
  });

  return (
    <>
      {/* Dimmed Backdrop Overlay */}
      <AnimatePresence>
        {platformsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closePlatforms}
            className="fixed inset-0 z-40 bg-background/50"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Bare at the top of the page: the bar's content alone, lined up with
          the hero's copy. Once the page scrolls (or Platforms opens), it gathers
          into a floating glass capsule, as iOS bars float over content. The
          glass is its own layer behind the bar's content: a backdrop-filter on
          an ancestor would stop the menus inside from frosting the page behind
          them, and would trap their positioning. The header stays 80px tall
          (8 + 64 + 8): the platform timeline sticks below it. */}
      <header
        ref={headerRef}
        aria-hidden={hidden}
        inert={hidden}
        onFocusCapture={() => setHidden(false)}
        className={cn(
          "sticky top-0 z-50 py-1 text-foreground transition-[translate,padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          bare ? "px-0" : "px-2 md:px-3",
          hidden ? "-translate-y-full" : "translate-y-0"
        )}
      >
        <div
          className={cn(
            "relative mx-auto flex h-8 w-full max-w-7xl items-center justify-between gap-1 transition-[padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            bare ? "px-3 md:px-6" : "pl-3 pr-1"
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "cx-liquid cx-liquid--pill pointer-events-none absolute inset-0 -z-10 transition-[opacity,scale] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
              // Hidden, it fades too, so its shadow doesn't hang at the top edge
              bare || hidden ? "scale-x-[0.97] opacity-0" : "scale-100 opacity-100"
            )}
          />
          <Link
            href="/"
            aria-label="WorldStreet home"
            className="flex h-6 shrink-0 items-center gap-1 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Image
              src="/assets/logos/ws-logo-icon.svg"
              alt=""
              width={82}
              height={56}
              className="h-4 w-6 object-contain"
              priority
            />
            {/* The name beside the mark: not on a phone, where the mark stands alone */}
            <span className="hidden text-base font-medium tracking-normal md:inline lg:hidden xl:inline xl:text-lg xl:tracking-tight">
              WorldStreet
            </span>
          </Link>

          {/* As on the live nav: Platforms opens the panel, then four pages */}
          <nav aria-label="Primary navigation" className="hidden lg:block">
            <ul className="flex items-center gap-2 xl:gap-4">
              {/* The panel sits right after its button, so Tab walks into it
                  next; it's placed against the bar, the capsule's full width */}
              <li ref={platformsRef} onBlur={handlePlatformsBlur}>
                <button
                  ref={triggerRef}
                  type="button"
                  onClick={() => setPlatformsOpen((open) => !open)}
                  onKeyDown={handleTriggerKeyDown}
                  className={cn(
                    NAV_ITEM,
                    platformsOpen ? "text-ember-text opacity-100" : "opacity-75 hover:opacity-100"
                  )}
                  aria-expanded={platformsOpen}
                  aria-controls={panelId}
                >
                  Platforms
                  <Icon
                    name="chevron-down"
                    size={16}
                    tone="current"
                    className={cn("shrink-0 transition-transform duration-200", platformsOpen && "rotate-180")}
                  />
                </button>

                <AnimatePresence>
                  {platformsOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-label="Platforms"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute inset-x-0 top-full mt-1"
                    >
                      <PlatformsPanel onNavigate={closePlatforms} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>

              {NAV_PAGES.map((page) => (
                <li key={page.href}>
                  <a href={page.href} className={cn(NAV_ITEM, "opacity-75 hover:opacity-100")}>
                    {page.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            {/* From a tablet up the bar has room for both; a phone's menu carries them */}
            <div className="hidden items-center gap-1 md:flex">
              <a
                href={ACCOUNT_LINKS.signIn}
                className={buttonVariants({ variant: bare ? "ghost" : "outline", size: "sm" })}
              >
                Sign in
              </a>
              <a href={ACCOUNT_LINKS.join} className={buttonVariants({ variant: "default", size: "sm" })}>
                Open an account
              </a>
            </div>

            <MobileMenu />
          </div>
        </div>
      </header>
    </>
  );
}
