import Image from "next/image";
import { Icon } from "@/components/icon";
import { WidgetCard as Card, meetHue } from "./widget-card";
import { MeetingTimer } from "./meeting-timer";

/** Keep the portrait crops from the export's shared image. */
function MeetingPortrait({ header = false, index = 0 }: { header?: boolean; index?: number }) {
  const size = header ? 48 : 64;
  const ratio = size / (header ? 46.358 : 61.424);
  const x = header ? 190.066 : [146.606, 219.619, 292.632, 365.646, 437.5, 510.513][index];
  return (
    <span className="relative block shrink-0 overflow-hidden rounded-full" style={{ width: size, height: size }}>
      <Image
        src="/assets/images/meeting-source-1.png"
        alt=""
        fill
        sizes="720px"
        style={{
          transformOrigin: "0 0",
          transform: `matrix(${header ? 15 : 11.321}, 0, 0, ${header ? 11.25 : 8.491}, ${-x * ratio}, ${-(header ? 150.662 : 214.404) * ratio})`,
        }}
      />
      {!header && index === 3 && <span data-widget-motion="pulse" className="absolute inset-0 rounded-full border-4 border-(--hue)" />}
    </span>
  );
}

/** Sample meeting preview for the landing page. */
export function WorldMeetWidget() {
  return (
    <Card role="group" aria-label="Sample daily meet: Agilie, 8 participants" style={meetHue} className="w-full gap-0! p-0! text-xs">
      <div className="flex items-center gap-1 p-2">
        <MeetingPortrait header />
        <div className="flex-1">
          <p className="text-muted">Daily meet</p>
          <p className="font-medium">Agilie</p>
        </div>
        <MeetingTimer />
        <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-3">
          <Icon name="more" size={24} tone="current" />
        </span>
      </div>
      <div className="h-8 overflow-hidden" aria-hidden="true">
        <div className="flex w-max -translate-x-[28px] gap-1">
          {Array.from({ length: 6 }, (_, index) => <MeetingPortrait key={index} index={index} />)}
        </div>
      </div>
      <p className="flex items-center justify-center gap-1 leading-3 text-muted"><span aria-hidden="true">{[0, 1, 2].map((dot) => <span key={dot} data-widget-motion="dot" style={{ animationDelay: `${dot * 0.2}s` }}>•</span>)}</span> typing</p>
      <div className="flex items-center gap-1 bg-surface-2 p-2" aria-hidden="true">
        <span className="flex size-6 items-center justify-center rounded-full bg-surface-3"><Icon name="mic" size={24} tone="current" /></span>
        <span className="flex size-6 items-center justify-center rounded-full bg-surface-3 text-muted"><Icon name="video" size={24} tone="current" /></span>
        <span className="flex size-6 items-center justify-center rounded-full bg-surface-3"><span className="flex size-3 items-center justify-center rounded-full bg-(--hue) font-medium text-(--hue-on) tabular-nums">8</span></span>
        <span className="ml-auto flex size-6 items-center justify-center rounded-full bg-loss text-white"><Icon name="phone-end" size={24} tone="current" /></span>
      </div>
    </Card>
  );
}
