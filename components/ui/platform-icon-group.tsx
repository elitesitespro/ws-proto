import { Icon, type IconName } from "@/components/icon"
import { Avatar, AvatarGroup } from "@/components/ui/avatar"
import { cn } from "cn"

// Each chip wears its platform's hue only on the glyph and a faint wash, on a
// stone fill (app/hues.css): social, watch, shop.
const platforms: readonly { hue: string; icon: IconName }[] = [
  { hue: "social", icon: "users" },
  { hue: "watch", icon: "play" },
  { hue: "shop", icon: "shopping-bag" },
]

export function PlatformIconGroup({ className }: { className?: string }) {
  return (
    <AvatarGroup aria-hidden="true" className={cn("shrink-0", className)}>
      {platforms.map(({ hue, icon }) => (
        <Avatar
          key={hue}
          data-hue={hue}
          className="items-center justify-center bg-card bg-[linear-gradient(var(--hue-soft),var(--hue-soft))] text-(--hue) ring-2 ring-background md:size-5"
        >
          <Icon name={icon} size={20} tone="current" />
        </Avatar>
      ))}
    </AvatarGroup>
  )
}
