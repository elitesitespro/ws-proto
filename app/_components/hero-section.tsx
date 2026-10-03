"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";

interface HeroFeature {
    word: string;
    image?: string;
}

const HERO_FEATURES: HeroFeature[] = [
    { word: "Streaming", image: "/assets/hero/streaming.png" },
    { word: "Trading", image: "/assets/hero/trading.png" },
    { word: "Shopping", image: "/assets/hero/shopping.png" },
    { word: "Gaming", image: "/assets/hero/gaming.png" },
    { word: "Learning", image: "/assets/hero/learning.png" },
];

export function HeroSection() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % HERO_FEATURES.length);
        }, 2500);

        return () => clearInterval(timer);
    }, []);

    const currentFeature = HERO_FEATURES[currentIndex];

    return (
        <section
            aria-labelledby="hero-heading"
            className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center px-3 py-12 text-center md:px-6 md:py-20"
        >
            <div className="flex max-w-3xl flex-col items-center gap-2">

                {/* Main Headline */}
                <h1
                    id="hero-heading"
                    className="flex flex-col items-center text-3xl font-semibold leading-[40px] tracking-tight text-white sm:text-5xl sm:leading-[56px] md:text-6xl md:leading-[68px] md:tracking-tighter"
                >
                    <span>One Wallet for Everything</span>

                    {/* Masked line container for vertical slide animation */}
                    <span className="relative flex h-[1.2em] w-full items-center justify-center overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={currentFeature.word}
                                initial={{ y: "100%", opacity: 0 }}
                                animate={{ y: "0%", opacity: 1 }}
                                exit={{ y: "-100%", opacity: 0 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className="flex items-center justify-center gap-2"
                            >
                                {/* Cap-height matched badge placeholder with optional image */}
                                <span
                                    aria-hidden="true"
                                    className="relative inline-block h-[0.82em] w-[0.82em] shrink-0 overflow-hidden rounded-xl bg-[#d9d9d9] sm:rounded-2xl"
                                >
                                    {currentFeature.image && (
                                        <Image
                                            src={currentFeature.image}
                                            alt=""
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </span>
                                <span>{currentFeature.word}</span>
                            </motion.span>
                        </AnimatePresence>
                    </span>
                </h1>

                {/* Subtext */}
                <p className="max-w-2xl text-sm leading-[24px] text-[#a8a29e] sm:text-base sm:leading-[26px]">
                    Connect with communities, discover entertainment, explore services, shop,
                    learn, create, work and access specialized platforms through one WorldStreet account.
                </p>

                {/* CTAs */}
                <div className="flex w-full flex-col items-center gap-2 pt-2 sm:w-auto sm:flex-row">
                    <Link
                        href="/create-account"
                        className={cn(
                            buttonVariants({ variant: "default", size: "lg" }),
                            "w-full px-6 sm:w-auto"
                        )}
                    >
                        Get Started
                    </Link>

                    <Link
                        href="#explore"
                        className={cn(
                            buttonVariants({ variant: "outline", size: "lg" }),
                            "w-full border-white/40 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white dark:bg-transparent dark:hover:bg-white/10 sm:w-auto"
                        )}
                    >
                        Explore Ecosystem
                        <ArrowRightIcon className="ml-1 h-4 w-4" aria-hidden="true" />
                    </Link>
                </div>

            </div>
        </section>
    );
}