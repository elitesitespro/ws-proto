import type { ShowcasePlatformName } from "./platform-showcase-content";
import { WorldspacePlatformView } from "./worldspace-platform-view";
import { WorldcallPlatformView } from "./worldcall-platform-view";
import { WorldmeetPlatformView } from "./worldmeet-platform-view";
import { VsionPlatformView } from "./vsion-platform-view";
import { AiMoviePlatformView } from "./ai-movie-platform-view";
import { ArcadePlatformView } from "./arcade-platform-view";
import { WorldstorePlatformView } from "./worldstore-platform-view";
import { WorkworldPlatformView } from "./workworld-platform-view";
import { AcademyPlatformView } from "./academy-platform-view";
import { WorldhealthPlatformView } from "./worldhealth-platform-view";
import { ForexPlatformView } from "./forex-platform-view";
import { CryptoPlatformView } from "./crypto-platform-view";
import { XtreamPlatformView } from "./xtream-platform-view";
import { PredictionPlatformView } from "./prediction-platform-view";

const views = {
  WorldSpace: WorldspacePlatformView,
  WorldCall: WorldcallPlatformView,
  WorldMeet: WorldmeetPlatformView,
  Vsion: VsionPlatformView,
  "AI Movie": AiMoviePlatformView,
  Arcade: ArcadePlatformView,
  WorldStore: WorldstorePlatformView,
  WorkWorld: WorkworldPlatformView,
  Academy: AcademyPlatformView,
  WorldHealth: WorldhealthPlatformView,
  Forex: ForexPlatformView,
  Crypto: CryptoPlatformView,
  XStream: XtreamPlatformView,
  Prediction: PredictionPlatformView,
};

export function PlatformView({ name }: { name: ShowcasePlatformName }) {
  const View = views[name];
  return <View />;
}
