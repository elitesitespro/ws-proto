"use client";

import { useEffect, useRef, type PointerEvent } from "react";
import { useScroll } from "motion/react";
import { usePauseOffscreen } from "@/lib/use-pause-offscreen";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "cn";
import { ACCOUNT_LINKS } from "@/components/layout/nav-links";
import { buttonVariants } from "@/components/ui/button";
import { visitorPlace } from "../globe-hero/visitor-place";
import { RevealWords } from "../street/reveal-words";
import { VividGlobe } from "../vivid/vivid-globe";
import { VIVID_URL } from "../vivid/vivid-links";
import { LAND_DOTS } from "../worldmeet/globe-dots";
import styles from "./join-cta.module.css";

// Where "you" are when the browser doesn't say: Lagos
const HOME: readonly [number, number] = [6.52, 3.38];
// Where the world runs out to from you: one gold arc to each
const CITIES: readonly (readonly [number, number])[] = [
  [51.51, -0.13], // London
  [40.71, -74.01], // New York
  [25.2, 55.27], // Dubai
  [-1.29, 36.82], // Nairobi
  [-26.2, 28.05], // Johannesburg
  [43.65, -79.38], // Toronto
  [19.08, 72.88], // Mumbai
  [5.6, -0.19], // Accra
  [-23.55, -46.63], // São Paulo
  [48.86, 2.35], // Paris
];

// The hero globe's land and water map (equirectangular, land black). The land
// is sampled from it at the planet's size, so the coastline stays sharp
// however big the planet is drawn.
const MASK_SRC = "/assets/globe/water-mask.png";
// The gap between land dots on screen (px)
const PITCH = { wide: 9, narrow: 7 };

const D2R = Math.PI / 180;
const BG = [12, 10, 9];
// Vivid's gold: the brand gold at the rim, warming to near-white facing you.
// Toward the edge the dots sink into the night instead of crowding.
const RIM = [234, 179, 8];
const FRONT = [254, 243, 199];
const SHADES = 24;
const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(Math.max((v - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};
const COLOURS = Array.from({ length: SHADES }, (_, i) => {
  const z = i / (SHADES - 1);
  const keep = smooth(0.1, 0.5, z);
  const c = RIM.map((v, k) => Math.round(BG[k] + (v + (FRONT[k] - v) * z * z - BG[k]) * keep));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
});
// Faint stars, in fixed places
const STARS = Array.from({ length: 160 }, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin(i * 91.7 + n * 271.3) * 43758.5453;
    return x - Math.floor(x);
  };
  return { x: r(1), y: r(2) * 0.7, size: 0.6 + r(3), alpha: 0.05 + r(4) * 0.18, phase: r(5) * Math.PI * 2 };
});
// An arc goes out over this long, holds, and fades; each sets off a beat after the last (ms)
const ARC_CYCLE = 5200;
const ARC_STAGGER = 620;
// Let go of the world and it coasts, then turns back round to you after this long (ms)
const HOME_AFTER = 1600;

const clamp = (v: number) => Math.min(Math.max(v, 0), 1);
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const vec = ([lat, lon]: readonly [number, number]) => {
  const p = lat * D2R;
  const l = lon * D2R;
  return [Math.cos(p) * Math.sin(l), Math.sin(p), Math.cos(p) * Math.cos(l)] as const;
};

/** Land points of a Fibonacci sphere of `count` points, as x, y, z triples. */
function landFrom(mask: Uint8ClampedArray, mw: number, mh: number, count: number) {
  const out = new Float32Array(Math.ceil(count * 0.4) * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  let n = 0;
  for (let i = 0; i < count && n < out.length; i++) {
    const y = 1 - (2 * (i + 0.5)) / count;
    const r = Math.sqrt(1 - y * y);
    const x = Math.sin(golden * i) * r;
    const z = Math.cos(golden * i) * r;
    const u = Math.min(mw - 1, Math.floor(((Math.atan2(x, z) / Math.PI + 1) / 2) * mw));
    const v = Math.min(mh - 1, Math.floor((0.5 - Math.asin(y) / Math.PI) * mh));
    if (mask[(v * mw + u) * 4] >= 128) continue;
    out[n++] = x;
    out[n++] = y;
    out[n++] = z;
  }
  return out.subarray(0, n);
}

/**
 * The end of the page, back where it began: the world, in Vivid's gold dots,
 * rising over the foot of the screen like a planet's horizon, turned to where
 * you are. A beacon marks you, and gold arcs run out from you to cities round
 * the world. Over it, the one thing left to do: join. Drag across the
 * world (a finger or the mouse) and it turns under you; let go and it
 * coasts, then comes back round to you.
 */
export function JoinCta() {
  const sectionRef = useRef<HTMLElement>(null);
  usePauseOffscreen(sectionRef);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beaconRef = useRef<HTMLSpanElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: headingIn } = useScroll({ target: headingRef, offset: ["start 90%", "end 55%"] });
  // The world rises as the section comes up into view
  const { scrollYProgress: rising } = useScroll({ target: sectionRef, offset: ["start end", "start start"] });
  // The world's place on the screen, as last drawn, and how far it's been turned by hand
  const planet = useRef({ cx: 0, cy: 0, R: 0 });
  const drag = useRef({ spin: 0, speed: 0, x: 0, at: 0, held: false, released: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Roughly where you are, from your time zone (nothing asked, nothing sent)
    const place = visitorPlace() ?? HOME;
    const [homeLat, homeLon] = place;
    const home = vec(place);
    // Until the map is in, the WorldMeet globe's coarser land stands in
    let land = new Float32Array(LAND_DOTS.length * 1.5);
    for (let i = 0; i < LAND_DOTS.length / 2; i++) {
      land.set(vec([LAND_DOTS[i * 2 + 1], LAND_DOTS[i * 2]]), i * 3);
    }
    let mask: { data: Uint8ClampedArray; w: number; h: number } | null = null;
    let landFor = 0;
    // Each arc's way round the world, lifted off it in the middle
    const arcs = CITIES.map(vec)
      .map((to) => ({ to, angle: Math.acos(Math.min(1, home[0] * to[0] + home[1] * to[1] + home[2] * to[2])) }))
      .filter((arc) => arc.angle > 0.06)
      .map((arc, i) => {
        const steps = 48;
        const s = Math.sin(arc.angle);
        const path: number[][] = [];
        for (let k = 0; k <= steps; k++) {
          const t = k / steps;
          const a = Math.sin((1 - t) * arc.angle) / s;
          const b = Math.sin(t * arc.angle) / s;
          const lift = 1 + Math.sin(Math.PI * t) * (0.03 + arc.angle * 0.08);
          path.push([0, 1, 2].map((c) => (home[c] * a + arc.to[c] * b) * lift));
        }
        return { path, delay: i * ARC_STAGGER };
      });

    let w = 0;
    let h = 0;
    let wide = true;
    let R = 0;
    // The land again, dense enough for this size of planet
    const sample = () => {
      if (!mask || Math.abs(R - landFor) < landFor * 0.1) return;
      const pitch = wide ? PITCH.wide : PITCH.narrow;
      const count = Math.round(Math.min(Math.max((4 * Math.PI * R * R) / (pitch * pitch), 20000), 160000));
      land = landFrom(mask.data, mask.w, mask.h, count);
      landFor = R;
    };
    const paths: Path2D[] = [];
    let raf = 0;
    let then = 0;
    const draw = (t: number) => {
      const dt = then ? Math.min((t - then) / 1000, 0.05) : 0;
      then = t;
      // Turned by hand: it coasts to a stop, then the shorter way back to you
      const d = drag.current;
      if (!d.held) {
        d.spin += d.speed * dt;
        d.speed *= Math.exp(-dt * 2.5);
        if (performance.now() - d.released > HOME_AFTER) {
          d.spin = Math.atan2(Math.sin(d.spin), Math.cos(d.spin)) * Math.exp(-dt * 1.8);
          d.speed *= Math.exp(-dt * 6);
        }
      }
      const rise = still ? 1 : easeOut(clamp(rising.get()));
      // Its top a little below the middle of the screen
      const top = h * (wide ? 0.6 : 0.64);
      const cy = top + R + (1 - rise) * h * 0.3;
      const cx = w / 2;
      planet.current = { cx, cy, R };
      // You, a little down its face, turned toward us, so the cities north of
      // you show on the near side too; it sways a touch either side
      const tilt = Math.asin(clamp(1 - (h * (wide ? 0.17 : 0.15)) / R)) - homeLat * D2R;
      // Nothing of it climbs above its own horizon, into the words
      const ceiling = top - 8;
      const sway = still ? 0 : Math.sin(t / 9000) * 4 * D2R;
      const L = homeLon * D2R + sway - d.spin;
      const cosL = Math.cos(L);
      const sinL = Math.sin(L);
      const cosA = Math.cos(tilt);
      const sinA = Math.sin(tilt);
      const turn = (x: number, y: number, z: number) => {
        const x1 = x * cosL - z * sinL;
        const z1 = x * sinL + z * cosL;
        return [x1, y * cosA + z1 * sinA, -y * sinA + z1 * cosA] as const;
      };

      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 1;

      // The sky
      ctx.fillStyle = "#fde68a";
      for (const star of STARS) {
        ctx.globalAlpha = star.alpha * (0.6 + 0.4 * Math.sin(t / 1500 + star.phase));
        ctx.beginPath();
        ctx.arc(star.x * w, star.y * h, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Its air, a glow just off the edge; then its night face, and a fine
      // gold line round it, so the planet has a hard edge
      ctx.globalAlpha = rise;
      const air = ctx.createRadialGradient(cx, cy, R, cx, cy, R * 1.09);
      air.addColorStop(0, "rgba(234,179,8,0.2)");
      air.addColorStop(1, "rgba(234,179,8,0)");
      ctx.fillStyle = air;
      ctx.fillRect(0, 0, w, h);
      const face = ctx.createLinearGradient(0, cy - R, 0, cy - R + h * 0.4);
      face.addColorStop(0, "#1c1710");
      face.addColorStop(1, "#0c0a09");
      ctx.fillStyle = face;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(250,204,21,0.55)";
      ctx.stroke();

      // The land, front half, in gold dots lying flat on the world: each
      // narrows toward the rim as the ground turns away, and darkens. One
      // path per shade, so thousands of dots are a couple of dozen fills.
      const dot = (wide ? PITCH.wide : PITCH.narrow) * 0.27;
      for (let s = 0; s < SHADES; s++) paths[s] = new Path2D();
      for (let i = 0; i < land.length; i += 3) {
        const [x, y, z] = turn(land[i], land[i + 1], land[i + 2]);
        if (z <= 0.1) continue;
        const sy = cy - y * R;
        if (sy > h + dot) continue;
        const sx = cx + x * R;
        if (sx < -dot || sx > w + dot) continue;
        const r = dot * (0.6 + 0.4 * Math.sqrt(z));
        const flat = r * (0.3 + 0.7 * z);
        const toward = Math.atan2(-y, x);
        const path = paths[Math.round(z * (SHADES - 1))];
        path.moveTo(sx + flat * Math.cos(toward), sy + flat * Math.sin(toward));
        path.ellipse(sx, sy, flat, r, toward, 0, Math.PI * 2);
      }
      for (let s = 0; s < SHADES; s++) {
        ctx.fillStyle = COLOURS[s];
        ctx.fill(paths[s]);
      }

      // The arcs out from you: each draws out, holds, and fades, a spark at
      // its head. One that goes over the world's edge ends there.
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (const arc of arcs) {
        const age = still ? ARC_CYCLE * 0.6 : (((t - arc.delay) % ARC_CYCLE) + ARC_CYCLE) % ARC_CYCLE;
        const p = age / ARC_CYCLE;
        const grown = easeOut(clamp(p / 0.4));
        const fade = p < 0.75 ? 1 : 1 - (p - 0.75) / 0.25;
        const last = Math.round(grown * (arc.path.length - 1));
        if (last < 1) continue;
        ctx.strokeStyle = "#facc15";
        ctx.globalAlpha = 0.8 * fade * rise;
        ctx.beginPath();
        let head: readonly [number, number] | null = null;
        let cut = false;
        for (let k = 0; k <= last; k++) {
          const [x, y, z] = turn(arc.path[k][0], arc.path[k][1], arc.path[k][2]);
          const px = cx + x * R;
          const py = cy - y * R;
          if (z <= 0 || py < ceiling || x * x + y * y > 1) {
            cut = true;
            break;
          }
          if (head) ctx.lineTo(px, py);
          else ctx.moveTo(px, py);
          head = [px, py];
        }
        ctx.stroke();
        if (head && grown < 1 && !cut) {
          ctx.fillStyle = "#fffbeb";
          ctx.globalAlpha = rise * fade;
          ctx.beginPath();
          ctx.arc(head[0], head[1], 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // You: a beacon, pulsing
      const [bx, by, bz] = turn(home[0], home[1], home[2]);
      const px = cx + bx * R;
      const py = cy - by * R;
      if (bz > 0) {
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#facc15";
        for (let k = 0; k < 3; k++) {
          const q = still ? 0.4 : (t / 2400 + k / 3) % 1;
          ctx.globalAlpha = (1 - q) * 0.7 * rise;
          ctx.beginPath();
          ctx.arc(px, py, 6 + q * 34, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = rise;
        ctx.fillStyle = "#fffbeb";
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      const beacon = beaconRef.current;
      if (beacon) {
        beacon.style.transform = `translate(${px}px, ${py}px)`;
        beacon.style.opacity = String(bz > 0 ? clamp((rise - 0.6) / 0.4) : 0);
      }

      raf = still ? 0 : requestAnimationFrame(draw);
    };

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      wide = w >= 640;
      // A planet bigger than the screen
      R = wide ? Math.min(w * 0.58, 880) : w * 0.95;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sample();
      if (still) draw(0);
    };
    size();
    const resized = new ResizeObserver(size);
    resized.observe(canvas);

    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      const mw = 1024;
      const mh = 512;
      const read = document.createElement("canvas");
      read.width = mw;
      read.height = mh;
      const g = read.getContext("2d", { willReadFrequently: true });
      if (!g) return;
      g.drawImage(img, 0, 0, mw, mh);
      mask = { data: g.getImageData(0, 0, mw, mh).data, w: mw, h: mh };
      sample();
      if (still) draw(0);
    };
    img.src = MASK_SRC;

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !raf) raf = requestAnimationFrame(draw);
      else if (!entry.isIntersecting) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(canvas);
    return () => {
      then = 0;
      cancelAnimationFrame(raf);
      io.disconnect();
      resized.disconnect();
      img.onload = null;
    };
  }, [rising]);

  // Whether a pointer is over the world itself, not the sky or the words above it
  const overPlanet = (event: PointerEvent<HTMLElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const { cx, cy, R } = planet.current;
    return R > 0 && Math.hypot(event.clientX - box.left - cx, event.clientY - box.top - cy) < R;
  };
  const grab = (event: PointerEvent<HTMLElement>) => {
    if (reduce || (event.target as HTMLElement).closest("a, button") || !overPlanet(event)) return;
    const d = drag.current;
    Object.assign(d, { held: true, speed: 0, x: event.clientX, at: performance.now() });
    event.currentTarget.dataset.held = "";
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const turn = (event: PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d.held) {
      if (event.pointerType === "mouse" && !reduce) event.currentTarget.dataset.over = overPlanet(event) ? "" : undefined;
      return;
    }
    const now = performance.now();
    // A pixel across the middle of its face is a pixel's worth of turn
    const by = (event.clientX - d.x) / planet.current.R;
    d.spin += by;
    d.speed = d.speed * 0.4 + (0.6 * by) / Math.max((now - d.at) / 1000, 0.008);
    Object.assign(d, { x: event.clientX, at: now });
  };
  const letGo = (event: PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d.held) return;
    // Held still before letting go: no coast
    if (performance.now() - d.at > 80) d.speed = 0;
    Object.assign(d, { held: false, released: performance.now() });
    delete event.currentTarget.dataset.held;
  };

  return (
    <section
      ref={sectionRef}
      id="join"
      aria-labelledby="join-heading"
      className={styles.section}
      onPointerDown={grab}
      onPointerMove={turn}
      onPointerUp={letGo}
      onPointerCancel={letGo}
      onPointerLeave={(event) => event.pointerType === "mouse" && delete event.currentTarget.dataset.over}
    >
      <canvas ref={canvasRef} aria-hidden="true" className={styles.canvas} />
      <div aria-hidden="true" className={styles.fade} />
      <span ref={beaconRef} aria-hidden="true" className={styles.beacon}>
        <b>You’re here</b>
      </span>

      <div className={`${styles.content} mx-auto w-full max-w-7xl px-4 md:px-6`}>
        <p className={styles.eyebrow}>
          <span aria-hidden="true" className={styles.pulse} />
          Join WorldStreet
        </p>
        <h2
          ref={headingRef}
          id="join-heading"
          className="text-3xl leading-[1.1] font-normal tracking-[-0.035em] text-balance md:text-4xl lg:text-display-sm"
        >
          {reduce ? "From here to everywhere." : <RevealWords text="From here to everywhere." progress={headingIn} />}
        </h2>
        <p className={styles.line}>
          One account opens all thirteen platforms, a wallet for every currency, and Vivid to show you around.
        </p>
        <div className={styles.actions}>
          <a
            href={ACCOUNT_LINKS.join}
            className={cn(buttonVariants({ variant: "default", size: "lg" }), styles.primary)}
          >
            Create your account
          </a>
          <a
            href={VIVID_URL}
            target="_blank"
            rel="noopener"
            className={cn(buttonVariants({ variant: "glass", size: "lg" }), styles.secondary)}
          >
            <VividGlobe size={20} />
            Ask Vivid first
          </a>
        </div>
      </div>
    </section>
  );
}
