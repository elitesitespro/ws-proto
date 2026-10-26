import { Card } from "@/components/ui/card";
import { AssistantOrb } from "@/components/ui/assistant-orb";
import { Icon, type IconName } from "@/components/icon";

type Signal = {
  title: string;
  detail: string;
  icon: IconName;
  /** The platform a destination lands on: its glyph wears that hue. */
  hue?: string;
};

const matches: readonly { request: Signal; destination: Signal }[] = [
  {
    request: { title: "Find my people", detail: "A connection", icon: "chat" },
    destination: {
      title: "Communities to join",
      detail: "WorldSpace",
      icon: "users",
      hue: "community",
    },
  },
  {
    request: {
      title: "Learn a skill",
      detail: "Your next step",
      icon: "book-open",
    },
    destination: {
      title: "Start with Academy",
      detail: "A path forward",
      icon: "graduation",
      hue: "academy",
    },
  },
  {
    request: {
      title: "See what is live",
      detail: "A discovery",
      icon: "radio",
    },
    destination: {
      title: "Live moments for you",
      detail: "XStream",
      icon: "play",
      hue: "xtreme",
    },
  },
];

function SignalCard({ signal, active }: { signal: Signal; active: boolean }) {
  return (
    <Card
      className={`h-11 w-full max-w-36 flex-row! items-center gap-2! p-2! ${active ? "" : "opacity-40"}`}
    >
      <span
        data-hue={signal.hue}
        className={`flex size-5 shrink-0 items-center justify-center rounded-icon ${
          signal.hue ? "bg-[var(--hue-soft)]" : "bg-surface-3"
        }`}
      >
        <Icon
          name={signal.icon}
          size={24}
          className={signal.hue ? "text-[var(--hue)]" : undefined}
          tone={signal.hue ? "current" : undefined}
        />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-xs leading-[20px] font-medium">
          {signal.title}
        </span>
        <span className="text-xs leading-[20px] text-muted">
          {signal.detail}
        </span>
      </span>
    </Card>
  );
}

/**
 * `funnel`: the section opens with the currency section's surface narrowing
 * down to the orb. Without the currency section above, leave it out.
 */
export function IntelligenceSection({
  funnel = true,
}: { funnel?: boolean } = {}) {
  return (
    <section
      id="intelligence"
      aria-labelledby="intelligence-heading"
      className={`relative isolate overflow-hidden bg-background pb-16 text-foreground ${funnel ? "" : "pt-12"}`}
    >
      {funnel && (
        <svg
          aria-hidden="true"
          viewBox="0 0 1200 192"
          preserveAspectRatio="none"
          className="pointer-events-none h-24 w-full"
        >
          <defs>
            <linearGradient
              id="currency-to-orb"
              x1="0"
              y1="0"
              x2="0"
              y2="192"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#1C1917" />
              <stop offset="0.55" stopColor="#161412" />
              <stop offset="1" stopColor="#0E0C0B" />
            </linearGradient>
          </defs>
          <path
            d="M0 0 H1200 V48 C1200 72 1140 72 1040 72 H960 C800 72 710 122 600 176 C490 122 400 72 240 72 H160 C60 72 0 72 0 48 Z"
            fill="url(#currency-to-orb)"
          />
        </svg>
      )}

      <div className="mx-auto w-full max-w-6xl px-3 md:px-6">
        <div className="grid items-center lg:grid-cols-[minmax(0,1fr)_224px_minmax(0,1fr)]">
          <div className="hidden flex-col gap-2 lg:flex">
            {matches.map(({ request }, index) => (
              <div key={request.title} className="flex items-center">
                <SignalCard signal={request} active={index === 1} />
                {index === 1 && (
                  <span
                    aria-hidden="true"
                    className="h-px min-w-0 flex-1 bg-linear-to-r from-white/15 to-white/35"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="relative mx-auto">
            <span
              aria-hidden="true"
              className="absolute bottom-full left-1/2 h-2 w-px -translate-x-1/2 bg-white/30 lg:h-7"
            />
            <AssistantOrb />
          </div>

          <div className="hidden flex-col gap-2 lg:flex">
            {matches.map(({ destination }, index) => (
              <div key={destination.title} className="flex items-center">
                {index === 1 && (
                  <span
                    aria-hidden="true"
                    className="h-px min-w-0 flex-1 bg-linear-to-r from-white/35 to-white/15"
                  />
                )}
                <SignalCard signal={destination} active={index === 1} />
              </div>
            ))}
          </div>
        </div>

        <div
          className="mx-auto h-4 w-px bg-white/20 lg:hidden"
          aria-hidden="true"
        />
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center lg:hidden">
          <SignalCard signal={matches[1].request} active />
          <SignalCard signal={matches[1].destination} active />
        </div>

        <div className="mx-auto mt-8 flex max-w-3xl flex-col items-center gap-2 text-center">
          <p className="text-xs font-medium text-ember-text">
            WorldStreet intelligence
          </p>
          <h2
            id="intelligence-heading"
            className="cx-h2 bg-[image:var(--cx-heading-hero)] text-xl leading-[44px] md:text-3xl md:leading-[56px]"
          >
            One assistant connects every experience.
          </h2>
          <p className="max-w-xl text-xs leading-[24px] text-muted">
            It helps you find the right people, content and tools across
            WorldStreet.
          </p>
        </div>
      </div>
    </section>
  );
}
