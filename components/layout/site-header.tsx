import Image from "next/image";
import Link from "next/link";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { MobileMenu } from "./mobile-menu";

const primaryNav = [
  { label: "Discover", href: "/discover" },
  { label: "Connect", href: "/connect" },
  { label: "Entertainment", href: "/entertainment" },
  { label: "Lifestyle", href: "/lifestyle" },
  { label: "Market", href: "/market" },
] as const;

export function SiteHeader() {
  return (
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
          {primaryNav.map((item) => (
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
    </header>
  );
}
