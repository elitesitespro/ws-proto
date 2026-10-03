import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";

export function HeroSection() {
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

                    <span className="mt-0 flex items-center justify-center gap-2">
                        {/* Cap-height matched badge placeholder */}
                        <span
                            aria-hidden="true"
                            className="inline-block h-[0.82em] w-[0.82em] shrink-0 rounded-xl bg-[#d9d9d9] sm:rounded-2xl"
                        />
                        <span>Streaming</span>
                    </span>
                </h1>

                {/* Subtext */}
                <p className="max-w-2xl text-sm leading-[24px] text-[#a8a29e] sm:text-base sm:leading-[26px]">
                    Connect with communities, discover entertainment, explore services, shop,
                    learn, create, work and access specialized platforms through one WorldStreet account.
                </p>

                {/* CTAs */}
                <div className="flex w-full flex-col items-center gap-0 pt-2 sm:w-auto sm:flex-row">
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