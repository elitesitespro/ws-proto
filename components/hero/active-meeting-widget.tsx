import Image from "next/image";
import { DotsThree, Microphone, PhoneDisconnect, VideoCamera } from "@phosphor-icons/react/dist/ssr";
import { WidgetCard as Card } from "./widget-card";

/** Animated sample conversation for the landing page. */
export function ActiveMeetingWidget() {
  return (
    <Card role="group" aria-label="Sample WorldMeet meeting: Design sync, 4 participants" className="w-full gap-2! rounded-[24px]! p-2! text-xs text-white">
      <div className="flex items-center gap-1">
        <div className="flex-1">
          <p className="text-base font-semibold">Design sync</p>
          <p className="text-white/65">4 participants</p>
        </div>
        <span className="flex h-4 items-center gap-1 rounded-full bg-[#203B31] px-1 font-semibold text-[#95D8B8]">
          <span aria-hidden="true" data-widget-motion="live-dot" className="size-[8px] shrink-0 rounded-full bg-current" />
          Live
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="relative h-[76px] overflow-hidden rounded-[16px]">
            <Image src={`/assets/images/active-meeting-${index}.jpg`} alt="" fill sizes="72px" className="object-cover" />
            <span
              data-widget-motion="speaker"
              className="absolute inset-0 rounded-[16px] border-2 border-[#65B99A]"
              style={{ opacity: index === 1 ? 1 : 0, animationDelay: `${(index - 1) * 4 - 16}s` }}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1" aria-hidden="true">
        {[Microphone, VideoCamera, DotsThree].map((Icon, index) => (
          <span key={index} data-widget-motion={index === 0 ? "speaking-mic" : undefined} className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/80">
            <Icon size={20} weight={index === 2 ? "bold" : "fill"} />
          </span>
        ))}
        <span className="ml-auto flex h-5 items-center gap-1 rounded-full bg-[#E95561] px-2 font-medium text-white">
          <PhoneDisconnect size={20} weight="fill" /> Leave
        </span>
      </div>
    </Card>
  );
}
