import type { ComponentProps } from "react";
import { cn } from "cn";
import { Card } from "@/components/ui/card";

/** Shared solid charcoal surface for the floating hero widgets. */
export function WidgetCard({
  className,
  ...props
}: ComponentProps<typeof Card>) {
  return (
    <Card
      {...props}
      className={cn(
        "bg-[#211C20] ring-1 ring-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.24)]",
        className,
      )}
    />
  );
}
