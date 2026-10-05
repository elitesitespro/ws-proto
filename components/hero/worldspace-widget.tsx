import Image from "next/image";
import { ChatCircle, DotsThree, Heart, PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr";
import { WidgetCard as Card } from "./widget-card";

/** A sample WorldSpace post for the landing page. */
export function WorldSpaceWidget() {
  return (
    <Card
      role="article"
      aria-label="Sample WorldSpace post by Amara Okafor"
      className="w-full gap-1! rounded-[24px]! p-2! text-white"
    >
      <div className="flex min-h-[44px] items-center gap-1">
        <Image
          src="/assets/images/amara-avatar.jpg"
          alt=""
          width={44}
          height={44}
          sizes="44px"
          className="size-[44px] shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1 text-xs leading-[20px]">
          <p className="font-semibold">Amara Okafor</p>
          <p className="text-white/60">@amara.okafor · 2h</p>
        </div>
        <DotsThree size={20} aria-hidden className="shrink-0 text-white/70" />
      </div>
      <p className="text-xs leading-3 text-white">
        Thrifted blazer, white tee, favorite jeans.
        <br />
        Would you add a belt?
      </p>
      <div className="flex gap-1 text-xs" aria-label="Post activity">
        {[
          { icon: Heart, label: "218", description: "218 likes", primary: true },
          { icon: ChatCircle, label: "34", description: "34 replies", primary: false },
          { icon: PaperPlaneTilt, label: "Share", description: "Share", primary: false },
        ].map(({ icon: Icon, label, description, primary }) => (
          <span
            key={description}
            aria-label={description}
            className={`flex h-6 min-w-0 flex-1 items-center justify-center gap-1 rounded-full ${primary ? "bg-white/20 text-white" : "bg-white/10 text-white/70"}`}
          >
            <Icon data-widget-motion={primary ? "pulse" : undefined} size={20} weight="fill" aria-hidden className="shrink-0" />
            {label}
          </span>
        ))}
      </div>
    </Card>
  );
}
