"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, type ComponentType } from "react";
import type { ShowcasePlatformName } from "./platform-showcase-content";
import { WorldspacePlatformView } from "./worldspace-platform-view";

type View = ComponentType;
type Later = Exclude<ShowcasePlatformName, "WorldSpace">;

// The dial opens on WorldSpace, so it comes with the page. Every other platform's demo is a chunk of its own, its
// styles with it, fetched ahead as the dial draws near, long before it turns to them: the page's first load carries
// one demo instead of all of them. They only ever mount in the browser, so nothing server-rendered waits on them.
const Nothing = () => null;
// next/dynamic needs each import() and its options written into the call
const lazyViews: Record<Later, View> = {
  WorldMeet: dynamic(() => import("./worldmeet-platform-view").then((m) => m.WorldmeetPlatformView), {
    loading: Nothing,
  }),
  Vsion: dynamic(() => import("./vsion-platform-view").then((m) => m.VsionPlatformView), { loading: Nothing }),
  "AI Movie": dynamic(() => import("./ai-movie-platform-view").then((m) => m.AiMoviePlatformView), {
    loading: Nothing,
  }),
  Arcade: dynamic(() => import("./arcade-platform-view").then((m) => m.ArcadePlatformView), { loading: Nothing }),
  WorldStore: dynamic(() => import("./worldstore-platform-view").then((m) => m.WorldstorePlatformView), {
    loading: Nothing,
  }),
  WorkWorld: dynamic(() => import("./workworld-platform-view").then((m) => m.WorkworldPlatformView), {
    loading: Nothing,
  }),
  Academy: dynamic(() => import("./academy-platform-view").then((m) => m.AcademyPlatformView), { loading: Nothing }),
  WorldHealth: dynamic(() => import("./worldhealth-platform-view").then((m) => m.WorldhealthPlatformView), {
    loading: Nothing,
  }),
  "E-Embassy": dynamic(() => import("./embassy-platform-view").then((m) => m.EmbassyPlatformView), {
    loading: Nothing,
  }),
  Forex: dynamic(() => import("./forex-platform-view").then((m) => m.ForexPlatformView), { loading: Nothing }),
  Crypto: dynamic(() => import("./crypto-platform-view").then((m) => m.CryptoPlatformView), { loading: Nothing }),
  XStream: dynamic(() => import("./xtream-platform-view").then((m) => m.XtreamPlatformView), { loading: Nothing }),
  WorldSports: dynamic(() => import("./worldsports-platform-view").then((m) => m.WorldsportsPlatformView), {
    loading: Nothing,
  }),
  Prediction: dynamic(() => import("./prediction-platform-view").then((m) => m.PredictionPlatformView), {
    loading: Nothing,
  }),
};
// The same chunks, fetched ahead
const fetchViews: Record<Later, () => Promise<View>> = {
  WorldMeet: () => import("./worldmeet-platform-view").then((m) => m.WorldmeetPlatformView),
  Vsion: () => import("./vsion-platform-view").then((m) => m.VsionPlatformView),
  "AI Movie": () => import("./ai-movie-platform-view").then((m) => m.AiMoviePlatformView),
  Arcade: () => import("./arcade-platform-view").then((m) => m.ArcadePlatformView),
  WorldStore: () => import("./worldstore-platform-view").then((m) => m.WorldstorePlatformView),
  WorkWorld: () => import("./workworld-platform-view").then((m) => m.WorkworldPlatformView),
  Academy: () => import("./academy-platform-view").then((m) => m.AcademyPlatformView),
  WorldHealth: () => import("./worldhealth-platform-view").then((m) => m.WorldhealthPlatformView),
  "E-Embassy": () => import("./embassy-platform-view").then((m) => m.EmbassyPlatformView),
  Forex: () => import("./forex-platform-view").then((m) => m.ForexPlatformView),
  Crypto: () => import("./crypto-platform-view").then((m) => m.CryptoPlatformView),
  XStream: () => import("./xtream-platform-view").then((m) => m.XtreamPlatformView),
  WorldSports: () => import("./worldsports-platform-view").then((m) => m.WorldsportsPlatformView),
  Prediction: () => import("./prediction-platform-view").then((m) => m.PredictionPlatformView),
};

// Views whose chunk is in: a turn of the dial shows them straight away, with no frame of nothing while next/dynamic
// resolves them
const ready: Partial<Record<Later, View>> = {};
let fetching = false;

function fetchAll() {
  if (fetching) return;
  fetching = true;
  for (const [name, fetchView] of Object.entries(fetchViews) as [Later, () => Promise<View>][]) {
    // A chunk that fails to come is fetched again by next/dynamic when its view is shown
    fetchView().then((view) => (ready[name] = view), () => {});
  }
}

/**
 * Fetch the rest as the dial comes within three screens: not with the page, where on a slow phone they'd land while
 * the hero's loader and globe are still settling, the moment not to add to.
 */
function fetchAhead() {
  const dial = document.getElementById("discover");
  const near = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      near.disconnect();
      fetchAll();
    },
    { rootMargin: "300% 0px" },
  );
  // No dial to watch: fetch them now
  if (dial) near.observe(dial);
  else fetchAll();
  return () => near.disconnect();
}

export function PlatformView({ name }: { name: ShowcasePlatformName }) {
  // Chosen once for each platform, so a view never swaps from one to the other (and starts over) while it's showing
  const View = useMemo(
    () => (name === "WorldSpace" ? WorldspacePlatformView : (ready[name] ?? lazyViews[name])),
    [name],
  );
  useEffect(fetchAhead, []);
  return <View />;
}
