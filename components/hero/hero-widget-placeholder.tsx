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
      className="w-full justify-between gap-1! rounded-md! p-1!"
      style={{ aspectRatio }}
    >
      <span className="text-xs leading-[20px] text-muted">
        {slotId.replace("slot-", "Slot ")}
      </span>
      <span className="wrap-anywhere text-xs leading-[20px] font-medium">
        {platform}
      </span>
      <span className="text-xs leading-[20px] text-muted">
        {recommendedSize}
      </span>
    </Card>
  );
}
