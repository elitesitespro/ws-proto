"use client";

import { useEffect, useImperativeHandle, useRef, type Ref, type RefObject } from "react";
import { preload } from "react-dom";
import { cn } from "cn";
import {
  ARC_FRAGMENT_SHADER,
  ARC_VERTEX_SHADER,
  FRAGMENT_SHADER,
  LAUNCH_FRAGMENT_SHADER,
  LAUNCH_HEAD_FRAGMENT_SHADER,
  NOISE_FRAGMENT_SHADER,
  VERTEX_SHADER,
} from "./night-globe-shader";

/** Where the planet sits in its box: centre as fractions of the box, radius as a fraction of its height.
 *  lens: 0 (default) is the flat, orthographic view; 1 is a perspective camera
 *  with about a 35° field of view. The planet keeps its radius on screen at
 *  any lens, so a large radius with lens 1 brings the camera down towards the
 *  surface. With lens 1 it reaches the cloud deck's tops near radius 9.4 and
 *  is wholly inside cloud from radius 10.3. */
export type GlobePlacement = { x: number; y: number; radius: number; lens?: number };

type NightGlobeProps = {
  className?: string;
  /** Desktop placement. */
  placement?: GlobePlacement;
  /** Placement below 768px wide. */
  mobilePlacement?: GlobePlacement;
  /** Radians per second. */
  speed?: number;
  /** The city lights' colour as "r, g, b" (0–255, like the hub's --hue-rgb).
   *  Gold when unset. Changes ease in; the crescent, rim, sparks and arcs stay gold. */
  lights?: string;
  /** Layers laid over the same box. Every element in them with data-lat and
   *  data-lon is moved onto that point each frame: a transform to the point,
   *  --x, how far across the box it is, and --facing, 1 to 0 towards the
   *  limb, for the element to fade by. (Not
   *  opacity on the element itself: that would cut glass inside it off from
   *  the globe behind.) */
  pins?: RefObject<HTMLElement | null> | readonly RefObject<HTMLElement | null>[];
  /** Called as the pointer moves with the place under it, or null off the planet. */
  onHoverPlace?: (place: LatLon | null) => void;
  /** Called on a tap or click on the planet (not a drag), with the place under it. */
  onTapPlace?: (place: LatLon) => void;
  /** Whether a place can be tapped: over one, the cursor offers a click instead of a grab. */
  tappable?: (place: LatLon) => boolean;
  /** Eases the turning to a stop and holds the pointer parallax, e.g. while
   *  a pin is under the pointer. Dragging still works. */
  paused?: boolean;
  /** Called once, when the planet first shows (or at once where it can't be
   *  drawn), e.g. for a loader waiting on it. */
  onReady?: () => void;
  ref?: Ref<NightGlobeHandle>;
};

/** A point on the planet as it sits on screen: CSS pixels from the box's top
 *  left, and how squarely it faces the viewer (1 dead centre, 0 on the limb,
 *  below 0 behind). */
export type ProjectedPoint = { x: number; y: number; front: number };
/** [latitude, longitude] in degrees. */
export type LatLon = readonly [number, number];
export type NightGlobeHandle = {
  /** Null until the Earth image has loaded, and while the globe turns to a place.
   *  With `ahead`, where the place will be that many seconds on, as the planet
   *  turns by itself. */
  project: (lat: number, lon: number, ahead?: number) => ProjectedPoint | null;
  /** Turns the globe to bring a place into view, a little left of centre and
   *  just below the middle. Eased once the planet is showing (it waits for the
   *  image); at once when the loop is stopped, as under reduced motion. */
  turnTo: (place: LatLon) => void;
  /** Fires gold arcs from one place out to others, one after another, and
   *  returns the seconds until each lands. Under reduced motion none are
   *  drawn and every arrival is 0. */
  launch: (from: LatLon, to: readonly LatLon[], timing?: { delay?: number; stagger?: number }) => number[];
  /** Holds the city lights down, 0 to 1 (eased), e.g. while one card has focus. */
  dim: (amount: number) => void;
  /** Moves the planet in its box, e.g. as the page scrolls; null puts it back
   *  to its placement. */
  frame: (placement: GlobePlacement | null) => void;
  /** Turns the planet by an extra angle in radians on top of its own turning,
   *  e.g. as the page scrolls (negative turns it on the way it already goes); 0 for none. */
  spin: (radians: number) => void;
  /** 0 is the night look; 1 full day, the sun in front and the Earth in its
   *  real colours. Between, a sunrise. Applied at once (no easing). */
  daylight: (amount: number) => void;
  /** 0 no clouds; 1 full cloud cover. Applied at once. */
  clouds: (amount: number) => void;
};

type Rgb = [number, number, number];
const GOLD_RGB: Rgb = [234 / 255, 179 / 255, 8 / 255];

/** "r, g, b" (0–255) to 0–1, or gold when unset or unreadable. */
function toRgb(value?: string): Rgb {
  const parts = value?.split(",").map((n) => Number(n.trim()) / 255);
  return parts?.length === 3 && parts.every(Number.isFinite) ? (parts as Rgb) : GOLD_RGB;
}

const EARTH_SRC = "/assets/globe/black-marble-2016.jpg";
// The day: loaded once the night is showing. Phones take the smaller images.
const DAY_SRC = ["/assets/globe/blue-marble-day.jpg", "/assets/globe/blue-marble-day-2k.jpg"] as const;
const CLOUDS_SRC = ["/assets/globe/clouds.jpg", "/assets/globe/clouds-2k.jpg"] as const;
const WATER_SRC = "/assets/globe/water-mask.png";
const MAX_DPR = 1.75;
// Below this lens the view is flat (and the sums stay exact)
const MIN_LENS = 0.001;
// The camera's focal length at lens 1, in screen heights (about 35° of view)
const FOCAL = 1.6;
// The sun: behind the planet's upper right at night, so only a crescent is
// lit; in front and to the upper right by day, with a sliver of night left
// along the lower left limb
const SUN_NIGHT = unit([0.62, 0.52, -0.58]);
const SUN_DAY = unit([0.55, 0.45, 0.62]);
// The clouds drift east (radians a second), slowed as the camera nears the
// surface so they never race across the screen
const CLOUD_DRIFT = 0.004;
// Heights above the surface, in planet radii, that match the shader's: the
// arcs fade out above ARC_FADE, the marched cloud deck takes over between
// DEEP_FROM and DEEP_TO, and the air thickens from HAZE_FROM down
const ARC_FADE = [0.95, 0.5] as const;
const DEEP_FROM = 0.05;
const DEEP_TO = 0.025;
const HAZE_FROM = 1.2;
// The cloud below thickens and more forms as the camera comes down from
// GATHER_FROM to GATHER_TO (radius about 0.5 to 5 at lens 1), at an even
// pace in the zoom, so the clouds build all the way down to the deck, and
// even a dive over clear sky has cloud below it
const GATHER_FROM = 2.4;
const GATHER_TO = 0.05;
// The longitude facing the viewer: Europe and Africa, as in the inspiration
const START_SPIN = 0.32;
// Negative tips the north pole towards the viewer, so Europe sits mid-disc
const TILT = -0.62;

// Cities WorldStreet connects, [latitude, longitude]. Lagos is the hub.
const CITIES = {
  lagos: [6.52, 3.38],
  accra: [5.6, -0.19],
  london: [51.51, -0.13],
  paris: [48.86, 2.35],
  frankfurt: [50.11, 8.68],
  newYork: [40.71, -74.01],
  dubai: [25.2, 55.27],
  johannesburg: [-26.2, 28.05],
  nairobi: [-1.29, 36.82],
  cairo: [30.04, 31.24],
  istanbul: [41.01, 28.98],
  mumbai: [19.08, 72.88],
  singapore: [1.35, 103.82],
  moscow: [55.76, 37.62],
} as const;
type City = keyof typeof CITIES;
const ROUTES: [City, City][] = [
  ["lagos", "london"],
  ["lagos", "newYork"],
  ["lagos", "dubai"],
  ["lagos", "johannesburg"],
  ["lagos", "paris"],
  ["accra", "lagos"],
  ["london", "newYork"],
  ["london", "dubai"],
  ["frankfurt", "moscow"],
  ["paris", "istanbul"],
  ["cairo", "nairobi"],
  ["dubai", "mumbai"],
  ["dubai", "singapore"],
  ["nairobi", "johannesburg"],
];
const ARC_SEGMENTS = 64;
const LAUNCH_TRAVEL = 0.8; // seconds for a launch arc's head to run its route

/** A point on the unit sphere in the planet shader's frame (longitude 0 faces +z, east is +x). */
function toWorld([lat, lon]: LatLon) {
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180;
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
}

/** One route as line segments into `data`: x, y, z, t along the route, and
 *  `tag` (a route's seed, or a launch arc's launch time). `rise` scales how
 *  high it lifts off the surface. */
function pushArc(data: number[], from: LatLon, to: LatLon, tag: number, rise = 1) {
  const a = toWorld(from);
  const b = toWorld(to);
  const angle = Math.acos(Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
  const lift = (0.04 + 0.22 * (angle / Math.PI)) * rise; // longer routes rise higher
  const point = (t: number) => {
    // Spherical interpolation, then lifted off the surface mid-route
    const s = Math.sin(angle) || 1;
    const ka = Math.sin((1 - t) * angle) / s;
    const kb = Math.sin(t * angle) / s;
    const h = 1 + lift * Math.sin(Math.PI * t);
    return [(a[0] * ka + b[0] * kb) * h, (a[1] * ka + b[1] * kb) * h, (a[2] * ka + b[2] * kb) * h];
  };
  for (let i = 0; i < ARC_SEGMENTS; i++) {
    const t0 = i / ARC_SEGMENTS;
    const t1 = (i + 1) / ARC_SEGMENTS;
    data.push(...point(t0), t0, tag, ...point(t1), t1, tag);
  }
}

/** Every route, each with its own seed. */
function buildArcs() {
  const data: number[] = [];
  ROUTES.forEach(([from, to], index) => pushArc(data, CITIES[from], CITIES[to], (index * 0.618034) % 1));
  return new Float32Array(data);
}

type Vec3 = [number, number, number];

function unit([x, y, z]: Vec3): Vec3 {
  const l = Math.hypot(x, y, z);
  return [x / l, y / l, z / l];
}

/** 0 at `from`, 1 at `to` (either way round), smoothed. */
function smooth(from: number, to: number, v: number) {
  const t = Math.min(Math.max((v - from) / (to - from), 0), 1);
  return t * t * (3 - 2 * t);
}

/** The sun's direction for a daylight amount: swung round from behind the
 *  planet to the front at an even pace. */
function sunAt(amount: number): Vec3 {
  const t = Math.min(Math.max(amount, 0), 1);
  const angle = Math.acos(SUN_NIGHT[0] * SUN_DAY[0] + SUN_NIGHT[1] * SUN_DAY[1] + SUN_NIGHT[2] * SUN_DAY[2]);
  const a = Math.sin((1 - t) * angle) / Math.sin(angle);
  const b = Math.sin(t * angle) / Math.sin(angle);
  return [SUN_NIGHT[0] * a + SUN_DAY[0] * b, SUN_NIGHT[1] * a + SUN_DAY[1] * b, SUN_NIGHT[2] * a + SUN_DAY[2] * b];
}

/** The camera for a placement in a canvas `height` device pixels tall. Flat:
 *  `dist` 0. Perspective: a pinhole on +z, `focal` in device pixels and
 *  `dist` planet radii from the centre, set so the planet's outline stays
 *  `radius` × height on screen. `scale` is how many device pixels a radian of
 *  surface spans at the middle of the disc. */
function cameraFor(place: GlobePlacement, height: number) {
  const rpx = place.radius * height;
  const lens = place.lens ?? 0;
  if (!(lens >= MIN_LENS)) return { rpx, focal: 0, dist: 0, scale: rpx };
  const focal = (FOCAL * height) / lens;
  const dist = Math.sqrt(1 + (focal / rpx) ** 2);
  return { rpx, focal, dist, scale: focal / (dist - 1) };
}

// The noise volume's size, texels a side (see NOISE_FRAGMENT_SHADER)
const NOISE_SIZE = 64;

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("[night-globe]", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * The night side of the Earth with its cities lit in WorldStreet gold (or
 * the colour in `lights`), a gold crescent on the limb, sparks streaming
 * off it, and gold arcs
 * pulsing between the cities WorldStreet connects. One WebGL2 canvas
 * filling its box; drag it to spin, and the cities under the pointer burn
 * brighter. It can turn to a place and fire one-off arcs (see the handle).
 * Still under reduced motion, paused when it's off screen or the tab is
 * hidden.
 */
export function NightGlobe({
  className,
  placement = { x: 0.7, y: 0.5, radius: 0.46 },
  mobilePlacement = { x: 0.5, y: 0.98, radius: 0.42 },
  speed = 0.045,
  lights,
  pins,
  paused = false,
  onHoverPlace,
  onTapPlace,
  tappable,
  onReady,
  ref,
}: NightGlobeProps) {
  // The Earth image is the one thing the planet waits on: asked for from the
  // page's head, it downloads alongside the scripts rather than after them
  preload(EARTH_SRC, { as: "image", fetchPriority: "high" });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // The live handle, set up with the GL state; the one given out forwards to it
  const apiRef = useRef<NightGlobeHandle | null>(null);
  const pausedRef = useRef(paused);

  useImperativeHandle(
    ref,
    () => ({
      project: (lat, lon, ahead) => apiRef.current?.project(lat, lon, ahead) ?? null,
      turnTo: (place) => apiRef.current?.turnTo(place),
      launch: (from, to, timing) => apiRef.current?.launch(from, to, timing) ?? to.map(() => 0),
      dim: (amount) => apiRef.current?.dim(amount),
      frame: (placement) => apiRef.current?.frame(placement),
      spin: (radians) => apiRef.current?.spin(radians),
      daylight: (amount) => apiRef.current?.daylight(amount),
      clouds: (amount) => apiRef.current?.clouds(amount),
    }),
    []
  );

  // The pointer callbacks, read by the GL setup's listeners
  const pointerRef = useRef({ onHoverPlace, onTapPlace, tappable });
  useEffect(() => {
    pointerRef.current = { onHoverPlace, onTapPlace, tappable };
  }, [onHoverPlace, onTapPlace, tappable]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);
  // Read by the draw loop, so a new colour doesn't rebuild the GL setup
  const lightRef = useRef<Rgb>(toRgb(lights));
  const repaintRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    lightRef.current = toRgb(lights);
    repaintRef.current?.();
  }, [lights]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: false, premultipliedAlpha: true, alpha: true });
    if (!gl) {
      canvas.dataset.fallback = "true";
      onReadyRef.current?.();
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("[night-globe]", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // One triangle that covers the canvas
    const planetVao = gl.createVertexArray();
    gl.bindVertexArray(planetVao);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const u = {
      resolution: gl.getUniformLocation(program, "uResolution"),
      center: gl.getUniformLocation(program, "uCenter"),
      radius: gl.getUniformLocation(program, "uRadius"),
      time: gl.getUniformLocation(program, "uTime"),
      spin: gl.getUniformLocation(program, "uSpin"),
      tilt: gl.getUniformLocation(program, "uTilt"),
      ready: gl.getUniformLocation(program, "uReady"),
      earth: gl.getUniformLocation(program, "uEarth"),
      light: gl.getUniformLocation(program, "uLight"),
      pointer: gl.getUniformLocation(program, "uPointer"),
      torch: gl.getUniformLocation(program, "uTorch"),
      dim: gl.getUniformLocation(program, "uDim"),
      focal: gl.getUniformLocation(program, "uFocal"),
      dist: gl.getUniformLocation(program, "uDist"),
      sun: gl.getUniformLocation(program, "uSun"),
      daylight: gl.getUniformLocation(program, "uDaylight"),
      clouds: gl.getUniformLocation(program, "uClouds"),
      dayReady: gl.getUniformLocation(program, "uDayReady"),
      waterReady: gl.getUniformLocation(program, "uWaterReady"),
      noiseReady: gl.getUniformLocation(program, "uNoiseReady"),
      drift: gl.getUniformLocation(program, "uDrift"),
      deep: gl.getUniformLocation(program, "uDeep"),
      haze: gl.getUniformLocation(program, "uHaze"),
      gather: gl.getUniformLocation(program, "uGather"),
    };
    gl.uniform1i(gl.getUniformLocation(program, "uDay"), 1);
    gl.uniform1i(gl.getUniformLocation(program, "uCloudMap"), 2);
    gl.uniform1i(gl.getUniformLocation(program, "uWater"), 3);
    gl.uniform1i(gl.getUniformLocation(program, "uNoise"), 4);

    // The arcs: a second program with its own vertex array
    const arcVs = compile(gl, gl.VERTEX_SHADER, ARC_VERTEX_SHADER);
    const arcFs = compile(gl, gl.FRAGMENT_SHADER, ARC_FRAGMENT_SHADER);
    const arcProgram = gl.createProgram();
    if (!arcVs || !arcFs || !arcProgram) return;
    gl.attachShader(arcProgram, arcVs);
    gl.attachShader(arcProgram, arcFs);
    gl.linkProgram(arcProgram);
    if (!gl.getProgramParameter(arcProgram, gl.LINK_STATUS)) {
      console.error("[night-globe]", gl.getProgramInfoLog(arcProgram));
      return;
    }
    const arcData = buildArcs();
    const arcCount = arcData.length / 5;
    const arcVao = gl.createVertexArray();
    gl.bindVertexArray(arcVao);
    const arcBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, arcBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, arcData, gl.STATIC_DRAW);
    const stride = 5 * 4;
    const aPoint = gl.getAttribLocation(arcProgram, "aPoint");
    const aT = gl.getAttribLocation(arcProgram, "aT");
    const aSeed = gl.getAttribLocation(arcProgram, "aSeed");
    gl.enableVertexAttribArray(aPoint);
    gl.vertexAttribPointer(aPoint, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(aT);
    gl.vertexAttribPointer(aT, 1, gl.FLOAT, false, stride, 12);
    gl.enableVertexAttribArray(aSeed);
    gl.vertexAttribPointer(aSeed, 1, gl.FLOAT, false, stride, 16);
    gl.bindVertexArray(null);
    const ua = {
      resolution: gl.getUniformLocation(arcProgram, "uResolution"),
      center: gl.getUniformLocation(arcProgram, "uCenter"),
      radius: gl.getUniformLocation(arcProgram, "uRadius"),
      spin: gl.getUniformLocation(arcProgram, "uSpin"),
      tilt: gl.getUniformLocation(arcProgram, "uTilt"),
      time: gl.getUniformLocation(arcProgram, "uTime"),
      focal: gl.getUniformLocation(arcProgram, "uFocal"),
      dist: gl.getUniformLocation(arcProgram, "uDist"),
      fade: gl.getUniformLocation(arcProgram, "uFade"),
    };

    // Launch arcs: the arc vertex shader again, with their own fragment
    // shaders (the thread as lines, the head as points) and one buffer,
    // refilled for each launch. Both programs read it through one vertex
    // array, so their attributes are bound to the same slots.
    const LAUNCH_ATTRIBUTES = [["aPoint", 3, 0], ["aT", 1, 12], ["aSeed", 1, 16]] as const;
    const launchFs = compile(gl, gl.FRAGMENT_SHADER, LAUNCH_FRAGMENT_SHADER);
    const headFs = compile(gl, gl.FRAGMENT_SHADER, LAUNCH_HEAD_FRAGMENT_SHADER);
    const launchProgram = gl.createProgram();
    const headProgram = gl.createProgram();
    if (!launchFs || !headFs || !launchProgram || !headProgram) return;
    for (const [p, f] of [[launchProgram, launchFs], [headProgram, headFs]] as const) {
      gl.attachShader(p, arcVs);
      gl.attachShader(p, f);
      LAUNCH_ATTRIBUTES.forEach(([name], slot) => gl.bindAttribLocation(p, slot, name));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        console.error("[night-globe]", gl.getProgramInfoLog(p));
        return;
      }
    }
    const launchVao = gl.createVertexArray();
    gl.bindVertexArray(launchVao);
    const launchBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, launchBuffer);
    LAUNCH_ATTRIBUTES.forEach(([, size, offset], slot) => {
      gl.enableVertexAttribArray(slot);
      gl.vertexAttribPointer(slot, size, gl.FLOAT, false, stride, offset);
    });
    gl.bindVertexArray(null);
    const launchUniforms = (p: WebGLProgram) => ({
      resolution: gl.getUniformLocation(p, "uResolution"),
      center: gl.getUniformLocation(p, "uCenter"),
      radius: gl.getUniformLocation(p, "uRadius"),
      spin: gl.getUniformLocation(p, "uSpin"),
      tilt: gl.getUniformLocation(p, "uTilt"),
      time: gl.getUniformLocation(p, "uTime"),
      travel: gl.getUniformLocation(p, "uTravel"),
      pointSize: gl.getUniformLocation(p, "uPointSize"),
      focal: gl.getUniformLocation(p, "uFocal"),
      dist: gl.getUniformLocation(p, "uDist"),
      fade: gl.getUniformLocation(p, "uFade"),
    });
    const ul = launchUniforms(launchProgram);
    const uh = launchUniforms(headProgram);
    let launchCount = 0;
    let launchEnds = 0; // the clock time by which every launch arc has faded
    gl.useProgram(program);

    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([4, 4, 12, 255]));
    gl.uniform1i(u.earth, 0);
    let ready = 0;

    // The day's images on units 1 to 3 and the noise on 4, each a stand-in
    // pixel until it arrives. The clouds and the water mask are one channel.
    const blank = (unit: number, mono: boolean) => {
      const t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      if (mono) gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, 1, 1, 0, gl.RED, gl.UNSIGNED_BYTE, new Uint8Array([0]));
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([8, 20, 48, 255]));
      return t;
    };
    const dayTexture = blank(1, false);
    const cloudTexture = blank(2, true);
    const waterTexture = blank(3, true);
    const noiseTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_3D, noiseTexture);
    gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA, 1, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([128, 128, 128, 128]));
    gl.activeTexture(gl.TEXTURE0);
    // Each 0 until its image has arrived, then 1; `shown` eases after them
    // so nothing pops in
    const loaded = { day: 0, clouds: 0, water: 0, noise: 0 };
    const shown = { ...loaded };
    let disposed = false;
    let noiseTimer = 0;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Spin: time plus whatever the visitor dragged, eased; a little pointer parallax
    let spin = START_SPIN;
    let dragVelocity = 0;
    let dragging = false;
    let lastX = 0;
    let parallaxX = 0;
    let parallaxY = 0;
    let targetX = 0;
    let targetY = 0;
    // 1 while turning, easing to 0 while paused
    let turning = pausedRef.current ? 0 : 1;
    let tiltBase = TILT;
    // A turn to a place, eased from where the globe was; one asked for before
    // the image has loaded waits for it
    let turn: { spin0: number; spin1: number; tilt0: number; tilt1: number; t: number; duration: number } | null = null;
    let pendingTurn: LatLon | null = null;
    // The pointer's torch: where it is (device pixels from the bottom left), and how lit
    let pointerX = 0;
    let pointerY = 0;
    let torch = 0;
    let torchTarget = 0;
    let dimmed = 0;
    let dimTarget = 0;
    // A placement set from outside (scrolling), over the props'
    let framed: GlobePlacement | null = null;
    // An extra turn set from outside (scrolling), on top of the spin
    let spinBy = 0;
    // The sunrise and the cloud cover, set from outside (scrolling)
    let daylight = 0;
    let cloudCover = 0;
    // How far the clouds have drifted east of the ground, radians
    let drift = 0;

    let frame = 0;
    let running = false;
    // While the loop is stopped (reduced motion, off screen), changes from
    // outside are drawn once before the next paint, however many arrive together
    let redrawing = 0;
    const redraw = () => {
      if (running || redrawing) return;
      redrawing = requestAnimationFrame(() => {
        redrawing = 0;
        if (!running) draw();
      });
    };
    let visible = true;
    let last = performance.now();
    let clock = 0;

    // The lights' colour as drawn, easing towards lightRef
    const light: Rgb = [...lightRef.current];
    // A new colour while the loop is stopped (reduced motion, off screen) is drawn at once
    repaintRef.current = () => {
      if (running) return;
      [light[0], light[1], light[2]] = lightRef.current;
      draw();
    };

    function resize() {
      if (!canvas || !gl) return;
      const box = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      width = Math.max(1, Math.round(box.width * dpr));
      height = Math.max(1, Math.round(box.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
    }

    const view = () => {
      const place = framed ?? (width / dpr < 768 ? mobilePlacement : placement);
      return { place, cam: cameraFor(place, height), spun: spin + spinBy + parallaxX * 0.18, tilt: tiltBase + parallaxY * 0.06 };
    };

    /** Where a latitude and longitude sit on screen: the arc shader's world-to-view turn, done here.
     *  `ahead`: where they'll be that many seconds on, at the planet's own turn (as in the loop). */
    function project(lat: number, lon: number, ahead = 0): ProjectedPoint {
      const { place, cam, spun: now, tilt } = view();
      const spun = now - speed * Math.min(1, height / cam.scale) * ahead;
      const [wx, wy, wz] = toWorld([lat, lon]);
      // Undo the spin...
      const cs = Math.cos(-spun);
      const sn = Math.sin(-spun);
      const x = cs * wx + sn * wz;
      const z1 = -sn * wx + cs * wz;
      // ...then the tilt
      const ct = Math.cos(-tilt);
      const st = Math.sin(-tilt);
      const y = ct * wy - st * z1;
      const z = st * wy + ct * z1;
      if (cam.dist) {
        // Perspective: nearer points spread wider, and a point faces the
        // camera only once it's past the tangent circle, z > 1 / dist
        const s = cam.focal / (cam.dist - z);
        const front = (z - 1 / cam.dist) / (1 - 1 / cam.dist);
        return { x: (place.x * width + x * s) / dpr, y: (place.y * height - y * s) / dpr, front };
      }
      const radius = place.radius * height;
      return { x: (place.x * width + x * radius) / dpr, y: (place.y * height - y * radius) / dpr, front: z };
    }

    function turnTo([lat, lon]: LatLon) {
      if (!ready) {
        pendingTurn = [lat, lon];
        return;
      }
      // The place 20° west of centre, and the view tipped so it sits just below the
      // middle; on a phone, where the planet sits low under the headline,
      // in the middle and a little above it
      const narrow = width / dpr < 768;
      const target = ((lon + (narrow ? 0 : 20)) * Math.PI) / 180;
      const spin1 = spin + Math.atan2(Math.sin(target - spin), Math.cos(target - spin)); // the short way round
      const centre = narrow ? Math.min(Math.max(lat - 10, -40), 30) : Math.min(Math.max(lat + 12, -20), 40);
      const tilt1 = (-centre * Math.PI) / 180;
      if (!running) {
        spin = spin1;
        tiltBase = tilt1;
        turn = null;
        draw();
        return;
      }
      turn = { spin0: spin, spin1, tilt0: tiltBase, tilt1, t: 0, duration: 1.2 + Math.abs(spin1 - spin) * 0.6 };
    }

    function launch(from: LatLon, to: readonly LatLon[], { delay = 0, stagger = 0.14 } = {}) {
      if (!gl || !ready || reduced.matches) return to.map(() => 0);
      const data: number[] = [];
      const arrivals = to.map((place, i) => {
        // Launch arcs lift higher than the routes, so even a short hop reads as a flight
        pushArc(data, from, place, clock + delay + i * stagger, 1.4);
        return delay + i * stagger + LAUNCH_TRAVEL;
      });
      gl.bindBuffer(gl.ARRAY_BUFFER, launchBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
      launchCount = data.length / 5;
      launchEnds = clock + Math.max(0, ...arrivals) + 4;
      return arrivals;
    }

    apiRef.current = {
      project: (lat, lon, ahead) => (ready && !turn ? project(lat, lon, ahead) : null),
      turnTo,
      launch,
      dim: (amount) => {
        dimTarget = amount;
        if (!running) {
          dimmed = amount;
          redraw();
        }
      },
      frame: (placement) => {
        framed = placement;
        redraw();
      },
      spin: (radians) => {
        spinBy = radians;
        redraw();
      },
      daylight: (amount) => {
        daylight = Math.min(Math.max(amount, 0), 1);
        redraw();
      },
      clouds: (amount) => {
        cloudCover = Math.min(Math.max(amount, 0), 1);
        redraw();
      },
    };

    /** The place under a point of the box (CSS px from its top left), or null off the planet. */
    function locate(px: number, py: number): LatLon | null {
      const { place, cam, spun, tilt } = view();
      let x: number;
      let y: number;
      let z: number;
      if (cam.dist) {
        // The pixel's ray from the camera, met with the sphere: as the planet
        // shader does it, from the ray's closest point to the centre
        const ox = px * dpr - place.x * width;
        const oy = place.y * height - py * dpr;
        const oo = ox * ox + oy * oy;
        const l2 = oo + cam.focal * cam.focal;
        const h2 = (cam.dist * cam.dist * oo) / l2;
        if (h2 > 1) return null;
        const k = (cam.dist * cam.focal) / l2;
        const back = Math.sqrt(1 - h2) / Math.sqrt(l2);
        x = ox * k - ox * back;
        y = oy * k - oy * back;
        z = (cam.dist * oo) / l2 + cam.focal * back;
      } else {
        const radius = place.radius * height;
        x = (px * dpr - place.x * width) / radius;
        y = (place.y * height - py * dpr) / radius;
        const rr = x * x + y * y;
        if (rr > 1) return null;
        z = Math.sqrt(1 - rr);
      }
      // View to world, as the planet shader turns it: the tilt, then the spin
      const ct = Math.cos(tilt);
      const st = Math.sin(tilt);
      const y1 = ct * y - st * z;
      const z1 = st * y + ct * z;
      const cs = Math.cos(spun);
      const sn = Math.sin(spun);
      const wx = cs * x + sn * z1;
      const wz = -sn * x + cs * z1;
      return [(Math.asin(Math.min(1, Math.max(-1, y1))) * 180) / Math.PI, (Math.atan2(wx, wz) * 180) / Math.PI];
    }

    const pinLayers = () => (Array.isArray(pins) ? pins : pins ? [pins] : []) as readonly RefObject<HTMLElement | null>[];

    function placePins() {
      for (const ref of pinLayers()) {
        const layer = ref.current;
        if (layer) placeIn(layer);
      }
    }

    function placeIn(layer: HTMLElement) {
      for (const el of layer.querySelectorAll<HTMLElement>("[data-lat][data-lon]")) {
        const p = project(Number(el.dataset.lat), Number(el.dataset.lon));
        // Fade out as the point turns towards the limb; gone behind it
        const facing = ready ? Math.min(Math.max((p.front - 0.12) / 0.2, 0), 1) : 0;
        el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
        el.style.setProperty("--facing", facing.toFixed(3));
        // How far across it is, for what keeps itself on screen beside it
        el.style.setProperty("--x", `${p.x.toFixed(1)}px`);
        el.style.visibility = facing > 0.02 ? "visible" : "hidden";
      }
    }

    function draw() {
      if (!gl) return;
      const { place, cam, spun, tilt } = view();
      // gl_FragCoord runs from the bottom left
      const cx = place.x * width;
      const cy = (1 - place.y) * height;
      const radius = cam.rpx;
      // The camera's height above the ground, in planet radii (flat: far off)
      const altitude = cam.dist ? cam.dist - 1 : Infinity;
      const sun = sunAt(daylight);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.bindVertexArray(planetVao);
      gl.uniform2f(u.resolution, width, height);
      gl.uniform2f(u.center, cx, cy);
      gl.uniform1f(u.radius, radius);
      gl.uniform1f(u.focal, cam.focal);
      gl.uniform1f(u.dist, cam.dist);
      gl.uniform1f(u.time, clock);
      gl.uniform1f(u.spin, spun);
      gl.uniform1f(u.tilt, tilt);
      gl.uniform1f(u.ready, ready);
      gl.uniform3f(u.light, light[0], light[1], light[2]);
      gl.uniform2f(u.pointer, pointerX, pointerY);
      gl.uniform1f(u.torch, torch);
      gl.uniform1f(u.dim, dimmed);
      gl.uniform3f(u.sun, sun[0], sun[1], sun[2]);
      gl.uniform1f(u.daylight, daylight * ready);
      gl.uniform1f(u.clouds, cloudCover * shown.clouds);
      gl.uniform1f(u.dayReady, shown.day);
      gl.uniform1f(u.waterReady, shown.water);
      gl.uniform1f(u.noiseReady, shown.noise);
      gl.uniform1f(u.drift, drift);
      // The deck is only marched through near it, and only with clouds to march
      gl.uniform1f(u.deep, smooth(DEEP_FROM, DEEP_TO, altitude) * Math.min(cloudCover * 4, 1) * shown.clouds);
      gl.uniform1f(u.haze, smooth(HAZE_FROM, 0, altitude) * daylight);
      // (by the altitude's log: each halving of the height gathers as much)
      const gather = smooth(Math.log(GATHER_FROM), Math.log(GATHER_TO), Math.log(altitude));
      gl.uniform1f(u.gather, gather * cloudCover);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // The arcs fade as the camera comes down towards their height
      const arcFade = cam.dist ? smooth(ARC_FADE[1], ARC_FADE[0], altitude) : 1;
      if (ready && arcFade > 0) {
        gl.useProgram(arcProgram);
        gl.bindVertexArray(arcVao);
        gl.uniform2f(ua.resolution, width, height);
        gl.uniform2f(ua.center, cx, cy);
        gl.uniform1f(ua.radius, radius);
        gl.uniform1f(ua.focal, cam.focal);
        gl.uniform1f(ua.dist, cam.dist);
        gl.uniform1f(ua.fade, arcFade);
        gl.uniform1f(ua.spin, spun);
        gl.uniform1f(ua.tilt, tilt);
        gl.uniform1f(ua.time, clock);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
        gl.drawArrays(gl.LINES, 0, arcCount);
        if (launchCount && clock < launchEnds) {
          gl.bindVertexArray(launchVao);
          for (const [p, us, mode] of [[launchProgram, ul, gl.LINES], [headProgram, uh, gl.POINTS]] as const) {
            gl.useProgram(p);
            gl.uniform2f(us.resolution, width, height);
            gl.uniform2f(us.center, cx, cy);
            gl.uniform1f(us.radius, radius);
            gl.uniform1f(us.focal, cam.focal);
            gl.uniform1f(us.dist, cam.dist);
            gl.uniform1f(us.fade, arcFade);
            gl.uniform1f(us.spin, spun);
            gl.uniform1f(us.tilt, tilt);
            gl.uniform1f(us.time, clock);
            gl.uniform1f(us.travel, LAUNCH_TRAVEL);
            gl.uniform1f(us.pointSize, 9 * dpr);
            gl.drawArrays(mode, 0, launchCount);
          }
        }
        gl.disable(gl.BLEND);
      }
      gl.bindVertexArray(null);
      placePins();
    }

    function tick(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      clock += dt;
      turning += ((pausedRef.current ? 0 : 1) - turning) * Math.min(dt * 4, 1);
      torch += (torchTarget - torch) * Math.min(dt * 5, 1);
      dimmed += (dimTarget - dimmed) * Math.min(dt * 5, 1);
      // Close in, a radian of surface spans far more of the screen: the
      // turning and the clouds' drift slow to match, so neither races past
      const near = Math.min(1, height / view().cam.scale);
      if (turn) {
        turn.t = Math.min(turn.t + dt / turn.duration, 1);
        const k = turn.t < 0.5 ? 4 * turn.t ** 3 : 1 - (-2 * turn.t + 2) ** 3 / 2; // ease in and out
        spin = turn.spin0 + (turn.spin1 - turn.spin0) * k;
        tiltBase = turn.tilt0 + (turn.tilt1 - turn.tilt0) * k;
        if (turn.t >= 1) turn = null;
      } else if (!dragging) {
        // West to east, as the Earth turns: the facing longitude falls
        spin -= speed * turning * near * dt;
        spin += dragVelocity * dt;
        dragVelocity *= Math.pow(0.04, dt); // the flick slows to the resting turn
      }
      drift += CLOUD_DRIFT * near * dt;
      // The day's images fade in as they arrive (and settle exactly, as the
      // shader skips work once they're wholly in)
      for (const key of ["day", "clouds", "water", "noise"] as const) {
        shown[key] += (loaded[key] - shown[key]) * Math.min(dt * 2.5, 1);
        if (Math.abs(loaded[key] - shown[key]) < 0.002) shown[key] = loaded[key];
      }
      // Paused, the parallax holds where it is, so nothing slides under the pointer
      if (!pausedRef.current) {
        parallaxX += (targetX - parallaxX) * Math.min(dt * 3, 1);
        parallaxY += (targetY - parallaxY) * Math.min(dt * 3, 1);
      }
      // A new colour eases in over about a second; before the image shows it just takes it
      const ease = ready ? Math.min(dt * 3, 1) : 1;
      for (let i = 0; i < 3; i++) light[i] += (lightRef.current[i] - light[i]) * ease;
      draw();
      frame = requestAnimationFrame(tick);
    }

    function start() {
      if (running || reduced.matches || !visible || document.hidden) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(frame);
    }

    /** Once loaded, an image into a texture on its unit, with mipmaps; one
     *  channel for `mono` (the clouds, the water). */
    const loadInto = (unit: number, target: WebGLTexture | null, src: string, mono: boolean, key: keyof typeof loaded) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        if (disposed) return;
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, target);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        if (mono) gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, gl.RED, gl.UNSIGNED_BYTE, img);
        else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const aniso = gl.getExtension("EXT_texture_filter_anisotropic");
        if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, 8);
        gl.activeTexture(gl.TEXTURE0);
        arrived(key);
      };
      img.src = src;
    };

    /** Something for the day has arrived: it fades in, or shows at once when the loop is stopped. */
    function arrived(key: keyof typeof loaded) {
      loaded[key] = 1;
      if (!running) {
        shown[key] = 1;
        redraw();
      }
    }

    /** The day's images and the noise, fetched once the night is showing so the hero isn't held up. */
    const loadDay = () => {
      const small = width / dpr < 768 ? 1 : 0;
      loadInto(1, dayTexture, DAY_SRC[small], false, "day");
      loadInto(2, cloudTexture, CLOUDS_SRC[small], true, "clouds");
      loadInto(3, waterTexture, WATER_SRC, true, "water");
      // The noise isn't needed until the camera comes in close
      noiseTimer = window.setTimeout(makeNoise, 1200);
    };

    /** Draws the noise volume once, slice by slice, on the GPU, a few
     *  slices a frame: milliseconds in all, where working it out here would
     *  hold the page up. */
    const makeNoise = () => {
      const noiseFs = compile(gl, gl.FRAGMENT_SHADER, NOISE_FRAGMENT_SHADER);
      const noiseProgram = gl.createProgram();
      const target = gl.createFramebuffer();
      if (disposed || !noiseFs || !noiseProgram || !target) return;
      gl.attachShader(noiseProgram, vs);
      gl.attachShader(noiseProgram, noiseFs);
      // The planet's triangle, read through its vertex array
      gl.bindAttribLocation(noiseProgram, aPosition, "aPosition");
      gl.linkProgram(noiseProgram);
      const done = () => {
        gl.deleteFramebuffer(target);
        gl.deleteProgram(noiseProgram);
        gl.deleteShader(noiseFs);
      };
      if (!gl.getProgramParameter(noiseProgram, gl.LINK_STATUS)) {
        console.error("[night-globe]", gl.getProgramInfoLog(noiseProgram));
        done();
        return;
      }
      gl.activeTexture(gl.TEXTURE4);
      gl.bindTexture(gl.TEXTURE_3D, noiseTexture);
      gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA8, NOISE_SIZE, NOISE_SIZE, NOISE_SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      // Readable (if not yet read) while it fills: no mipmaps until the end
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      for (const axis of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T, gl.TEXTURE_WRAP_R]) {
        gl.texParameteri(gl.TEXTURE_3D, axis, gl.REPEAT);
      }
      gl.activeTexture(gl.TEXTURE0);
      const slice = gl.getUniformLocation(noiseProgram, "uSlice");
      let z = 0;
      const fill = () => {
        noiseTimer = 0;
        if (disposed) return done();
        gl.useProgram(noiseProgram);
        gl.bindVertexArray(planetVao);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target);
        gl.viewport(0, 0, NOISE_SIZE, NOISE_SIZE);
        for (const end = Math.min(z + 16, NOISE_SIZE); z < end; z++) {
          gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, noiseTexture, 0, z);
          gl.uniform1f(slice, z);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, width, height);
        gl.bindVertexArray(null);
        if (z < NOISE_SIZE) {
          noiseTimer = window.setTimeout(fill, 16);
          return;
        }
        gl.activeTexture(gl.TEXTURE4);
        gl.generateMipmap(gl.TEXTURE_3D);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.activeTexture(gl.TEXTURE0);
        done();
        arrived("noise");
      };
      fill();
    };

    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      if (disposed) return;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const aniso = gl.getExtension("EXT_texture_filter_anisotropic");
      if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, 8);
      ready = 1;
      if (pendingTurn) {
        const place = pendingTurn;
        pendingTurn = null;
        turnTo(place);
      }
      draw();
      loadDay();
      onReadyRef.current?.();
    };
    image.src = EARTH_SRC;

    resize();
    draw();
    start();

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    const onMotion = () => {
      if (reduced.matches) {
        stop();
        draw();
      } else start();
    };
    reduced.addEventListener("change", onMotion);

    // Pointer: parallax anywhere over the box, drag to spin on the planet
    const host = canvas.parentElement ?? canvas;
    const onMove = (e: PointerEvent) => {
      const box = host.getBoundingClientRect();
      // Held still while paused, so a pin doesn't slide out from under the pointer
      if (!pausedRef.current) {
        targetX = ((e.clientX - box.left) / box.width - 0.5) * 2;
        targetY = ((e.clientY - box.top) / box.height - 0.5) * 2;
      }
      // Over the planet: the torch lights, and the cursor offers a grab, or a
      // click over a place that can be tapped
      pointerX = (e.clientX - box.left) * dpr;
      pointerY = height - (e.clientY - box.top) * dpr;
      const under = ready ? locate(e.clientX - box.left, e.clientY - box.top) : null;
      torchTarget = under ? 1 : 0;
      const { onHoverPlace: hover, tappable: canTap } = pointerRef.current;
      hover?.(dragging ? null : under);
      canvas.style.cursor = dragging ? "grabbing" : under ? (canTap?.(under) ? "pointer" : "grab") : "";
      if (dragging && height) {
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        // The surface follows the pointer at the planet's size on screen now
        const perPixel = dpr / view().cam.scale;
        // Dragging right carries the surface right
        spin -= dx * perPixel;
        dragVelocity = (-dx * perPixel) / (1 / 60);
        if (reduced.matches) draw();
      }
    };
    let downAt: { x: number; y: number; t: number } | null = null;
    const onDown = (e: PointerEvent) => {
      // A drag takes over from any turn under way
      turn = null;
      dragging = true;
      downAt = { x: e.clientX, y: e.clientY, t: performance.now() };
      canvas.style.cursor = "grabbing";
      lastX = e.clientX;
      dragVelocity = 0;
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      canvas.style.cursor = torchTarget ? "grab" : "";
      // A press that barely moved is a tap on the place under it
      const press = downAt;
      downAt = null;
      if (!press || e.type !== "pointerup" || Math.hypot(e.clientX - press.x, e.clientY - press.y) > 6 || performance.now() - press.t > 600) return;
      const box = host.getBoundingClientRect();
      const place = ready ? locate(e.clientX - box.left, e.clientY - box.top) : null;
      if (place) pointerRef.current.onTapPlace?.(place);
    };
    const onLeave = () => {
      torchTarget = 0;
      pointerRef.current.onHoverPlace?.(null);
      if (pausedRef.current) return;
      targetX = 0;
      targetY = 0;
    };

    // New pins are placed straight away, even while the loop is stopped
    const pinWatch = new MutationObserver(placePins);
    for (const ref of pinLayers()) {
      if (ref.current) pinWatch.observe(ref.current, { childList: true, subtree: true });
    }
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    return () => {
      stop();
      cancelAnimationFrame(redrawing);
      window.clearTimeout(noiseTimer);
      disposed = true;
      repaintRef.current = null;
      apiRef.current = null;
      pinWatch.disconnect();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", onMotion);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      gl.deleteTexture(texture);
      gl.deleteTexture(dayTexture);
      gl.deleteTexture(cloudTexture);
      gl.deleteTexture(waterTexture);
      gl.deleteTexture(noiseTexture);
      gl.deleteBuffer(buffer);
      gl.deleteBuffer(arcBuffer);
      gl.deleteBuffer(launchBuffer);
      gl.deleteVertexArray(planetVao);
      gl.deleteVertexArray(arcVao);
      gl.deleteVertexArray(launchVao);
      gl.deleteProgram(program);
      gl.deleteProgram(arcProgram);
      gl.deleteProgram(launchProgram);
      gl.deleteProgram(headProgram);
      gl.deleteShader(launchFs);
      gl.deleteShader(headFs);
      gl.deleteShader(arcVs);
      gl.deleteShader(arcFs);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
    // Placement objects and the pin layer's ref are read live through the
    // closure; re-running the whole GL setup on every render isn't wanted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn(
        "absolute inset-0 size-full touch-pan-y select-none",
        // Without WebGL2: a still gold glow where the planet would be
        "data-[fallback=true]:bg-[radial-gradient(circle_at_70%_50%,rgba(234,179,8,0.16),transparent_45%)]",
        className
      )}
    />
  );
}
