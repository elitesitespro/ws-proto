"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDownIcon } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { MobileMenu } from "./mobile-menu";

interface Platform {
  name: string;
  href: string;
  image?: string;
}

interface Category {
  id: string;
  label: string;
  platforms: Platform[];
}

const CATEGORIES: Category[] = [
  {
    id: "trade-markets",
    label: "Trade & Markets",
    platforms: [
      { name: "Forex Trading", href: "/platforms/forex" },
      { name: "Crypto", href: "/platforms/crypto" },
      { name: "Prediction", href: "/platforms/prediction" },
    ],
  },
  {
    id: "media-play",
    label: "Media & Play",
    platforms: [
      { name: "Vsion", href: "/platforms/vsion" },
      { name: "AI Movie", href: "/platforms/ai-movie" },
      { name: "Arcade", href: "/platforms/arcade" },
    ],
  },
  {
    id: "connect-social",
    label: "Connect & Social",
    platforms: [
      { name: "WorldSpace", href: "/platforms/worldspace" },
      { name: "XStream", href: "/platforms/xstream" },
      { name: "WorldMeet", href: "/platforms/worldmeet" },
    ],
  },
  {
    id: "ecosystem-life",
    label: "Ecosystem & Life",
    platforms: [
      { name: "WorkWorld", href: "/platforms/workworld" },
      { name: "WorldStore", href: "/platforms/worldstore" },
      { name: "WorldHealth", href: "/platforms/worldhealth" },
      { name: "Academy", href: "/platforms/academy" },
    ],
  },
];

const primaryNav = [
  { label: "Discover", href: "/discover" },
  { label: "Connect", href: "/connect" },
  { label: "Entertainment", href: "/entertainment" },
  { label: "Lifestyle", href: "/lifestyle" },
  { label: "Market", href: "/market" },
] as const;

export function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null);
  const lastDirection = useRef(0);
  const distanceInDirection = useRef(0);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  const [isDiscoverOpen, setIsDiscoverOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string>(CATEGORIES[0].id);

  const activeCategory = CATEGORIES.find((cat) => cat.id === activeCategoryId) || CATEGORIES[0];

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDiscoverOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useMotionValueEvent(scrollY, "change", (current) => {
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
        {isDiscoverOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsDiscoverOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <header
        ref={headerRef}
        aria-hidden={hidden}
        inert={hidden}
        onFocusCapture={() => setHidden(false)}
        className={`sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl transition-[translate] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          hidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="relative mx-auto flex h-10 w-full max-w-7xl items-center justify-between gap-1 px-3 xl:px-4">
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
            <span className="text-base font-semibold tracking-normal lg:hidden xl:inline xl:text-lg xl:tracking-tight">
              WorldStreet
            </span>
          </Link>

          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-2 lg:flex xl:gap-4"
          >
            <button
              type="button"
              onClick={() => setIsDiscoverOpen(!isDiscoverOpen)}
              className={cn(
                "flex min-h-6 items-center gap-1 whitespace-nowrap text-[14px] font-medium transition-opacity focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                isDiscoverOpen ? "text-[#FACC15] opacity-100" : "opacity-75 hover:opacity-100"
              )}
              aria-expanded={isDiscoverOpen}
            >
              Discover
              <ChevronDownIcon
                aria-hidden="true"
                className={cn("size-2 shrink-0 transition-transform duration-200", isDiscoverOpen && "rotate-180")}
              />
            </button>

            {primaryNav.slice(1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className="flex min-h-6 items-center gap-1 whitespace-nowrap text-[14px] font-medium opacity-75 transition-opacity hover:opacity-100 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {item.label}
                <ChevronDownIcon aria-hidden="true" className="size-2 shrink-0" />
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-1 lg:flex">
            <Link
              href="/sign-in"
              prefetch={false}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "bg-transparent px-2 text-xs xl:px-3"
              )}
            >
              Sign in
            </Link>
            <Link
              href="/create-account"
              prefetch={false}
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "px-2 text-xs xl:px-3"
              )}
            >
              Create account
            </Link>
          </div>

          <MobileMenu items={primaryNav} />
        </div>

        {/* Mega Menu Dropdown */}
        <AnimatePresence>
          {isDiscoverOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute left-0 right-0 top-full border-b border-white/10 bg-[#0a0a0a]/95 py-6 shadow-2xl backdrop-blur-xl"
            >
              <div className="mx-auto flex max-w-7xl items-stretch gap-4 px-3 md:gap-6 xl:px-4">

                {/* Left Dark Card: Categories */}
                <div className="flex w-full max-w-[240px] shrink-0 flex-col rounded-2xl border border-white/10 bg-[#1a1918] p-5 md:p-6">
                  <span className="mb-6 text-sm font-normal text-[#a8a29e]">Categories</span>
                  <div className="flex flex-col space-y-4">
                    {CATEGORIES.map((cat) => {
                      const isActive = cat.id === activeCategoryId;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setActiveCategoryId(cat.id)}
                          className={cn(
                            "text-left text-base font-semibold transition-colors duration-150 focus:outline-none",
                            isActive ? "text-[#FACC15]" : "text-[#a8a29e] hover:text-white"
                          )}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Dark Card: Platform Grid */}
                <div className="flex flex-1 rounded-2xl border border-white/10 bg-[#1a1918] p-5 md:p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeCategory.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        "grid w-full items-stretch gap-4",
                        activeCategory.platforms.length === 4
                          ? "grid-cols-2 sm:grid-cols-4"
                          : "grid-cols-2 sm:grid-cols-3"
                      )}
                    >
                      {activeCategory.platforms.map((platform) => (
                        <Link
                          key={platform.name}
                          href={platform.href}
                          onClick={() => setIsDiscoverOpen(false)}
                          className="group flex h-full flex-col"
                        >
                          <motion.div
                            whileHover={{ scale: 1.03 }}
                            transition={{ duration: 0.2 }}
                            className="relative flex h-full min-h-[220px] w-full flex-col justify-end overflow-hidden rounded-xl border border-white/10 bg-[#252321] transition-all group-hover:border-[#FACC15]/40 sm:min-h-[250px]"
                          >
                            {/* Background Canvas / Poster Image */}
                            {platform.image ? (
                              <Image
                                src={platform.image}
                                alt={platform.name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-white/5 transition-colors group-hover:from-white/20 group-hover:to-white/10" />
                            )}

                            {/* Dark Bottom Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                            {/* Title Overlaid Directly at Bottom */}
                            <div className="relative z-10 p-3 text-xs font-semibold text-white transition-colors group-hover:text-[#FACC15] sm:p-4 sm:text-sm">
                              {platform.name}
                            </div>
                          </motion.div>
                        </Link>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
