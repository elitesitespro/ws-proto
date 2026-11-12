"use client";

import dynamic from "next/dynamic";
import {
  createElement,
  memo,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ComponentType,
  type ReactNode,
} from "react";
import { createRoot } from "react-dom/client";
import type { ShowcasePlatformName } from "./platform-showcase-content";
import { AcademyPlatformView } from "./academy-platform-view";
import { AiMoviePlatformView } from "./ai-movie-platform-view";
import { ArcadePlatformView } from "./arcade-platform-view";
import { CryptoPlatformView } from "./crypto-platform-view";
import { EmbassyPlatformView } from "./embassy-platform-view";
import { ForexPlatformView } from "./forex-platform-view";
import { PredictionPlatformView } from "./prediction-platform-view";
import { VsionPlatformView } from "./vsion-platform-view";
import { WorkworldPlatformView } from "./workworld-platform-view";
import { WorldhealthPlatformView } from "./worldhealth-platform-view";
import { WorldmeetPlatformView } from "./worldmeet-platform-view";
import { WorldspacePlatformView } from "./worldspace-platform-view";
import { WorldsportsPlatformView } from "./worldsports-platform-view";
import { WorldstorePlatformView } from "./worldstore-platform-view";
import { XtreamPlatformView } from "./xtream-platform-view";

type Name = ShowcasePlatformName;
type Scene = ComponentType;
type Still = ComponentType<{ name: Name }>;

// Each platform's frame: its mark, its line and its way in. They're light, so they come with the page, and a
// platform's words are there the moment the dial turns to it. What goes in the frame depends on the screen.
const frames: Record<Name, ComponentType<{ children: ReactNode }>> = {
  WorldSpace: WorldspacePlatformView,
  WorldMeet: WorldmeetPlatformView,
  XStream: XtreamPlatformView,
  Vsion: VsionPlatformView,
  "AI Movie": AiMoviePlatformView,
  Arcade: ArcadePlatformView,
  WorldStore: WorldstorePlatformView,
  WorkWorld: WorkworldPlatformView,
  Academy: AcademyPlatformView,
  WorldHealth: WorldhealthPlatformView,
  "E-Embassy": EmbassyPlatformView,
  Forex: ForexPlatformView,
  Crypto: CryptoPlatformView,
  WorldSports: WorldsportsPlatformView,
  Prediction: PredictionPlatformView,
};

// A desktop gets each platform's demo, the one you can play: a chunk of its own, its styles with it, fetched ahead
// as the dial draws near, long before it turns to them. They only ever mount in the browser.
const Nothing = () => null;
// next/dynamic needs each import() and its options written into the call
const lazyDemos: Record<Name, Scene> = {
  WorldSpace: dynamic(() => import("./worldspace/worldspace-space").then((m) => m.WorldspaceSpace), {
    loading: Nothing,
  }),
  WorldMeet: dynamic(() => import("./worldmeet/worldmeet-call").then((m) => m.WorldmeetCall), { loading: Nothing }),
  XStream: dynamic(() => import("./xtream/xtream-battle").then((m) => m.XtreamBattle), { loading: Nothing }),
  Vsion: dynamic(() => import("./vision/vision-party").then((m) => m.VisionParty), { loading: Nothing }),
  "AI Movie": dynamic(() => import("./ai-movie/ai-movie-set").then((m) => m.AiMovieSet), { loading: Nothing }),
  Arcade: dynamic(() => import("./arcade/arcade-duel").then((m) => m.ArcadeDuel), { loading: Nothing }),
  WorldStore: dynamic(() => import("./worldstore/worldstore-deal").then((m) => m.WorldstoreDeal), {
    loading: Nothing,
  }),
  WorkWorld: dynamic(() => import("./workworld/worldwork-finder").then((m) => m.WorldworkFinder), {
    loading: Nothing,
  }),
  Academy: dynamic(() => import("./academy/academy-path").then((m) => m.AcademyPath), { loading: Nothing }),
  WorldHealth: dynamic(() => import("./worldhealth/worldhealth-consult").then((m) => m.WorldhealthConsult), {
    loading: Nothing,
  }),
  "E-Embassy": dynamic(() => import("./embassy/embassy-trip").then((m) => m.EmbassyTrip), { loading: Nothing }),
  Forex: dynamic(() => import("./forex/forex-desk").then((m) => m.ForexDesk), { loading: Nothing }),
  Crypto: dynamic(() => import("./crypto/crypto-desk").then((m) => m.CryptoDesk), { loading: Nothing }),
  WorldSports: dynamic(() => import("./worldsports/worldsports-share").then((m) => m.WorldsportsShare), {
    loading: Nothing,
  }),
  Prediction: dynamic(() => import("./prediction/prediction-call").then((m) => m.PredictionCall), {
    loading: Nothing,
  }),
};
// The same chunks, fetched ahead
const fetchDemos: Record<Name, () => Promise<Scene>> = {
  WorldSpace: () => import("./worldspace/worldspace-space").then((m) => m.WorldspaceSpace),
  WorldMeet: () => import("./worldmeet/worldmeet-call").then((m) => m.WorldmeetCall),
  XStream: () => import("./xtream/xtream-battle").then((m) => m.XtreamBattle),
  Vsion: () => import("./vision/vision-party").then((m) => m.VisionParty),
  "AI Movie": () => import("./ai-movie/ai-movie-set").then((m) => m.AiMovieSet),
  Arcade: () => import("./arcade/arcade-duel").then((m) => m.ArcadeDuel),
  WorldStore: () => import("./worldstore/worldstore-deal").then((m) => m.WorldstoreDeal),
  WorkWorld: () => import("./workworld/worldwork-finder").then((m) => m.WorldworkFinder),
  Academy: () => import("./academy/academy-path").then((m) => m.AcademyPath),
  WorldHealth: () => import("./worldhealth/worldhealth-consult").then((m) => m.WorldhealthConsult),
  "E-Embassy": () => import("./embassy/embassy-trip").then((m) => m.EmbassyTrip),
  Forex: () => import("./forex/forex-desk").then((m) => m.ForexDesk),
  Crypto: () => import("./crypto/crypto-desk").then((m) => m.CryptoDesk),
  WorldSports: () => import("./worldsports/worldsports-share").then((m) => m.WorldsportsShare),
  Prediction: () => import("./prediction/prediction-call").then((m) => m.PredictionCall),
};

// A phone or a tablet gets each platform's still (platform-stills.tsx): one picture of it, nothing to press. There
// the demos' controls ran into each other, and their script was weight a phone carried for nothing; it never
// fetches them now. The stills are small, so they're one chunk between them.
const LazyStill: Still = dynamic(() => import("./platform-stills").then((m) => m.PlatformStill), {
  loading: Nothing,
});

// Where the dial's own layout turns to its phone one (platform-timeline-section.tsx)
const PHONE = "(max-width: 1023px)";
type Kind = "still" | "demo";
const kindNow = (): Kind => (window.matchMedia(PHONE).matches ? "still" : "demo");
const watchKind = (changed: () => void) => {
  const list = window.matchMedia(PHONE);
  list.addEventListener("change", changed);
  return () => list.removeEventListener("change", changed);
};
const kindUnknown = () => null;

// Scenes whose chunk is in: a turn of the dial shows them straight away, with no frame of nothing while next/dynamic
// resolves them
const readyDemos: Partial<Record<Name, Scene>> = {};
let readyStill: Still | null = null;
let fetchingDemos: Promise<void> | null = null;
let fetchingStills: Promise<void> | null = null;

function fetchAllDemos() {
  fetchingDemos ??= Promise.all(
    (Object.entries(fetchDemos) as [Name, () => Promise<Scene>][]).map(([name, fetchDemo]) =>
      // A chunk that fails to come is fetched again by next/dynamic when its demo is shown
      fetchDemo().then(
        (demo) => {
          readyDemos[name] = demo;
        },
        () => {},
      ),
    ),
  ).then(() => {});
  return fetchingDemos;
}
function fetchStills() {
  fetchingStills ??= import("./platform-stills").then(
    (m) => {
      readyStill = m.PlatformStill;
    },
    () => {},
  );
  return fetchingStills;
}

/** What goes in a platform's frame on this screen, once its chunk is in. */
function sceneFor(name: Name, kind: Kind): ReactNode {
  if (kind === "still") return createElement(readyStill ?? LazyStill, { name });
  return createElement(readyDemos[name] ?? lazyDemos[name]);
}

const nextFrame = () => new Promise<void>((done) => requestAnimationFrame(() => done()));

/**
 * Every platform's scene, made ready while the hero's loader is up (lib/warm-page.ts): its chunk fetched, then the
 * scene put on for a moment, out of sight and untouchable, just long enough to ask for its pictures at the very sizes
 * it will ask for on the dial, and taken off again while they come in. One at a time, so the loader keeps turning.
 * `landed` is called as each one's pictures are in. On a phone that's the stills; on a desktop, the demos.
 */
export async function warmPlatformViews(landed: () => void = () => {}) {
  const kind = kindNow();
  await (kind === "still" ? fetchStills() : fetchAllDemos());
  const stage = document.createElement("div");
  stage.setAttribute("aria-hidden", "true");
  stage.inert = true;
  stage.style.cssText =
    "position:fixed;inset:0;visibility:hidden;pointer-events:none;overflow:hidden;z-index:-1;contain:strict";
  document.body.append(stage);
  const coming: Promise<void>[] = [];
  const clips: Promise<void>[] = [];
  for (const name of Object.keys(frames) as Name[]) {
    if (kind === "still" ? !readyStill : !readyDemos[name]) {
      landed();
      continue;
    }
    const host = document.createElement("div");
    host.style.cssText = "position:absolute;left:0;top:0;width:min(560px,100vw)";
    stage.append(host);
    // A scene that throws out here doesn't matter: it's shown for real on the dial
    const quiet = () => {};
    const root = createRoot(host, { onUncaughtError: quiet, onCaughtError: quiet, onRecoverableError: quiet });
    let pictures: HTMLImageElement[] = [];
    try {
      root.render(createElement(frames[name], null, sceneFor(name, kind)));
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
/** How many scenes warmPlatformViews puts on. */
export const WARM_VIEWS = Object.keys(frames).length;

/**
 * Fetch the demos as the dial comes within three screens: not with the page, where on a slow phone they'd land while
 * the hero's loader and globe are still settling, the moment not to add to. The stills are one small chunk, and the
 * dial opens on one, so they're fetched as soon as the screen's known to be a phone's.
 */
function fetchAhead(kind: Kind | null) {
  if (!kind) return;
  if (kind === "still") {
    fetchStills();
    return;
  }
  const dial = document.getElementById("discover");
  const near = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      near.disconnect();
      fetchAllDemos();
    },
    { rootMargin: "300% 0px" },
  );
  // No dial to watch: fetch them now
  if (dial) near.observe(dial);
  else fetchAllDemos();
  return () => near.disconnect();
}

// Memoised: the dial re-renders the section on every platform it passes, and without it the page showing (a whole
// scene) rendered again with each one, many times a second as the dial was flung, for nothing.
export const PlatformView = memo(function PlatformView({ name }: { name: ShowcasePlatformName }) {
  // Not known on the server or while the page hydrates: the frame alone until it is, so the HTML matches and a phone
  // never asks for a demo
  const kind = useSyncExternalStore(watchKind, kindNow, kindUnknown);
  // Chosen once for each platform and screen, so a scene never swaps from the lazy one to the ready one (and starts
  // over) while it's showing
  const scene = useMemo(() => (kind ? sceneFor(name, kind) : null), [name, kind]);
  useEffect(() => fetchAhead(kind), [kind]);
  const Frame = frames[name];
  return <Frame>{scene}</Frame>;
});
