import Image from "next/image";
import Link from "next/link";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { FooterGradientBackground } from "./footer-gradient-background";

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
    title: "Connect",
    links: [
      { label: "WorldSpace", href: "/worldspace" },
      { label: "WorldCall", href: "/worldcall" },
      { label: "WorldMeet", href: "/worldmeet" },
    ],
  },
  {
    title: "Watch & create",
    links: [
      { label: "XStream", href: "/xstream" },
      { label: "Vsion", href: "/vsion" },
      { label: "AI Movie", href: "/ai-movie" },
    ],
  },
  {
    title: "Work & shop",
    links: [
      { label: "WorkWorld", href: "/workworld" },
      { label: "WorldStore", href: "/worldstore" },
    ],
  },
  {
    title: "Learn & wellness",
    links: [
      { label: "Academy", href: "/academy" },
      { label: "WorldHealth", href: "/worldhealth" },
    ],
  },
  {
    title: "Play & markets",
    links: [
      { label: "Arcade", href: "/arcade" },
      { label: "Forex", href: "/forex" },
      { label: "Crypto", href: "/crypto" },
      { label: "Prediction", href: "/prediction" },
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

function FooterGroup({ title, links }: FooterGroupProps) {
  return (
    <div className="min-w-0">
      <h2 className="mb-1 font-semibold">{title}</h2>
      <ul className="flex flex-col gap-1">
        {links.map(({ label, href }) => (
          <li key={href}>
            <Link
              href={href}
              prefetch={false}
              className="inline-block rounded-sm text-white/75 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative isolate overflow-hidden bg-[#070405] text-footer leading-[20px] text-white">
      <FooterGradientBackground />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-4 pt-12 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <div>
              <Link
                href="/"
                aria-label="WorldStreet home"
                className="inline-flex items-center gap-2 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Image
                  src="/assets/logos/ws-logo-icon.svg"
                  alt=""
                  width={82}
                  height={56}
                  className="h-4 w-6 object-contain"
                />
                <span className="font-semibold">WorldStreet</span>
              </Link>
              <p className="mt-2 max-w-xs text-sm tracking-tight text-white/75">
                One account connecting multiple digital experiences.
              </p>
              <div role="group" aria-label="Social media" className="mt-3 flex gap-1">
                {socialPlatforms.map(({ name, icon }) => (
                  <button
                    key={name}
                    type="button"
                    disabled
                    aria-label={`${name} profile link coming soon`}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon" }),
                      "size-6 border-0 bg-white/15 text-white backdrop-blur-lg disabled:opacity-100"
                    )}
                  >
                    <Image
                      src={icon}
                      alt=""
                      width={20}
                      height={20}
                      className="size-(--icon-size-min)"
                    />
                  </button>
                ))}
              </div>
            </div>

            <nav
              aria-label="Footer navigation"
              className="grid grid-cols-2 content-start gap-x-3 gap-y-3 lg:grid-cols-3"
            >
              {footerGroups.map((group) => (
                <FooterGroup key={group.title} {...group} />
              ))}
            </nav>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 pt-2">
            <p className="text-white/65">
              © {new Date().getFullYear()} WorldStreet. All rights reserved.
            </p>
            <nav aria-label="Legal documents">
              <ul className="flex flex-wrap gap-x-3 gap-y-1">
                {bottomLegalLinks.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      prefetch={false}
                      className="inline-block rounded-sm text-white/65 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
    </footer>
  );
}
