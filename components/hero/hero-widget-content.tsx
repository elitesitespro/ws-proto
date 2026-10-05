import type { ReactNode } from "react";
import { HeroWidgetPlaceholder } from "./hero-widget-placeholder";
import { WorldSpaceWidget } from "./worldspace-widget";
import { WorldCallWidget } from "./worldcall-widget";
import { ForexWidget } from "./forex-widget";
import { CryptoWidget } from "./crypto-widget";
import { AcademyWidget } from "./academy-widget";
import { WorldMeetWidget } from "./worldmeet-widget";
import { XStreamWidget } from "./xstream-widget";
import { ActiveMeetingWidget } from "./active-meeting-widget";
import { PredictionWidget } from "./prediction-widget";

// Swap any placeholder for your component here; layout stays in hero-widget-layout.ts.
// Example: "slot-01": <WorldSpaceWidget />
export const heroWidgetContent: Readonly<Record<string, ReactNode>> = {
  "slot-01": <WorldSpaceWidget />,
  "slot-02": <HeroWidgetPlaceholder slotId="slot-02" platform="Wallet" recommendedSize="96 × auto" aspectRatio="4 / 5" />,
  "slot-03": <AcademyWidget />,
  "slot-04": <WorldCallWidget />,
  "slot-05": <CryptoWidget />,
  "slot-06": <ActiveMeetingWidget />,
  "slot-07": <XStreamWidget />,
  "slot-08": <ForexWidget />,
  "slot-09": <WorldMeetWidget />,
  "slot-10": <PredictionWidget />,
};
