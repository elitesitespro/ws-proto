import Image from "next/image";
import { Icon, type IconName } from "@/components/icon";
import { WidgetCard as Card, meetHue } from "./widget-card";

const controls: readonly IconName[] = ["mic", "video", "more"];

/** Animated sample conversation for the landing page. */
export function ActiveMeetingWidget() {
  return (
    <Card role="group" aria-label="Sample WorldMeet meeting: Design sync, 4 participants" style={meetHue} className="w-full gap-2! p-2! text-xs">
      <div className="flex items-center gap-1">
        <div className="flex-1">
          <p className="text-base font-medium">Design sync</p>
          <p className="text-muted">4 participants</p>
        </div>
        <span className="flex h-4 items-center gap-1 rounded-pill bg-(--hue-soft) px-1 font-medium text-(--hue-ink)">
          <span aria-hidden="true" data-widget-motion="live-dot" className="size-[8px] shrink-0 rounded-full bg-current" />
          Live
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="relative h-[76px] overflow-hidden rounded-icon">
            <Image src={`/assets/images/active-meeting-${index}.jpg`} alt="" fill sizes="72px" className="object-cover" />
            <span
              data-widget-motion="speaker"
              className="absolute inset-0 rounded-icon border-2 border-(--hue)"
              style={{ opacity: index === 1 ? 1 : 0, animationDelay: `${(index - 1) * 4 - 16}s` }}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1" aria-hidden="true">
        {controls.map((name, index) => (
          <span key={name} data-widget-motion={index === 0 ? "speaking-mic" : undefined} className="flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-3 text-text-2">
            <Icon name={name} size={20} tone="current" />
          </span>
        ))}
        <span className="ml-auto flex h-5 items-center gap-1 rounded-pill bg-loss px-2 font-medium text-white">
          <Icon name="phone-end" size={20} tone="current" /> Leave
        </span>
      </div>
    </Card>
  );
}
