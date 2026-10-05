import Image from "next/image";
import { Phone, PhoneDisconnect } from "@phosphor-icons/react/dist/ssr";
import { WidgetCard as Card } from "./widget-card";

/** A sample incoming call for the landing page. */
export function WorldCallWidget() {
  return (
    <Card
      role="group"
      aria-label="Sample WorldCall incoming call from Elena Morgan"
      className="w-full flex-row! items-center gap-1! rounded-full! p-1! text-white"
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
      <div className="min-w-0 flex-1 whitespace-nowrap text-xs leading-[20px] font-semibold">
        <p className="text-white/70">Incoming call</p>
        <p>Elena Morgan</p>
      </div>
      <div className="flex shrink-0 items-center gap-1" aria-hidden="true">
        <span className="flex size-5 items-center justify-center rounded-full bg-[#3E242D] text-[#FFA5B6]">
          <PhoneDisconnect size={20} weight="fill" />
        </span>
        <span data-widget-motion="answer-pulse" className="flex size-5 items-center justify-center rounded-full bg-[#179F72] text-white">
          <Phone size={20} weight="fill" data-widget-motion="ring" />
        </span>
      </div>
    </Card>
  );
}
