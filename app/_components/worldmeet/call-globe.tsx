"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./call-globe.module.css";

export type Place = { lon: number; lat: number };
/** Someone on the call: where they are, their pin, and whether they're talking */
export type Guest = { id: string; place: Place; pin: ReactNode; talking?: boolean };

type Dots = { lam: Float32Array; cosPhi: Float32Array; sinPhi: Float32Array; count: number };
type Call = { home: Place; guests: readonly Omit<Guest, "pin">[] };

const RAD = Math.PI / 180;
// The planet is radius 1 in a box 2.3 across, leaving room for the arcs to rise
const BOX = 2.3;
const ARC_STEPS = 48;
const DRAW_IN_MS = 900;

function prepare(flat: readonly number[]): Dots {
  const count = flat.length / 2;
  const lam = new Float32Array(count);
  const cosPhi = new Float32Array(count);
  const sinPhi = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    lam[i] = flat[i * 2] * RAD;
    const phi = flat[i * 2 + 1] * RAD;
    cosPhi[i] = Math.cos(phi);
    sinPhi[i] = Math.sin(phi);
  }
  return { lam, cosPhi, sinPhi, count };
}

const toVec = ({ lon, lat }: Place) =>
  [Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD), Math.cos(lat * RAD) * Math.cos(lon * RAD)] as const;
const toPlace = ([x, y, z]: readonly number[]): Place => ({ lon: Math.atan2(x, z) / RAD, lat: Math.asin(y) / RAD });

/** The point a fraction t of the way along the great circle from a to b */
function along(a: readonly number[], b: readonly number[], t: number) {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const omega = Math.acos(dot);
  if (omega < 1e-4) return a;
  const s = Math.sin(omega);
  const wa = Math.sin((1 - t) * omega) / s;
  const wb = Math.sin(t * omega) / s;
  return [a[0] * wa + b[0] * wb, a[1] * wa + b[1] * wb, a[2] * wa + b[2] * wb];
}

/** Where the globe faces to show everyone: the middle of them all, tilted no further than is kind */
function facing(places: readonly Place[]) {
  const sum = [0, 0, 0];
  for (const place of places) {
    const v = toVec(place);
    sum[0] += v[0];
    sum[1] += v[1];
    sum[2] += v[2];
  }
  const length = Math.hypot(sum[0], sum[1], sum[2]) || 1;
  const centre = toPlace(sum.map((v) => v / length));
  return { lon: centre.lon, lat: Math.min(36, Math.max(-8, centre.lat)) };
}

const easeOut = (t: number) => 1 - (1 - t) ** 3;

/**
 * The world in dots (the WorldMeet app's hero globe, worldstreet/worldcall),
 * drawn to one canvas. Everyone on the call is pinned to their city (the
 * pins are yours to fill); each one who joins draws a gold arc across to
 * you, and whoever's talking sends their voice along it, both ways. The
 * globe turns to keep you all in view.
 */
export function CallGlobe({ home, homePin, guests }: { home: Place; homePin: ReactNode; guests: readonly Guest[] }) {
  const square = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const call = useRef<Call>({ home, guests });
  const redraw = useRef<() => void>(() => {});

  // The animation reads the call from here, so a change doesn't restart it
  useEffect(() => {
    call.current = { home, guests: guests.map(({ id, place, talking }) => ({ id, place, talking })) };
    redraw.current();
  }, [home, guests]);

  useEffect(() => {
    const el = square.current;
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!el || !cv || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const joined = new Map<string, number>();
    let dots: Dots | null = null;
    let size = 0;
    let dpr = 1;
    let view = facing([call.current.home, ...call.current.guests.map((g) => g.place)]);
    let t = 0;

    const resize = () => {
      size = el.offsetWidth;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.max(1, Math.round(size * dpr));
      cv.height = Math.max(1, Math.round(size * dpr));
    };

    const draw = () => {
      // Not after it's gone: a detached globe has no colours to read
      if (!size || !el.isConnected) return;
      const { home, guests } = call.current;
      // Ease round to everyone, with a slow sway once there
      const target = facing([home, ...guests.map((g) => g.place)]);
      const sway = reduced ? 0 : Math.sin(t / 7000) * 6;
      const dLon = ((((target.lon + sway - view.lon) % 360) + 540) % 360) - 180;
      view = reduced
        ? target
        : { lon: view.lon + dLon * 0.04, lat: view.lat + (target.lat - view.lat) * 0.04 };
      const lon0 = view.lon * RAD;
      const sinL = Math.sin(view.lat * RAD);
      const cosL = Math.cos(view.lat * RAD);
      const project = ({ lon, lat }: Place, lift = 1) => {
        const phi = lat * RAD;
        const dl = lon * RAD - lon0;
        const cp = Math.cos(phi);
        return {
          x: cp * Math.sin(dl) * lift,
          y: -(cosL * Math.sin(phi) - sinL * cp * Math.cos(dl)) * lift,
          z: sinL * Math.sin(phi) + cosL * cp * Math.cos(dl),
        };
      };

      const cs = getComputedStyle(el);
      const colour = (name: string) => cs.getPropertyValue(name).trim();
      const k = (size * dpr) / BOX;
      const o = (size * dpr) / 2;
      const px = dpr / k; // one CSS pixel, in globe units
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.setTransform(k, 0, 0, k, o, o);

      const halo = ctx.createRadialGradient(0, 0, 0.9, 0, 0, 1.08);
      halo.addColorStop(0, "rgba(0,0,0,0)");
      halo.addColorStop(0.5, colour("--globe-halo"));
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 0, 1.08, 0, Math.PI * 2);
      ctx.fill();

      const body = ctx.createRadialGradient(-0.3, -0.45, 0, -0.3, -0.45, 1.6);
      body.addColorStop(0, colour("--globe-hi"));
      body.addColorStop(1, colour("--globe-lo"));
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(0, 0, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = colour("--globe-rim");
      ctx.lineWidth = px;
      ctx.stroke();

      if (dots) {
        const r = 1.3 * px;
        const near = new Path2D();
        const limb = new Path2D();
        for (let i = 0; i < dots.count; i++) {
          const dl = dots.lam[i] - lon0;
          const cd = Math.cos(dl);
          const z = sinL * dots.sinPhi[i] + cosL * dots.cosPhi[i] * cd;
          if (z <= 0.02) continue;
          const x = dots.cosPhi[i] * Math.sin(dl);
          const y = -(cosL * dots.sinPhi[i] - sinL * dots.cosPhi[i] * cd);
          const path = z > 0.42 ? near : limb;
          path.moveTo(x + r, y);
          path.arc(x, y, r, 0, Math.PI * 2);
        }
        ctx.fillStyle = colour("--globe-dot-limb");
        ctx.fill(limb);
        ctx.fillStyle = colour("--globe-dot");
        ctx.fill(near);
      }

      // Each guest's line to you, rising off the surface as it goes, drawn
      // in from their end when they join
      const b = toVec(home);
      const arcColour = colour("--globe-arc");
      const voiceColour = colour("--globe-voice");
      ctx.lineCap = "round";
      for (const guest of guests) {
        if (!joined.has(guest.id)) joined.set(guest.id, t);
        const shown = reduced ? 1 : easeOut(Math.min(1, (t - (joined.get(guest.id) ?? t)) / DRAW_IN_MS));
        const a = toVec(guest.place);
        const reach = Math.acos(Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
        const rise = 0.06 + 0.24 * (reach / Math.PI);
        const point = (s: number) => project(toPlace(along(a, b, s)), 1 + rise * Math.sin(Math.PI * s));
        const steps = Math.max(1, Math.round(ARC_STEPS * shown));
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const p = point((i / steps) * shown);
          if (i) ctx.lineTo(p.x, p.y);
          else ctx.moveTo(p.x, p.y);
        }
        ctx.strokeStyle = arcColour;
        ctx.globalAlpha = guest.talking ? 1 : 0.55;
        ctx.lineWidth = (guest.talking ? 2.5 : 1.5) * px;
        ctx.shadowColor = arcColour;
        ctx.shadowBlur = guest.talking ? 12 * dpr : 0;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        if (guest.talking && shown === 1) {
          // Their voice, both ways
          ctx.fillStyle = voiceColour;
          for (let i = 0; i < 6; i++) {
            const phase = (((t / 2200 + i / 3) % 1) + 1) % 1;
            const p = point(i % 2 ? 1 - phase : phase);
            ctx.globalAlpha = Math.sin(Math.PI * phase);
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3.5 * px, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        }
      }
      for (const id of joined.keys()) {
        if (!guests.some((g) => g.id === id)) joined.delete(id);
      }

      // Each pin on its city; it fades round the back
      for (const pin of el.querySelectorAll<HTMLElement>("[data-pin]")) {
        const where = pin.dataset.pin === "home" ? home : guests.find((g) => g.id === pin.dataset.pin)?.place;
        if (!where) continue;
        const p = project(where);
        pin.style.left = `${((p.x * k) / dpr / size) * 100 + 50}%`;
        pin.style.top = `${((p.y * k) / dpr / size) * 100 + 50}%`;
        pin.style.opacity = String(Math.min(1, Math.max(0, (p.z + 0.05) * 5)));
      }
    };
    redraw.current = () => {
      if (reduced) draw();
    };

    resize();
    draw();
    import("./globe-dots").then(({ LAND_DOTS }) => {
      dots = prepare(LAND_DOTS);
      draw();
    });
    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(el);
    if (reduced) return () => ro.disconnect();

    // About 30 frames a second, only while it's on screen
    let raf = 0;
    let last = 0;
    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(el);
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden || now - last < 32) return;
      last = now;
      t = now;
      draw();
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return (
    <div className={styles.globe} aria-hidden="true">
      <div ref={square} className={styles.square}>
        <canvas ref={canvas} />
        <span data-pin="home" className={styles.pin}>
          {homePin}
        </span>
        {guests.map((guest) => (
          <span key={guest.id} data-pin={guest.id} className={styles.pin}>
            {guest.pin}
          </span>
        ))}
      </div>
    </div>
  );
}
