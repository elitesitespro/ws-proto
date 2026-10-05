import Image from "next/image";
import { Phone, Mic, Video, Film, Play, Gamepad2, ShoppingBag, MapPin, HeartPulse, Trophy } from "lucide-react";
import type { ReactNode } from "react";
import { WorldSpaceWidget } from "@/components/hero/worldspace-widget";
import { AcademyWidget } from "@/components/hero/academy-widget";
import { CryptoWidget } from "@/components/hero/crypto-widget";
import { ForexWidget } from "@/components/hero/forex-widget";
import { WidgetCard } from "@/components/hero/widget-card";
import type { PlatformPreviewKind } from "./platform-showcase-content";

function PreviewCard({ children }: { children: ReactNode }) {
  return <WidgetCard className="w-full gap-2! rounded-3xl! p-2! text-xs leading-3 text-white">{children}</WidgetCard>;
}

function DetailRow({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white/10 p-1">
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10" aria-hidden="true">{icon}</span>
      <div className="min-w-0"><p className="font-medium">{title}</p><p className="text-white/65">{detail}</p></div>
    </div>
  );
}

function ConversationPreview({ meeting }: { meeting: boolean }) {
  return (
    <PreviewCard>
      <div className="flex items-center justify-between gap-1">
        <p className="font-semibold">{meeting ? "Design sync" : "Time to catch up"}</p>
        <span className="flex items-center gap-1 text-[#95D8B8]"><span className="size-[8px] rounded-full bg-current" data-widget-motion="live-dot" />{meeting ? "In a call" : "Incoming"}</span>
      </div>
      {meeting ? (
        <div className="grid grid-cols-2 gap-1">
          {[1, 2].map((index) => <div key={index} className="relative h-[112px] overflow-hidden rounded-2xl"><Image src={`/assets/images/active-meeting-${index}.jpg`} alt="Sample participant" fill sizes="200px" className="object-cover" /><span data-widget-motion="speaker" className="absolute inset-0 rounded-2xl border-2 border-[#95D8B8]" style={{ opacity: index === 1 ? 1 : 0, animationDelay: `${index * 4 - 20}s` }} /></div>)}
        </div>
      ) : (
        <div className="flex items-center gap-2 py-2"><Image src="/assets/images/elena-avatar.jpg" alt="" width={64} height={64} className="size-8 rounded-full object-cover" /><div><p className="text-base font-semibold">Elena Morgan</p><p className="text-white/65">Would love to hear your news.</p></div></div>
      )}
      <div className="flex items-center gap-1" aria-hidden="true">
        {[Mic, Video, Phone].map((Icon, i) => <span key={i} data-widget-motion={i === 0 ? "speaking-mic" : undefined} className="flex size-5 items-center justify-center rounded-full bg-white/10"><Icon size={20} /></span>)}
        <span className="ml-auto text-white/65">{meeting ? "4 participants" : "Voice call"}</span>
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
        <div className="relative h-[144px] overflow-hidden rounded-2xl"><Image src="/assets/images/dune-0.jpg" alt="Dune: Part Two film artwork" fill sizes="(min-width: 1024px) 480px, 100vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" /><p className="absolute bottom-2 left-2 font-semibold">Dune: Part Two</p></div>
        <DetailRow icon={<Play size={20} />} title="A night in, together" detail="Watch party · 6 friends" />
      </PreviewCard>
    );
    case "live": return (
      <PreviewCard>
        <div className="relative h-[128px] overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/40 to-fuchsia-500/20 p-2">
          <span className="flex items-center gap-1"><span data-widget-motion="live-dot" className="size-[8px] rounded-full bg-[#95D8B8]" />Live room</span>
          <div className="mt-2 flex items-center gap-2"><Image src="/assets/images/amara-avatar.jpg" width={48} height={48} alt="" className="size-6 rounded-full object-cover" /><div><p className="font-semibold">The creative hour</p><p className="text-white/70">With Amara · 240 watching</p></div></div>
        </div>
        <p className="rounded-2xl bg-white/10 p-1"><span className="font-semibold">Tobi</span> <span className="text-white/70">That colour palette is so good.</span></p>
        <p className="text-white/65">A conversation everyone can join.</p>
      </PreviewCard>
    );
    case "studio": return (
      <PreviewCard>
        <div className="flex items-center gap-1"><Film size={20} /><span className="font-semibold">Your next short film</span><span className="ml-auto text-white/60">Draft</span></div>
        <div className="rounded-2xl bg-white/10 p-2"><p className="mb-1 text-white/60">Scene 01 · A new beginning</p><p>A quiet street. The first bus arrives. Someone steps out with a story to tell.</p></div>
        <div className="flex items-center gap-1"><span className="text-white/65">Cast</span>{[1, 2, 3].map((n) => <Image key={n} src={`/assets/images/active-meeting-${n}.jpg`} alt="Sample cast portrait" width={40} height={40} className="size-5 rounded-full object-cover" />)}<span className="ml-auto text-white/65">3 characters</span></div>
      </PreviewCard>
    );
    case "arcade": return (
      <PreviewCard>
        <div className="flex items-center gap-1"><Trophy size={20} className="text-amber-300" /><p className="font-semibold">Your next challenge</p><span className="ml-auto text-white/65">Level 12</span></div>
        <DetailRow icon={<Gamepad2 size={20} />} title="Trivia Duel" detail="You vs. the Street Bot" />
        <div className="flex justify-between"><span>Daily progress</span><span className="text-white/65">2 of 3 complete</span></div>
        <div className="h-[8px] overflow-hidden rounded-lg bg-white/10" role="progressbar" aria-label="Sample daily progress" aria-valuenow={2} aria-valuemin={0} aria-valuemax={3}><div className="h-full w-2/3 rounded-lg bg-amber-300" /></div>
      </PreviewCard>
    );
    case "store": return (
      <PreviewCard>
        <div className="flex h-[112px] items-center justify-center rounded-2xl bg-gradient-to-br from-amber-200/20 to-amber-800/20"><ShoppingBag size={64} strokeWidth={1.5} className="text-amber-200" aria-hidden="true" /></div>
        <div className="flex flex-wrap items-center justify-between gap-1"><p className="font-semibold">Everyday tote</p><p>₦45,000</p></div>
        <p className="text-white/65">Local seller · Lagos</p>
      </PreviewCard>
    );
    case "work": return (
      <PreviewCard>
        <div className="flex items-center gap-1"><MapPin size={20} /><p className="font-semibold">People nearby</p></div>
        <DetailRow icon={<span>TA</span>} title="Tunde · Welder" detail="0.8 km away · Gate repairs" />
        <DetailRow icon={<span>IM</span>} title="Ifeanyi · Metalwork" detail="1.2 km away · Custom fittings" />
      </PreviewCard>
    );
    case "health": return (
      <PreviewCard>
        <div className="flex items-center gap-1"><HeartPulse size={20} className="text-rose-300" /><p className="font-semibold">Space to talk</p></div>
        <DetailRow icon={<Video size={20} />} title="Your consultation" detail="Choose video, audio or text" />
        <div className="flex gap-1"><span className="rounded-lg bg-white/10 px-1 py-1">Video</span><span className="rounded-lg bg-white/10 px-1 py-1">Audio</span><span className="rounded-lg bg-white/10 px-1 py-1">Text</span></div>
      </PreviewCard>
    );
    case "prediction": return (
      <PreviewCard>
        <p className="text-white/65">Music · Sample market</p><p className="text-base font-semibold">Will this week’s number one stay on top?</p>
        <div className="flex justify-between"><span className="text-[#95D8B8]">Yes · 64%</span><span className="text-[#FFA5B6]">No · 36%</span></div>
        <div className="flex h-[8px] overflow-hidden rounded-lg" aria-hidden="true"><div data-widget-motion="shine" className="w-[64%] bg-[#95D8B8]" /><div className="flex-1 bg-[#FFA5B6]" /></div>
        <p className="text-white/65">Odds show market sentiment, not certainty.</p>
      </PreviewCard>
    );
  }
}
