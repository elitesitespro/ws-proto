import Image from "next/image";
import Link from "next/link";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { hueAttrs, platformDetails } from "@/app/_components/platform-showcase-content";
import { DISTRICTS } from "@/app/_components/street/street-districts";
import { VividGlobe } from "@/app/_components/vivid/vivid-globe";
import { VIVID_URL } from "@/app/_components/vivid/vivid-links";
import { FooterWordmark } from "./footer-wordmark";

// The four parts of WorldStreet, as the street and the hub's menu name them
const categoryNames = {
  connect: "Connect",
  entertainment: "Entertainment",
  lifestyle: "Lifestyle",
  markets: "Markets",
} as const;

const footerGroups = [
  {
    title: "Explore",
    links: [
      { label: "Discover", href: "/discover" },
      { label: "Ecosystem", href: "/ecosystem" },
      { label: "What's new", href: "/whats-new" },
    ],
  },
  {
    title: "WorldStreet",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Newsroom", href: "/newsroom" },
      { label: "Partners", href: "/partners" },
      { label: "Developers", href: "/developers" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help center", href: "https://worldstreet.app/en/support" },
      { label: "Safety", href: "/safety" },
      { label: "Accessibility", href: "/accessibility" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Community guidelines", href: "/community-guidelines" },
      { label: "Financial risk disclosures", href: "/financial-risk-disclosures" },
      { label: "Eligibility", href: "/eligibility" },
      { label: "Regulatory information", href: "/regulatory-information" },
    ],
  },
] as const;

const bottomLegalLinks = [
  { label: "Terms and conditions", href: "/terms" },
  { label: "Privacy policy", href: "/privacy" },
  { label: "Cookie policy", href: "/cookies" },
] as const;

const socialPlatforms = [
  { name: "TikTok", icon: "/assets/icons/tiktok.svg" },
  { name: "X", icon: "/assets/icons/x.svg" },
  { name: "Instagram", icon: "/assets/icons/instagram.svg" },
  { name: "YouTube", icon: "/assets/icons/youtube.svg" },
] as const;

type FooterGroupProps = (typeof footerGroups)[number];

// On a phone each link is a 28px row with no gap between: the same rhythm,
// a bigger target for a thumb
const linkClass =
  "inline-flex items-center gap-1 rounded-xs max-md:py-0.5 text-foreground/75 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

function FooterGroup({ title, links }: FooterGroupProps) {
  return (
    <div className="min-w-0">
      <h2 className="mb-1 font-medium">{title}</h2>
      <ul className="flex flex-col gap-1 max-md:gap-0">
        {links.map(({ label, href }) => (
          <li key={href}>
            <Link href={href} prefetch={false} className={linkClass}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Every platform, under its part of WorldStreet, in its own colour. */
function PlatformGroups() {
  return (
    <nav aria-label="Platforms" className="grid grid-cols-2 content-start gap-3 md:grid-cols-4">
      {DISTRICTS.map((district) => (
        <div key={district.id} className="min-w-0">
          <h2 className="mb-1 font-medium">{categoryNames[district.id]}</h2>
          <ul className="flex flex-col gap-1 max-md:gap-0">
            {district.exits.map((exit) => (
              <li key={exit.name}>
                <a href={platformDetails[exit.name].href} target="_blank" rel="noreferrer" className={linkClass}>
                  <span
                    aria-hidden="true"
                    {...hueAttrs(exit.name)}
                    className="size-1 shrink-0 rounded-full bg-(--hue)"
                  />
                  {exit.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative isolate overflow-hidden bg-background text-footer leading-[20px] text-foreground">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-12 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div>
            <Link
              href="/"
              aria-label="WorldStreet home"
              className="inline-flex items-center gap-2 rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              <Image
                src="/assets/logos/ws-logo-icon.svg"
                alt=""
                width={82}
                height={56}
                className="h-4 w-6 object-contain"
              />
              <span className="font-medium">WorldStreet</span>
            </Link>
            <p className="mt-2 max-w-xs text-sm tracking-tight text-foreground/75">
              Your world of trading, streaming, chatting, gaming, shopping and learning, on one account.
            </p>
            <div role="group" aria-label="Social media" className="mt-3 flex gap-1">
              {socialPlatforms.map(({ name, icon }) => (
                <button
                  key={name}
                  type="button"
                  disabled
                  aria-label={`${name} profile link coming soon`}
                  // Glass circles on the night. They stay disabled (links
                  // coming soon) but keep the material.
                  className={cn(
                    buttonVariants({ variant: "glass", size: "icon" }),
                    "size-6 disabled:bg-[rgba(var(--_rgb),var(--_a))] disabled:text-[var(--cx-glass-text)]"
                  )}
                >
                  <Image src={icon} alt="" width={20} height={20} className="size-(--icon-size-min)" />
                </button>
              ))}
            </div>
          </div>

          <PlatformGroups />
        </div>

        <div className="mt-6 grid gap-6 border-t border-hairline pt-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          {/* Vivid, for the question the page didn't answer */}
          <div>
            <p className="font-medium">Still deciding?</p>
            <p className="mt-1 max-w-xs text-foreground/75">Vivid knows every platform. Ask it anything.</p>
            {/* On the landing, opens Vivid's pill at the foot of the screen instead (vivid-pill.tsx) */}
            <a
              href={VIVID_URL}
              target="_blank"
              rel="noopener"
              data-vivid-summon=""
              className={cn(buttonVariants({ variant: "glass", size: "sm" }), "mt-2 gap-1")}
            >
              <VividGlobe size={20} />
              Ask Vivid
            </a>
          </div>

          <nav aria-label="Footer navigation" className="grid grid-cols-2 content-start gap-3 md:grid-cols-4">
            {footerGroups.map((group) => (
              <FooterGroup key={group.title} {...group} />
            ))}
          </nav>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <p className="text-foreground/65">© {new Date().getFullYear()} WorldStreet. All rights reserved.</p>
          <nav aria-label="Legal documents">
            <ul className="flex flex-wrap gap-x-3 gap-y-1 max-md:gap-y-0">
              {bottomLegalLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    prefetch={false}
                    className="inline-block rounded-xs text-foreground/65 max-md:py-0.5 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <FooterWordmark />

        {/* On the landing, Vivid's ask pill sits over the foot of the screen (it sets data-vivid-pill on <html>):
            room for it under the name, so the page's last row scrolls clear of it. Positioned, so it lies over
            the name's foot and glow, which fade into it rather than stopping at a line. */}
        <div
          aria-hidden="true"
          className="pointer-events-none relative hidden h-[calc(82px+env(safe-area-inset-bottom))] md:h-[94px] [[data-vivid-pill]_&]:block"
          style={{ backgroundImage: "linear-gradient(to bottom, transparent, var(--background) min(2vw, 26px))" }}
        />
      </div>
    </footer>
  );
}
