import Link from "next/link";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { FloatingWidgetStage } from "@/components/hero/floating-widget-stage";
import { heroWidgetContent } from "@/components/hero/hero-widget-content";
import { heroWidgetLayout } from "@/components/hero/hero-widget-layout";
import { HeroHeadline } from "./hero-headline";

export function HeroSection() {
  return (
    <section
      id="home"
      aria-labelledby="hero-heading"
      className="relative isolate -mt-10 flex min-h-[1000px] w-full items-center justify-center overflow-hidden bg-[#070405] px-3 pt-52 pb-26 text-[#F6F4F5] md:min-h-[896px] md:px-6 md:py-16 xl:min-h-[1000px]"
    >
      <FloatingWidgetStage
        layout={heroWidgetLayout}
        content={heroWidgetContent}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[560px] flex-col items-center gap-3 text-center">
        <p className="rounded-full border border-white/10 bg-[#211C20] px-2 py-1 text-xs leading-[24px] font-medium text-white/70">
          One account. One connected ecosystem.
        </p>

        <HeroHeadline />

        <p className="max-w-[520px] text-xs leading-[24px] text-white/70">
          Connect, create, discover and earn
          <br />
          All in one connected world.
        </p>

        <div className="flex w-full flex-col items-center justify-center gap-2 pt-1 sm:w-auto sm:flex-row">
          <Link
            href="#ecosystem-intro-heading"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "w-full bg-[#F6F4F5] px-3 text-[#211C20] hover:bg-[#E3DFE1] sm:w-auto",
            )}
          >
            Explore WorldStreet
          </Link>
          <Link
            href="/create-account"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-full border-white/20 bg-[#211C20] px-3 text-[#F6F4F5] hover:bg-[#302A2F] hover:text-white dark:bg-[#211C20] dark:hover:bg-[#302A2F] sm:w-auto",
            )}
          >
            Create your account
          </Link>
        </div>
      </div>
    </section>
  );
}
