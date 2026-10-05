import {
  BookOpenIcon,
  GraduationCapIcon,
  MessageCircleIcon,
  PlayIcon,
  RadioIcon,
  UsersRoundIcon,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { AssistantOrb } from "@/components/ui/assistant-orb";

type Signal = {
  title: string;
  detail: string;
  icon: LucideIcon;
};

const matches: readonly { request: Signal; destination: Signal }[] = [
  {
    request: { title: "Find my people", detail: "A connection", icon: MessageCircleIcon },
    destination: { title: "Communities to join", detail: "WorldSpace", icon: UsersRoundIcon },
  },
  {
    request: { title: "Learn a skill", detail: "Your next step", icon: BookOpenIcon },
    destination: { title: "Start with Academy", detail: "A path forward", icon: GraduationCapIcon },
  },
  {
    request: { title: "See what is live", detail: "A discovery", icon: RadioIcon },
    destination: { title: "Live moments for you", detail: "XStream", icon: PlayIcon },
  },
];

function SignalCard({ signal, active }: { signal: Signal; active: boolean }) {
  const Icon = signal.icon;

  return (
    <Card
      className={`h-11 w-full max-w-36 flex-row! items-center gap-2! rounded-lg! p-2! text-white ring-1! ${
        active ? "bg-white/10 ring-white/25" : "bg-white/5 opacity-30 ring-white/10"
      }`}
    >
      <span className="flex size-5 shrink-0 items-center justify-center rounded-lg bg-cyan-300/15 text-cyan-100">
        <Icon aria-hidden="true" className="size-3" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-xs leading-[20px] font-medium">{signal.title}</span>
        <span className="text-xs leading-[20px] text-white/60">{signal.detail}</span>
      </span>
    </Card>
  );
}

export function IntelligenceSection() {
  return (
    <section
      id="intelligence"
      aria-labelledby="intelligence-heading"
      className="relative isolate overflow-hidden bg-[#070405] pb-16 text-white"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 1200 192"
        preserveAspectRatio="none"
        className="pointer-events-none h-24 w-full"
      >
        <defs>
          <linearGradient id="currency-to-orb" x1="0" y1="0" x2="0" y2="192" gradientUnits="userSpaceOnUse">
            <stop stopColor="#241034" />
            <stop offset="0.55" stopColor="#1b0d2b" />
            <stop offset="1" stopColor="#0f0718" />
          </linearGradient>
        </defs>
        <path
          d="M0 0 H1200 V48 C1200 72 1140 72 1040 72 H960 C800 72 710 122 600 176 C490 122 400 72 240 72 H160 C60 72 0 72 0 48 Z"
          fill="url(#currency-to-orb)"
        />
      </svg>

      <div className="mx-auto w-full max-w-6xl px-3 md:px-6">
        <div className="grid items-center lg:grid-cols-[minmax(0,1fr)_224px_minmax(0,1fr)]">
          <div className="hidden flex-col gap-2 lg:flex">
            {matches.map(({ request }, index) => (
              <div key={request.title} className="flex items-center">
                <SignalCard signal={request} active={index === 1} />
                {index === 1 && (
                  <span
                    aria-hidden="true"
                    className="h-px min-w-0 flex-1 bg-linear-to-r from-cyan-200/50 to-cyan-200/70"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="relative mx-auto">
            <span
              aria-hidden="true"
              className="absolute bottom-full left-1/2 h-2 w-px -translate-x-1/2 bg-cyan-200/60 lg:h-7"
            />
            <AssistantOrb />
          </div>

          <div className="hidden flex-col gap-2 lg:flex">
            {matches.map(({ destination }, index) => (
              <div key={destination.title} className="flex items-center">
                {index === 1 && (
                  <span
                    aria-hidden="true"
                    className="h-px min-w-0 flex-1 bg-linear-to-r from-cyan-200/70 to-cyan-200/50"
                  />
                )}
                <SignalCard signal={destination} active={index === 1} />
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto h-4 w-px bg-cyan-200/35 lg:hidden" aria-hidden="true" />
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center lg:hidden">
          <SignalCard signal={matches[1].request} active />
          <SignalCard signal={matches[1].destination} active />
        </div>

        <div className="mx-auto mt-8 flex max-w-3xl flex-col items-center gap-2 text-center">
          <p className="text-xs font-medium text-cyan-100/80">WorldStreet intelligence</p>
          <h2
            id="intelligence-heading"
            className="text-xl leading-[44px] font-medium tracking-tight md:text-3xl md:leading-[56px] md:tracking-tighter"
          >
            One assistant connects every experience.
          </h2>
          <p className="max-w-xl text-xs leading-[24px] text-white/70">
            It helps you find the right people, content and tools across WorldStreet.
          </p>
        </div>
      </div>
    </section>
  );
}
