import type { ComponentType } from "react";
import type { ShowcasePlatformName } from "./platform-showcase-content";
import { AcademyStill } from "./academy/academy-still";
import { AiMovieStill } from "./ai-movie/ai-movie-still";
import { ArcadeStill } from "./arcade/arcade-still";
import { CryptoStill } from "./crypto/crypto-still";
import { EmbassyStill } from "./embassy/embassy-still";
import { ForexStill } from "./forex/forex-still";
import { PredictionStill } from "./prediction/prediction-still";
import { VisionStill } from "./vision/vision-still";
import { WorldworkStill } from "./workworld/worldwork-still";
import { WorldhealthStill } from "./worldhealth/worldhealth-still";
import { WorldmeetStill } from "./worldmeet/worldmeet-still";
import { WorldspaceStill } from "./worldspace/worldspace-still";
import { WorldsportsStill } from "./worldsports/worldsports-still";
import { WorldstoreStill } from "./worldstore/worldstore-still";
import { XtreamStill } from "./xtream/xtream-still";

/**
 * Every platform's still: what the dial shows of it on a phone or a tablet
 * (platform-view.tsx). They're small and have nothing to run, so they come
 * as one chunk, not one each like the demos.
 */
export function PlatformStill({ name }: { name: ShowcasePlatformName }) {
  const Still = platformStills[name];
  return <Still />;
}

const platformStills: Record<ShowcasePlatformName, ComponentType> = {
  WorldSpace: WorldspaceStill,
  WorldMeet: WorldmeetStill,
  XStream: XtreamStill,
  Vsion: VisionStill,
  "AI Movie": AiMovieStill,
  Arcade: ArcadeStill,
  WorldStore: WorldstoreStill,
  WorkWorld: WorldworkStill,
  Academy: AcademyStill,
  WorldHealth: WorldhealthStill,
  "E-Embassy": EmbassyStill,
  Forex: ForexStill,
  Crypto: CryptoStill,
  WorldSports: WorldsportsStill,
  Prediction: PredictionStill,
};
