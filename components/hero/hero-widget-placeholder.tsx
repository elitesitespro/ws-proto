import { WidgetCard as Card } from "./widget-card";

type HeroWidgetPlaceholderProps = {
  slotId: string;
  platform: string;
  recommendedSize: string;
  aspectRatio: string;
};

export function HeroWidgetPlaceholder({
  slotId,
  platform,
  recommendedSize,
  aspectRatio,
}: HeroWidgetPlaceholderProps) {
  return (
    <Card
      className="w-full justify-between gap-1! rounded-lg! p-1! text-white"
      style={{ aspectRatio }}
    >
      <span className="text-xs leading-[20px] text-white/50">
        {slotId.replace("slot-", "Slot ")}
      </span>
      <span className="wrap-anywhere text-xs leading-[20px] font-medium">
        {platform}
      </span>
      <span className="text-xs leading-[20px] text-white/50">
        {recommendedSize}
      </span>
    </Card>
  );
}
