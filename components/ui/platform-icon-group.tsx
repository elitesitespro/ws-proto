import { Play, ShoppingBag, UsersRound } from "lucide-react"

import { Avatar, AvatarGroup } from "@/components/ui/avatar"
import { cn } from "cn"

export function PlatformIconGroup({ className }: { className?: string }) {
  return (
    <AvatarGroup aria-hidden="true" className={cn("shrink-0", className)}>
      <Avatar className="items-center justify-center bg-amber-400 text-[#070405] ring-2 ring-[#070405] md:size-5">
        <UsersRound className="size-(--icon-size-min)" />
      </Avatar>
      <Avatar className="items-center justify-center bg-violet-600 text-white ring-2 ring-[#070405] md:size-5">
        <Play className="size-(--icon-size-min)" />
      </Avatar>
      <Avatar className="items-center justify-center bg-emerald-500 text-white ring-2 ring-[#070405] md:size-5">
        <ShoppingBag className="size-(--icon-size-min)" />
      </Avatar>
    </AvatarGroup>
  )
}
