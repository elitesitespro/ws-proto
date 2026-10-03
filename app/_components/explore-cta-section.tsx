import Link from "next/link";
import { cn } from "cn";
import { GrainyGradient } from "@/components/ui/grainy-gradient";
import { buttonVariants } from "@/components/ui/button";

export function ExploreCtaSection() {
  return (
    <section
      aria-labelledby="explore-heading"
      className="mx-auto w-full max-w-6xl px-3 pt-6 md:px-6 md:pt-8"
    >
      <GrainyGradient
        variant="yellow"
        seed="worldstreet-explore"
        className="w-full"
      >
        <div className="pointer-events-none absolute inset-0 z-0 bg-black/55" aria-hidden="true" />
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-2 px-4 pb-1 pt-10 text-center md:px-8 md:pt-12">
          <h2
            id="explore-heading"
            className="max-w-xl text-lg leading-[32px] font-semibold tracking-tight md:text-2xl md:leading-[48px] md:tracking-tighter"
          >
            There&apos;s more than one street to explore.
          </h2>
          <p className="max-w-md text-sm leading-[24px] text-white/80">
            Connect, create, watch, shop, work, learn and discover what WorldStreet
            has to offer.
          </p>
          <div className="flex w-full flex-col items-center gap-2 pt-1 sm:w-auto sm:flex-row">
            <Link
              href="/create-account"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "w-full px-3 sm:w-auto"
              )}
            >
              Create account
            </Link>
            <Link
              href="/platforms"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full border-white/40 bg-transparent px-3 text-white hover:bg-white/10 hover:text-white dark:bg-transparent dark:hover:bg-white/10 sm:w-auto"
              )}
            >
              See platforms
            </Link>
          </div>
        </div>
      </GrainyGradient>
    </section>
  );
}
