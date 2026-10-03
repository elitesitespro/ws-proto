"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDownIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
      { name: "Forex Trading", href: "/platforms/forex", image: "/assets/cards/forex.jpg" },
      { name: "Crypto", href: "/platforms/crypto", image: "/assets/cards/crypto.jpg" },
      { name: "Prediction", href: "/platforms/prediction", image: "/assets/cards/prediction.jpg" },
    ],
  },
  {
    id: "media-play",
    label: "Media & Play",
    platforms: [
      { name: "Vsion", href: "/platforms/vsion", image: "/assets/cards/vsion.jpg" },
      { name: "AI Movie", href: "/platforms/ai-movie", image: "/assets/cards/ai-movie.jpg" },
      { name: "Arcade", href: "/platforms/arcade", image: "/assets/cards/arcade.jpg" },
    ],
  },
  {
    id: "connect-social",
    label: "Connect & Social",
    platforms: [
      { name: "WorldSpace", href: "/platforms/worldspace", image: "/assets/cards/worldspace.jpg" },
      { name: "XStream", href: "/platforms/xstream", image: "/assets/cards/xstream.jpg" },
      { name: "WorldMeet", href: "/platforms/worldmeet", image: "/assets/cards/worldmeet.jpg" },
    ],
  },
  {
    id: "ecosystem-life",
    label: "Ecosystem & Life",
    platforms: [
      { name: "WorkWorld", href: "/platforms/workworld", image: "/assets/cards/workworld.jpg" },
      { name: "WorldStore", href: "/platforms/worldstore", image: "/assets/cards/worldstore.jpg" },
      { name: "WorldHealth", href: "/platforms/worldhealth", image: "/assets/cards/worldhealth.jpg" },
      { name: "Academy", href: "/platforms/academy", image: "/assets/cards/academy.jpg" },
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

      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl">
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

                {/* Left Card: Categories */}
                <div className="flex w-full max-w-[240px] shrink-0 flex-col rounded-2xl border border-white/10 bg-[#1a1918] p-6">
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

                {/* Right Card: Poster Platform Grid */}
                <div className="flex-1 rounded-2xl border border-white/10 bg-[#1a1918] p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeCategory.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        "grid h-full items-center gap-4",
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
                          className="group block h-full"
                        >
                          <motion.div
                            whileHover={{ scale: 1.03 }}
                            transition={{ duration: 0.2 }}
                            className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-white/10 bg-[#252321] transition-all group-hover:border-[#FACC15]/40"
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

                            {/* Dark Bottom Gradient Overlay for Legibility */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            {/* Title Overlaid Directly at Bottom */}
                            <div className="absolute bottom-3 left-3 right-3 z-10 text-xs font-semibold text-white transition-colors group-hover:text-[#FACC15] sm:text-sm">
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