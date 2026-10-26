import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { Icon, type IconName } from "@/components/icon";
import { WorldSpaceWidget } from "@/components/hero/worldspace-widget";
import { AcademyWidget } from "@/components/hero/academy-widget";
import { CryptoWidget } from "@/components/hero/crypto-widget";
import { ForexWidget } from "@/components/hero/forex-widget";
import { WidgetCard } from "@/components/hero/widget-card";
import type { PlatformPreviewKind } from "./platform-showcase-content";

// The mockups sit inside their platform's data-hue (the showcase card sets
// it), so a live dot, a speaker ring or a glyph that labels the platform can
// wear var(--hue). Raised fills are the kit's surfaces; secondary text is muted.

function PreviewCard({ children }: { children: ReactNode }) {
  return <WidgetCard className="w-full gap-2! p-2! text-xs leading-3">{children}</WidgetCard>;
}

function DetailRow({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-surface-3 p-1">
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-3" aria-hidden="true">{icon}</span>
      <div className="min-w-0"><p className="font-medium">{title}</p><p className="text-muted">{detail}</p></div>
    </div>
  );
}

const callControls: readonly IconName[] = ["mic", "video", "phone"];

function ConversationPreview({ meeting }: { meeting: boolean }) {
  return (
    <PreviewCard>
      <div className="flex items-center justify-between gap-1">
        <p className="font-medium">{meeting ? "Design sync" : "Time to catch up"}</p>
        <span className="flex items-center gap-1 text-[var(--hue-ink)]"><span className="size-[8px] rounded-full bg-[var(--hue)]" data-widget-motion="live-dot" />{meeting ? "In a call" : "Incoming"}</span>
      </div>
      {meeting ? (
        <div className="grid grid-cols-2 gap-1">
          {[1, 2].map((index) => <div key={index} className="relative h-[112px] overflow-hidden rounded-md"><Image src={`/assets/images/active-meeting-${index}.jpg`} alt="Sample participant" fill sizes="200px" className="object-cover" /><span data-widget-motion="speaker" className="absolute inset-0 rounded-md border-2 border-[var(--hue)]" style={{ opacity: index === 1 ? 1 : 0, animationDelay: `${index * 4 - 20}s` }} /></div>)}
        </div>
      ) : (
        <div className="flex items-center gap-2 py-2"><Image src="/assets/images/elena-avatar.jpg" alt="" width={64} height={64} className="size-8 rounded-full object-cover" /><div><p className="text-base font-medium">Elena Morgan</p><p className="text-muted">Would love to hear your news.</p></div></div>
      )}
      <div className="flex items-center gap-1" aria-hidden="true">
        {callControls.map((name, i) => <span key={name} data-widget-motion={i === 0 ? "speaking-mic" : undefined} className="flex size-5 items-center justify-center rounded-full bg-surface-3"><Icon name={name} size={20} tone="current" /></span>)}
        <span className="ml-auto text-muted">{meeting ? "4 participants" : "Voice call"}</span>
      </div>
    </PreviewCard>
  );
}

export function PlatformProductPreview({ kind }: { kind: PlatformPreviewKind }) {
  switch (kind) {
    case "social": return <WorldSpaceWidget />;
    case "academy": return <AcademyWidget />;
    case "crypto": return <CryptoWidget />;
    case "forex": return <ForexWidget />;
    case "call": return <ConversationPreview meeting={false} />;
    case "meeting": return <ConversationPreview meeting />;
    case "film": return (
      <PreviewCard>
        <div className="relative h-[144px] overflow-hidden rounded-md"><Image src="/assets/images/dune-0.jpg" alt="Dune: Part Two film artwork" fill sizes="(min-width: 1024px) 480px, 100vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" /><p className="absolute bottom-2 left-2 font-medium text-white">Dune: Part Two</p></div>
        <DetailRow icon={<Icon name="play" size={20} className="text-[var(--hue)]" />} title="A night in, together" detail="Watch party · 6 friends" />
      </PreviewCard>
    );
    case "live": return (
      <PreviewCard>
        <div className="relative h-[128px] overflow-hidden rounded-md bg-[var(--hue-soft)] p-2">
          <span className="flex items-center gap-1"><span data-widget-motion="live-dot" className="size-[8px] rounded-full bg-[var(--hue)]" />Live room</span>
          <div className="mt-2 flex items-center gap-2"><Image src="/assets/images/amara-avatar.jpg" width={48} height={48} alt="" className="size-6 rounded-full object-cover" /><div><p className="font-medium">The creative hour</p><p className="text-muted">With Amara · 240 watching</p></div></div>
        </div>
        <p className="rounded-md bg-surface-3 p-1"><span className="font-medium">Tobi</span> <span className="text-muted">That colour palette is so good.</span></p>
        <p className="text-muted">A conversation everyone can join.</p>
      </PreviewCard>
    );
    case "studio": return (
      <PreviewCard>
        <div className="flex items-center gap-1"><Icon name="film" size={20} className="text-[var(--hue)]" /><span className="font-medium">Your next short film</span><span className="ml-auto text-muted">Draft</span></div>
        <div className="rounded-md bg-surface-3 p-2"><p className="mb-1 text-muted">Scene 01 · A new beginning</p><p>A quiet street. The first bus arrives. Someone steps out with a story to tell.</p></div>
        <div className="flex items-center gap-1"><span className="text-muted">Cast</span>{[1, 2, 3].map((n) => <Image key={n} src={`/assets/images/active-meeting-${n}.jpg`} alt="Sample cast portrait" width={40} height={40} className="size-5 rounded-full object-cover" />)}<span className="ml-auto text-muted">3 characters</span></div>
      </PreviewCard>
    );
    case "arcade": return (
      <PreviewCard>
        <div className="flex items-center gap-1"><Icon name="trophy" size={20} className="text-[var(--hue)]" /><p className="font-medium">Your next challenge</p><span className="ml-auto text-muted">Level 12</span></div>
        <DetailRow icon={<Icon name="gamepad" size={20} tone="current" />} title="Trivia Duel" detail="You vs. the Street Bot" />
        <div className="flex justify-between"><span>Daily progress</span><span className="text-muted">2 of 3 complete</span></div>
        <div className="cx-progress" role="progressbar" aria-label="Sample daily progress" aria-valuenow={2} aria-valuemin={0} aria-valuemax={3}><span style={{ "--value": (2 / 3) * 100 } as CSSProperties} /></div>
      </PreviewCard>
    );
    case "store": return (
      <PreviewCard>
        <div className="flex h-[112px] items-center justify-center rounded-md bg-[var(--hue-soft)]"><Icon name="shopping-bag" size={64} className="text-[var(--hue)]" /></div>
        <div className="flex flex-wrap items-center justify-between gap-1"><p className="font-medium">Everyday tote</p><p className="tabular-nums">₦45,000</p></div>
        <p className="text-muted">Local seller · Lagos</p>
      </PreviewCard>
    );
    case "work": return (
      <PreviewCard>
        <div className="flex items-center gap-1"><Icon name="map-pin" size={20} className="text-[var(--hue)]" /><p className="font-medium">People nearby</p></div>
        <DetailRow icon={<span>TA</span>} title="Tunde · Welder" detail="0.8 km away · Gate repairs" />
        <DetailRow icon={<span>IM</span>} title="Ifeanyi · Metalwork" detail="1.2 km away · Custom fittings" />
      </PreviewCard>
    );
    case "health": return (
      <PreviewCard>
        <div className="flex items-center gap-1"><Icon name="heart-pulse" size={20} className="text-[var(--hue)]" /><p className="font-medium">Space to talk</p></div>
        <DetailRow icon={<Icon name="video" size={20} tone="current" />} title="Your consultation" detail="Choose video, audio or text" />
        <div className="flex gap-1"><span className="rounded-pill bg-surface-3 px-cx-3 py-1">Video</span><span className="rounded-pill bg-surface-3 px-cx-3 py-1">Audio</span><span className="rounded-pill bg-surface-3 px-cx-3 py-1">Text</span></div>
      </PreviewCard>
    );
    case "prediction": return (
      <PreviewCard>
        <p className="text-muted">Music · Sample market</p><p className="text-base font-medium">Will this week’s number one stay on top?</p>
        <div className="flex justify-between tabular-nums"><span className="text-[var(--hue-ink)]">Yes · 64%</span><span className="text-muted">No · 36%</span></div>
        <div className="flex h-[6px] overflow-hidden rounded-pill" aria-hidden="true"><div data-widget-motion="shine" className="w-[64%] bg-[var(--hue)]" /><div className="flex-1 bg-white/25" /></div>
        <p className="text-muted">Odds show market sentiment, not certainty.</p>
      </PreviewCard>
    );
  }
}
