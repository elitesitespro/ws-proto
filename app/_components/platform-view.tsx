"use client";

import dynamic from "next/dynamic";
import { createElement, memo, useEffect, useMemo, type ComponentType } from "react";
import { createRoot } from "react-dom/client";
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
let fetching: Promise<void> | null = null;

function fetchAll() {
  fetching ??= Promise.all(
    (Object.entries(fetchViews) as [Later, () => Promise<View>][]).map(([name, fetchView]) =>
      // A chunk that fails to come is fetched again by next/dynamic when its view is shown
      fetchView().then(
        (view) => {
          ready[name] = view;
        },
        () => {},
      ),
    ),
  ).then(() => {});
  return fetching;
}

const nextFrame = () => new Promise<void>((done) => requestAnimationFrame(() => done()));

/**
 * Every platform's demo, made ready while the hero's loader is up (lib/warm-page.ts): its chunk fetched, then the
 * demo put on for a moment, out of sight and untouchable, just long enough to ask for its pictures at the very sizes
 * it will ask for on the dial, and taken off again while they come in. One at a time, so the loader keeps turning.
 * `landed` is called as each one's pictures are in.
 */
export async function warmPlatformViews(landed: () => void = () => {}) {
  await fetchAll();
  const stage = document.createElement("div");
  stage.setAttribute("aria-hidden", "true");
  stage.inert = true;
  stage.style.cssText =
    "position:fixed;inset:0;visibility:hidden;pointer-events:none;overflow:hidden;z-index:-1;contain:strict";
  document.body.append(stage);
  const coming: Promise<void>[] = [];
  const clips: Promise<void>[] = [];
  for (const name of Object.keys(fetchViews) as Later[]) {
    const View = ready[name];
    if (!View) {
      landed();
      continue;
    }
    const host = document.createElement("div");
    host.style.cssText = "position:absolute;left:0;top:0;width:min(560px,100vw)";
    stage.append(host);
    // A demo that throws out here doesn't matter: it's shown for real on the dial
    const quiet = () => {};
    const root = createRoot(host, { onUncaughtError: quiet, onCaughtError: quiet, onRecoverableError: quiet });
    let pictures: HTMLImageElement[] = [];
    try {
      root.render(createElement(View));
      await nextFrame();
      await nextFrame();
      pictures = Array.from(host.querySelectorAll("img"));
      for (const img of pictures) if (img.loading === "lazy") img.loading = "eager";
      // Its clips (Xtream's rooms) into the cache too, whole: their files only. Out here no <video> is ever given its
      // clip (it waits to be showing, xtream-battle.tsx), so no media player starts. Each one kept hundreds of MB alive
      // until it was collected, enough for an iPhone's Safari to close the page as it was scrolled.
      for (const video of Array.from(host.querySelectorAll("video"))) {
        const src = video.currentSrc || video.src || video.dataset.src || video.querySelector("source")?.src;
        if (src) clips.push(fetch(src).then((response) => response.blob()).then(() => {}, () => {}));
      }
    } finally {
      // Off again at once: the pictures it asked for carry on coming in (decode() on each holds it)
      coming.push(Promise.all(pictures.map((img) => img.decode().catch(() => {}))).then(landed));
      root.unmount();
      host.remove();
    }
  }
  stage.remove();
  await Promise.all([...coming, ...clips]);
}
/** How many demos warmPlatformViews puts on. */
export const WARM_VIEWS = Object.keys(fetchViews).length;

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

// Memoised: the dial re-renders the section on every platform it passes, and without it the page showing (a whole
// demo) rendered again with each one, many times a second as the dial was flung, for nothing.
export const PlatformView = memo(function PlatformView({ name }: { name: ShowcasePlatformName }) {
  // Chosen once for each platform, so a view never swaps from one to the other (and starts over) while it's showing
  const View = useMemo(
    () => (name === "WorldSpace" ? WorldspacePlatformView : (ready[name] ?? lazyViews[name])),
    [name],
  );
  useEffect(fetchAhead, []);
  return <View />;
});
