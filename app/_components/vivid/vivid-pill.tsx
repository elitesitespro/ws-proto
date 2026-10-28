"use client";

/**
 * Vivid, docked at the foot of the screen all the way down the page: the
 * hub's ask bar (worldstreet-hub components/dashboard/VividPill.tsx, which
 * the hub's own landing mounts too), in this page's dark and gold.
 *
 * Its body is one SVG shape that a spring draws: width, height, corner
 * radius, and a bulge on the top edge from the spring's speed, so it
 * stretches like something soft and stays sharp at every size. Awake it's a
 * pill: Vivid's globe turning on the left, a field whose placeholder rolls
 * through questions for the part of the page in the middle of the screen
 * ("Ask Vivid · <label>", vivid-pill-questions.ts), a mic and a send button.
 * Scroll down and it squashes into a small thumb with Vivid's dots in it;
 * tap that, or scroll back up, and it springs open again. Tapping the globe
 * puts it to sleep on purpose.
 *
 * Everyone here is signed out, so nothing is sent anywhere: send, Enter and
 * the mic spring the same shape open into a small card, "Sign in to use
 * Vivid", that folds back down on Escape, a click outside or its chevron.
 * What was typed stays in the field, and its Sign in takes it to the hub's
 * Vivid (/vivid?q=), which puts it in Vivid's box.
 *
 * Its birth: once the hero's in (its loader opened, its parts risen), a
 * circle with Vivid's globe in it comes up from the foot of the screen and
 * springs open into the pill, the globe sliding to its place on the left.
 * From there each part of the page sets how it rides (useStance in
 * vivid-pill-hooks.ts): the pill where the foot of the screen is free,
 * opening by itself the first time you stop in each such part; just the
 * thumb where a part has things at its foot (the street); and sunk out of
 * sight where a part needs the foot or has a Vivid of its own (a phone's
 * dial, the wallet's dashboard), back up as you leave it. The page's Ask
 * Vivid buttons (data-vivid-summon) open it and put you in its field.
 *
 * Through Vivid's intro the intro has it (vivid-handoff.ts): it flies the
 * dashboard's globe down onto data-vivid-pill-anchor, an empty fixed marker
 * at the centre of the circle the pill is born as, and sets pillDock from 0
 * to 1 as it comes. Until it's 1 the pill is hidden and can't be reached. At
 * 1 it appears as that circle, the globe in its middle, and springs open
 * into the pill, as at its birth; it stays open for a little more scrolling
 * down before it tucks into the thumb. Scroll back up the intro and it's
 * hidden again at once, folded back to the circle, for the intro to take
 * Vivid back.
 *
 * Only one spring runs, and only while the shape is moving; scrolling flips
 * state only when the direction does, and the section under the middle of
 * the screen comes from an IntersectionObserver, not from measuring as the
 * page scrolls. Reduced motion: no spring and no sinking, it swaps, and it
 * simply appears and disappears.
 */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FormEvent,
  type MouseEvent,
} from "react";
import { createPortal, flushSync } from "react-dom";
import { Icon } from "@/components/icon";
import { ACCOUNT_LINKS } from "@/components/layout/nav-links";
import { buttonVariants } from "@/components/ui/button";
import { useMediaQuery } from "@/lib/use-media-query";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { pillDock } from "./vivid-handoff";
import { VividGlobe } from "./vivid-globe";
import { askVivid } from "./vivid-links";
import {
  useDialPlatform,
  useHeroEntered,
  useRollingQuestion,
  useSectionInView,
  useStance,
  type Stance,
} from "./vivid-pill-hooks";
import { askFor } from "./vivid-pill-questions";
import {
  CARD_MAX,
  CARD_MIN,
  CIRCLE,
  DAMPING,
  HEADROOM,
  KEYS,
  PHONE_W,
  PILL_H,
  SPHERE,
  STIFFNESS,
  THUMB,
  THUMB_H,
  THUMB_W,
  WIDE_W,
  ZERO,
  cardGeo,
  clamp01,
  pillGeo,
  shape,
} from "./vivid-pill-shape";
import styles from "./vivid-pill.module.css";

/** pillDock at 1 (or a hair under): the intro's globe has landed, and the pill is Vivid. */
const DOCKED = 0.999;
/** Just come into view, it stays open for this much more scrolling down before it tucks into the thumb (px). */
const GRACE = 160;
/** Born, its circle is up this long before it springs open (ms). */
const RISE_DELAY = 220;
/** Stopped this long in a part of the page it hasn't opened in yet, it opens (ms). */
const IDLE_MS = 700;
/** The narrowest the shape gets mid-spring: a little under the circle it's born as. */
const MIN_W = Math.min(THUMB_W, PILL_H) * 0.9;
/** The longest question carried into Vivid after signing in. */
const MAX_ASK = 400;

const isDocked = () => pillDock.get() >= DOCKED;
const watchDock = (onChange: () => void) => pillDock.on("change", onChange);
const noSubscribe = () => () => {};

/** The pill's width for this window, and the tallest its card may grow. */
type Frame = { w: number; cardMax: number };
function measure(): Frame {
  const wide = window.matchMedia("(min-width: 48rem)").matches;
  // Without a scrollbar, as the fixed box is laid out
  const vw = document.documentElement.clientWidth;
  const w = Math.round(wide ? Math.min(WIDE_W, vw - 48) : Math.min(PHONE_W, vw - 24));
  const cardMax = Math.max(CARD_MIN, Math.min(CARD_MAX, window.innerHeight - (wide ? 20 : 12) - 96));
  return { w, cardMax };
}

/**
 * Sign in, or open an account, in the hub. With a question typed, Sign in
 * goes straight to Vivid with it waiting in the box: the hub's /vivid?q=
 * fills it in and never sends it. (A device new to the hub is taken through
 * onboarding first, and comes out at Home.) A new account starts at
 * onboarding either way.
 */
function accountLinks(q: string) {
  return { signIn: q ? askVivid(q) : ACCOUNT_LINKS.signIn, join: ACCOUNT_LINKS.join };
}

/** A key press (a click with no pointer behind it) or a mouse: worth moving focus into the field. A tap isn't: on
 *  a phone it would throw the keyboard up unasked. */
const focusWorthy = (event?: MouseEvent) =>
  !event || event.detail === 0 || window.matchMedia("(pointer: fine)").matches;

export function VividPill() {
  // Client only: it lives in <body>, outside the page, and sizes itself from the window
  const mounted = useSyncExternalStore(noSubscribe, () => true, () => false);
  return mounted ? createPortal(<Pill />, document.body) : null;
}

function Pill() {
  const reduce = useReducedMotion();
  const wide = useMediaQuery("(min-width: 48rem)");
  // The intro's globe has landed: a state flip only when the hand-off crosses 1, not on every frame of it
  const docked = useSyncExternalStore(watchDock, isDocked, () => false);
  const born = useHeroEntered(reduce);
  const section = useSectionInView();
  const stance = useStance(section);
  // Vivid's intro has it, from the start of the intro until its globe lands here
  const handoff = section === "vivid" && !docked;
  /** On screen: born, not the intro's, and not out of the way of the part of the page under it. */
  const present = born && !handoff && stance !== "aside";
  const dial = useDialPlatform();
  const ask = askFor(section, dial);
  const [text, setText] = useState("");
  const [asleep, setAsleep] = useState(false);
  /** The "Sign in to use Vivid" card is open. */
  const [open, setOpen] = useState(false);
  /** The card's two ways in, worked out as it opens (they carry what was typed). */
  const [gate, setGate] = useState(() => ({ q: "", ...accountLinks("") }));
  const [gateH, setGateH] = useState(CARD_MIN);
  const [frame, setFrame] = useState(measure);

  // As the page moves into a part, not after: one with things at its foot tucks it into the thumb (unless it's in
  // use), one that needs it out of the way folds its card, and the intro taking Vivid lets go of everything, so
  // it's born afresh when the globe lands
  const [was, setWas] = useState({ stance, handoff });
  if (stance !== was.stance || handoff !== was.handoff) {
    setWas({ stance, handoff });
    if (handoff || stance === "aside") setOpen(false);
    if (handoff && !was.handoff) setAsleep(false);
    else if (stance === "tuck" && was.stance !== "tuck" && !open && !text) setAsleep(true);
  }
  const awake = present && !asleep && !open;
  const thumbed = present && asleep && !open;
  const roll = useRollingQuestion(ask, awake);
  const titleId = useId();

  /** Put to sleep by hand (the globe): scrolling back up, or stopping, doesn't wake it. */
  const manual = useRef(false);
  /** The parts of the page it has been open in (by section id): stopping in one of those doesn't open it again. */
  const seen = useRef(new Set<string>());
  const now = useRef<{ asleep: boolean; open: boolean; present: boolean; section: string; stance: Stance }>({
    asleep,
    open,
    present,
    section,
    stance,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const gateRef = useRef<HTMLDivElement>(null);
  const gateFirstRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    now.current = { asleep, open, present, section, stance };
    if (awake) seen.current.add(section);
  });

  // The footer leaves room under its last row while the pill is on the page (site-footer.tsx)
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.vividPill = "";
    return () => {
      delete root.dataset.vividPill;
    };
  }, []);

  // A phone's toolbar sliding away resizes the window too: only a real change of size re-places it
  useEffect(() => {
    const onResize = () =>
      setFrame((prev) => {
        const next = measure();
        return next.w === prev.w && next.cardMax === prev.cardMax ? prev : next;
      });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Gone out of sight (sunk, or the intro's taken it), nothing in it keeps focus; given to the intro, it's no
  // longer asleep by hand either
  useEffect(() => {
    if (present) return;
    if (handoff) manual.current = false;
    const focused = document.activeElement;
    if (focused instanceof HTMLElement && boxRef.current?.contains(focused)) focused.blur();
  }, [present, handoff]);

  // Scroll down: sleep into the thumb. Scroll up: wake, where the part of the page leaves the foot of the screen
  // free (and unless it was put to sleep by hand); and stopped in such a part it hasn't been open in, it opens by
  // itself. Not while the card is open, or while there's something in the field.
  useEffect(() => {
    if (!present) return;
    let last = window.scrollY;
    // Just come into view, and the visitor is still scrolling down: it stays open a moment before it tucks away
    const grace = last + GRACE;
    const busy = () => {
      const input = inputRef.current;
      return now.current.open || (!!input && (document.activeElement === input || !!input.value));
    };
    const stopped = () => {
      const { section, stance } = now.current;
      if (stance !== "open" || seen.current.has(section) || busy()) return;
      seen.current.add(section);
      if (now.current.asleep && !manual.current) setAsleep(false);
    };
    // Coming into view counts as the page moving: if it stays put from here, that's a stop
    let idle = window.setTimeout(stopped, IDLE_MS);
    const onScroll = () => {
      window.clearTimeout(idle);
      idle = window.setTimeout(stopped, IDLE_MS);
      const y = window.scrollY;
      const d = y - last;
      if (Math.abs(d) < 6) return;
      last = y;
      if (busy()) return;
      if (d > 0) {
        if (y >= grace && !now.current.asleep) setAsleep(true);
      } else if (now.current.asleep && !manual.current && now.current.stance === "open") setAsleep(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(idle);
    };
  }, [present]);

  // The page's Ask Vivid buttons (data-vivid-summon) open it and put you in its field. Where it's out of sight they
  // stay links, to the hub's Vivid.
  useEffect(() => {
    const onClick = (event: globalThis.MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const summon = event.target instanceof Element && event.target.closest("[data-vivid-summon]");
      if (!summon || !now.current.present) return;
      event.preventDefault();
      manual.current = false;
      // At once, so the field can take focus within the tap: a phone only puts its keyboard up then
      flushSync(() => {
        setOpen(false);
        setAsleep(false);
      });
      inputRef.current?.focus({ preventScroll: true });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // The card is as tall as its words (they wrap more on a phone)
  useEffect(() => {
    const inner = gateRef.current;
    if (!inner) return;
    const observer = new ResizeObserver(() =>
      setGateH(Math.min(frame.cardMax, Math.max(CARD_MIN, Math.ceil(inner.offsetHeight / 2) * 2))),
    );
    observer.observe(inner);
    return () => observer.disconnect();
  }, [frame.cardMax]);

  /* The spring that draws the shape */
  const sim = useRef({ x: { ...CIRCLE }, vel: { ...ZERO }, target: { ...CIRCLE }, raf: 0, wait: 0, running: false });
  const lay = useRef({ W: frame.w, H: HEADROOM + frame.cardMax });
  const placed = useRef<Frame | null>(null);
  const draw = useCallback(() => {
    const path = pathRef.current;
    const box = boxRef.current;
    if (!path || !box) return;
    const { x, vel } = sim.current;
    const { W, H } = lay.current;
    const w = Math.max(MIN_W, x.w);
    const h = Math.max(THUMB_H * 0.8, x.h);
    const r = Math.max(0, Math.min(x.r, h / 2, w / 2));
    // Rising fast, the top edge leads; dropping into the thumb, it lags
    const bulge = Math.max(-8, Math.min(HEADROOM - 2, vel.h * 0.006 - vel.t * 0.9));
    path.setAttribute("d", shape(W / 2, H, w, h, r, bulge));
    box.style.setProperty("--p", String(clamp01(x.t)));
    box.style.setProperty("--c", String(clamp01(x.c)));
    // Not clamped below 0: as the circle springs open past the pill's width, the globe rides the edge out with it
    box.style.setProperty("--b", String(Math.min(1, x.b)));
    box.style.setProperty("--w", `${w}px`);
    box.style.setProperty("--h", `${h}px`);
    box.style.setProperty("--r", `${r}px`);
    // Being born, the pill's insides show only inside the shape
    const form = formRef.current;
    const clip = x.b > 0.002 ? `inset(0 ${Math.max(0, (W - w) / 2)}px round ${r}px)` : "";
    if (form && form.style.clipPath !== clip) form.style.clipPath = clip;
  }, []);

  /** Why it was out of sight, until it's back: not born yet, sunk out of the way, or the intro's. */
  const gone = useRef<"unborn" | "aside" | "away" | null>("unborn");
  useEffect(() => {
    const s = sim.current;
    lay.current = { W: frame.w, H: HEADROOM + frame.cardMax };
    // Just back in view, from where
    const back = present ? gone.current : null;
    gone.current = present ? null : handoff ? "away" : !born ? "unborn" : "aside";
    const target = handoff || !born ? CIRCLE : open ? cardGeo(frame.w, gateH) : asleep ? THUMB : pillGeo(frame.w);
    s.target = target;
    const resized = placed.current !== frame;
    placed.current = frame;
    // Unborn, the intro's, on its first layout, on a resize and under reduced motion it's placed; and coming back up
    // from out of the way, in the shape it's to be (it's below the edge, out of sight, till then). Only a change of
    // state springs it: being born, the circle opening (from the intro's globe, or after it's risen into view at
    // the hero), or the visitor and the page at work.
    if (handoff || !born || resized || reduce || back === "aside") {
      cancelAnimationFrame(s.raf);
      window.clearTimeout(s.wait);
      s.running = false;
      s.x = { ...target };
      s.vel = { ...ZERO };
      draw();
      return;
    }
    if (s.running) return;
    s.running = true;
    let prev = performance.now();
    const tick = (time: number) => {
      const dt = Math.min(0.032, (time - prev) / 1000);
      prev = time;
      let moving = false;
      for (const key of KEYS) {
        const a = -STIFFNESS * (s.x[key] - s.target[key]) - DAMPING * s.vel[key];
        s.vel[key] += a * dt;
        s.x[key] += s.vel[key] * dt;
        const px = key === "w" || key === "h" || key === "r";
        if (Math.abs(s.x[key] - s.target[key]) > (px ? 0.25 : 0.001) || Math.abs(s.vel[key]) > (px ? 1 : 0.01)) {
          moving = true;
        }
      }
      draw();
      if (moving) s.raf = requestAnimationFrame(tick);
      else {
        s.x = { ...s.target };
        s.vel = { ...ZERO };
        s.running = false;
        draw();
      }
    };
    const start = () => {
      prev = performance.now();
      s.raf = requestAnimationFrame(tick);
    };
    if (back === "unborn") s.wait = window.setTimeout(start, RISE_DELAY);
    else start();
  }, [present, handoff, born, open, asleep, gateH, frame, reduce, draw]);
  useEffect(() => {
    const s = sim.current;
    return () => {
      cancelAnimationFrame(s.raf);
      window.clearTimeout(s.wait);
    };
  }, []);

  const wake = (event: MouseEvent) => {
    manual.current = false;
    setAsleep(false);
    if (focusWorthy(event)) window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 250);
  };
  const sleep = () => {
    manual.current = true;
    setAsleep(true);
  };

  /** Signed out, always: the shape springs open into "Sign in to use Vivid". The field keeps what was typed. */
  const openGate = () => {
    const q = text.trim().slice(0, MAX_ASK);
    setGate({ q, ...accountLinks(q) });
    setOpen(true);
    window.setTimeout(() => gateFirstRef.current?.focus({ preventScroll: true }), reduce ? 0 : 280);
  };
  const send = (event: FormEvent) => {
    event.preventDefault();
    openGate();
  };

  const close = useCallback((refocus: boolean) => {
    manual.current = false;
    setAsleep(false);
    setOpen(false);
    if (refocus) window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 280);
  }, []);

  // Escape folds the card back into the pill, focus and all; a click outside folds it and leaves focus be
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      close(true);
    };
    const onDown = (event: PointerEvent) => {
      if (!cardRef.current?.contains(event.target as Node)) close(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown, true);
    };
  }, [open, close]);

  // Development only: the hand-off by hand, from the console, with Vivid's intro on screen. window.vividPill.dock()
  // lands the globe (the pill takes it), window.vividPill.dock(0) gives it back to the intro. The intro sets it
  // again as the page scrolls.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const w = window as Window & { vividPill?: { dock: (value?: number) => void } };
    w.vividPill = { dock: (value = 1) => pillDock.set(value) };
    return () => {
      delete w.vividPill;
    };
  }, []);

  const W = frame.w;
  const H = HEADROOM + frame.cardMax;
  // How far the globe slides from the middle of the circle to its place on the left
  const slide = W / 2 - PILL_H / 2;

  return (
    <>
      <div data-vivid-pill-anchor="" aria-hidden="true" className={styles.anchor} />
      <div
        ref={boxRef}
        className={styles.box}
        data-away={handoff ? "" : undefined}
        data-aside={present || handoff ? undefined : ""}
        aria-hidden={!present || undefined}
        inert={!present}
        // Constant starting values: the spring sets them from here, and React never has a reason to write them back
        style={
          {
            width: W,
            height: H,
            marginLeft: -W / 2,
            "--p": 0,
            "--c": 0,
            "--b": 1,
            "--w": `${PILL_H}px`,
            "--h": `${PILL_H}px`,
            "--r": `${PILL_H / 2}px`,
          } as CSSProperties
        }
      >
        {/* The body: one shape, drawn by the spring */}
        <svg aria-hidden="true" className={styles.body} width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <path ref={pathRef} />
        </svg>

        {/* Awake: globe · prompt · mic · send. Fades and shrinks away as the shape sleeps or opens. */}
        <form
          ref={formRef}
          onSubmit={send}
          aria-hidden={!awake || undefined}
          inert={!awake}
          className={styles.form}
          style={{
            opacity: "calc(1 - var(--p) * 2.2 - var(--c) * 3)",
            transform: "scale(calc(1 - var(--p) * 0.25))",
            pointerEvents: awake ? "auto" : "none",
          }}
        >
          <button
            type="button"
            onClick={sleep}
            aria-label="Hide Vivid"
            title="Hide Vivid"
            className={styles.sphere}
            style={{ transform: `translateX(calc(var(--b) * ${slide}px))` }}
          >
            <VividGlobe size={SPHERE} still={!awake} />
          </button>
          <div className={styles.field} style={{ opacity: "calc(1 - var(--b) * 2)" }}>
            <span className={styles.label}>
              Ask Vivid ·{" "}
              <span key={ask.key} className={styles.swap}>
                {ask.label}
              </span>
            </span>
            <div className={styles.line}>
              {!text && (
                <span aria-hidden="true" className={styles.roll}>
                  <span key={roll.key} className={styles.swap}>
                    {roll.q}
                  </span>
                </span>
              )}
              <input
                ref={inputRef}
                value={text}
                onChange={(event) => setText(event.target.value)}
                aria-label={`Ask Vivid. For example: ${ask.qs[0]}`}
                enterKeyHint="send"
                autoComplete="off"
                className={styles.input}
              />
            </div>
          </div>
          <div className={styles.actions} style={{ opacity: "calc(1 - var(--b) * 2)" }}>
            {/* A soundwave on a phone, where Vivid talks back in real time, as the hub's; a mic from 768px */}
            <button type="button" onClick={openGate} aria-label="Talk to Vivid" title="Talk to Vivid" className={styles.icon}>
              <Icon name={wide ? "mic" : "audio-lines"} size={22} tone="current" />
            </button>
            <button type="submit" aria-label="Send to Vivid" title="Send to Vivid" className={styles.send}>
              <Icon name="arrow-up" size={20} tone="current" />
            </button>
          </div>
        </form>

        {/* Asleep: the thumb, Vivid's dots, tap to open */}
        <button
          type="button"
          onClick={wake}
          aria-label="Open Vivid"
          title="Open Vivid"
          inert={!thumbed}
          className={styles.thumb}
          style={{ opacity: "calc((var(--p) - 0.55) * 2.4)", pointerEvents: thumbed ? "auto" : "none" }}
        >
          <VividGlobe size={24} still={!thumbed} />
        </button>

        {/* Open: "Sign in to use Vivid", laid out at its full size and uncovered by the growing shape */}
        <div
          ref={cardRef}
          role={open ? "dialog" : undefined}
          aria-labelledby={open ? titleId : undefined}
          aria-hidden={!open || undefined}
          inert={!open}
          className={styles.sheet}
          style={{ pointerEvents: open ? "auto" : "none" }}
        >
          <div ref={gateRef} className={styles.gate} style={{ width: W, opacity: "calc((var(--c) - 0.4) * 1.8)" }}>
            <div className={styles.gateHead}>
              <VividGlobe size={30} still={!open} />
              <div className={styles.who}>
                <p className={styles.name}>Vivid</p>
                <p className={styles.tagline}>Your AI on WorldStreet</p>
              </div>
              <button
                type="button"
                onClick={(event) => close(focusWorthy(event))}
                aria-label="Close"
                title="Close"
                className={styles.icon}
              >
                <Icon name="chevron-down" size={24} tone="current" />
              </button>
            </div>
            <div className={styles.gateBody}>
              <h2 id={titleId} className={styles.title}>
                Sign in to use Vivid
              </h2>
              <p className={styles.text}>Vivid answers your questions once you’re signed in. It’s free to start.</p>
              {gate.q && <p className={styles.waiting}>Your question will be waiting: “{gate.q}”</p>}
            </div>
            <div className={styles.gateActions}>
              <a ref={gateFirstRef} href={gate.signIn} className={buttonVariants()}>
                Sign in
              </a>
              <a href={gate.join} className={buttonVariants({ variant: "outline" })}>
                Create an account
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
