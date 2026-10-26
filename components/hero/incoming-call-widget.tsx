import Image from "next/image";
import { Icon } from "@/components/icon";
import { WidgetCard as Card, meetHue } from "./widget-card";

/** A sample incoming WorldMeet call for the landing page. */
export function IncomingCallWidget() {
  return (
    <Card
      role="group"
      aria-label="Sample WorldMeet incoming call from Elena Morgan"
      style={meetHue}
      className="w-full flex-row! items-center gap-1! rounded-full! p-1!"
    >
      <div className="size-5 shrink-0 overflow-hidden rounded-full">
        <Image
          src="/assets/images/elena-avatar.jpg"
          alt=""
          width={40}
          height={40}
          sizes="40px"
          className="size-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1 whitespace-nowrap text-xs leading-[20px] font-medium">
        <p className="text-muted">Incoming call</p>
        <p>Elena Morgan</p>
      </div>
      <div className="flex shrink-0 items-center gap-1" aria-hidden="true">
        <span className="flex size-5 items-center justify-center rounded-full bg-loss-wash text-loss">
          <Icon name="phone-end" size={20} tone="current" />
        </span>
        <span data-widget-motion="answer-pulse" className="flex size-5 items-center justify-center rounded-full bg-(--hue) text-(--hue-on)">
          <span data-widget-motion="ring" className="flex">
            <Icon name="phone" size={20} tone="current" />
          </span>
        </span>
      </div>
    </Card>
  );
}
