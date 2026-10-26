import Image from "next/image";
import { Icon, type IconName } from "@/components/icon";
import { WidgetCard as Card } from "./widget-card";

const activity: readonly { icon: IconName; label: string; description: string; primary: boolean }[] = [
  { icon: "heart", label: "218", description: "218 likes", primary: true },
  { icon: "chat", label: "34", description: "34 replies", primary: false },
  { icon: "send", label: "Share", description: "Share", primary: false },
];

/** A sample WorldSpace post for the landing page. */
export function WorldSpaceWidget() {
  return (
    <Card
      data-hue="social"
      role="article"
      aria-label="Sample WorldSpace post by Amara Okafor"
      className="w-full gap-1! p-2!"
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
          <p className="font-medium">Amara Okafor</p>
          <p className="text-muted">@amara.okafor · 2h</p>
        </div>
        <Icon name="more" size={20} tone="current" className="shrink-0 text-muted" />
      </div>
      <p className="text-xs leading-3">
        Thrifted blazer, white tee, favorite jeans.
        <br />
        Would you add a belt?
      </p>
      <div className="flex gap-1 text-xs" aria-label="Post activity">
        {activity.map(({ icon, label, description, primary }) => (
          <span
            key={description}
            aria-label={description}
            className={`flex h-6 min-w-0 flex-1 items-center justify-center gap-1 rounded-pill tabular-nums ${primary ? "bg-(--hue-soft) text-(--hue-ink)" : "bg-surface-3 text-muted"}`}
          >
            <span data-widget-motion={primary ? "pulse" : undefined} className="flex shrink-0">
              <Icon name={icon} size={20} tone="current" />
            </span>
            {label}
          </span>
        ))}
      </div>
    </Card>
  );
}
