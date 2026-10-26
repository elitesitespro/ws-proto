"use client";

import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import Image from "next/image";
import { Icon } from "@/components/icon";
import styles from "./worldwork-finder.module.css";

type Trade = "welder" | "plumber" | "electrician" | "mechanic" | "tailor" | "barber";
type Provider = { id: string; name: string; km: number; rating: number };
type Call = { id: string; connected: boolean };

// A few of Worldwork's trades (its own category photos), each with sample
// providers nearby, closest first, and the words people ask for them in
const TRADES: Record<Trade, { label: string; plural: string; words: RegExp; providers: readonly Provider[] }> = {
  welder: {
    label: "Welder",
    plural: "Welders",
    words: /weld|gate|hinge|metal|iron|burglar/i,
    providers: [
      { id: "tw", name: "Tunde Welding Works", km: 0.6, rating: 4.8 },
      { id: "im", name: "Ifeanyi Metal & Gates", km: 1.4, rating: 4.6 },
      { id: "ki", name: "Kola Iron Doors", km: 1.9, rating: 4.7 },
    ],
  },
  plumber: {
    label: "Plumber",
    plural: "Plumbers",
    words: /plumb|leak|pipe|tap|toilet|drain|water/i,
    providers: [
      { id: "ep", name: "Emeka Pipes & Fittings", km: 0.4, rating: 4.9 },
      { id: "bp", name: "Bayo Plumbing", km: 1.1, rating: 4.7 },
      { id: "cw", name: "Chuka Water Works", km: 1.8, rating: 4.5 },
    ],
  },
  electrician: {
    label: "Electrician",
    plural: "Electricians",
    words: /electric|light|power|socket|wiring|fuse|bulb/i,
    providers: [
      { id: "se", name: "Sade Electric", km: 0.8, rating: 4.8 },
      { id: "mw", name: "Musa Wiring Co.", km: 1.3, rating: 4.6 },
      { id: "be", name: "Brightway Electrical", km: 1.7, rating: 4.7 },
    ],
  },
  mechanic: {
    label: "Mechanic",
    plural: "Mechanics",
    words: /mechanic|car|engine|brake|tyre|tire|vehicle|road/i,
    providers: [
      { id: "aa", name: "Ade Auto Clinic", km: 0.5, rating: 4.7 },
      { id: "om", name: "Okon Motors", km: 1.2, rating: 4.8 },
      { id: "lc", name: "Lekki Car Care", km: 1.9, rating: 4.4 },
    ],
  },
  tailor: {
    label: "Tailor",
    plural: "Tailors",
    words: /tailor|dress|suit|sew|stitch|hem|agbada|fit/i,
    providers: [
      { id: "as", name: "Amaka Stitches", km: 0.3, rating: 4.9 },
      { id: "ff", name: "Folake Fashion House", km: 0.9, rating: 4.8 },
      { id: "kb", name: "Kunle Bespoke", km: 1.6, rating: 4.6 },
    ],
  },
  barber: {
    label: "Barber",
    plural: "Barbers",
    words: /barb|hair|cut|fade|beard|trim|shave/i,
    providers: [
      { id: "fd", name: "Fresh Cuts by Dayo", km: 0.2, rating: 4.9 },
      { id: "kg", name: "Kings Barbers", km: 0.7, rating: 4.7 },
      { id: "sl", name: "Sharp Line Studio", km: 1.5, rating: 4.6 },
    ],
  },
};
const ORDER = Object.keys(TRADES) as Trade[];
const RANGE_KM = 2;
const RING_MS = 2200;

const initials = (name: string) =>
  name
    .split(" ")
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/**
 * Worldwork's directory, in its black and white: pick a trade (or ask in
 * your own words, as Vivid lets you), see who does it nearby, closest
 * first on a ruler out from you, then call them yourself. The work and the
 * payment are between you and them.
 */
export function WorldworkFinder() {
  const [trade, setTrade] = useState<Trade>("welder");
  const [picked, setPicked] = useState(TRADES.welder.providers[0].id);
  const [ask, setAsk] = useState("");
  const [heard, setHeard] = useState<string | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [saved, setSaved] = useState<readonly string[]>([]);

  const { providers, plural } = TRADES[trade];
  const calling = call ? providers.find((p) => p.id === call.id) : undefined;

  // The phone rings, then they pick up; the call's clock runs
  useEffect(() => {
    if (!call) return;
    if (!call.connected) {
      const answer = setTimeout(() => setCall({ ...call, connected: true }), RING_MS);
      return () => clearTimeout(answer);
    }
    const tick = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(tick);
  }, [call]);

  const choose = (next: Trade) => {
    setTrade(next);
    setPicked(TRADES[next].providers[0].id);
    setCall(null);
  };

  // Asking in your own words finds the trade that does it
  const search = (event: FormEvent) => {
    event.preventDefault();
    const words = ask.trim();
    if (!words) return;
    const match = ORDER.find((t) => TRADES[t].words.test(words));
    if (match) {
      choose(match);
      setHeard(`${TRADES[match].plural} near you, for “${words}”`);
    } else {
      setHeard("No trade for that here yet. Try a leak, a gate or your car.");
    }
  };

  const ring = (id: string) => {
    setPicked(id);
    setSeconds(0);
    setCall({ id, connected: false });
  };

  return (
    <div className={styles.stage}>
      {/* The trade, in Worldwork's own photography, and what people say */}
      <figure className={styles.photo}>
        <Image key={trade} src={`/assets/workworld/${trade}.webp`} alt="" fill sizes="280px" />
        <figcaption>
          <span className={styles.stars} aria-label="Five stars">
            {[0, 1, 2, 3, 4].map((i) => (
              <Icon key={i} name="star" size={12} tone="current" />
            ))}
          </span>
          <q>He showed up in twenty minutes and fixed it on the spot. Saved the number.</q>
          <small>Reviews stay with the provider, and so does their reply.</small>
        </figcaption>
      </figure>

      <div className={styles.finder}>
        <form className={styles.ask} onSubmit={search} role="search">
          <Icon name="sparkle" size={16} tone="current" />
          <input
            value={ask}
            onChange={(event) => setAsk(event.target.value)}
            placeholder="Who can fix my car today?"
            aria-label="Describe the job in your own words"
            maxLength={80}
          />
          <button type="submit" aria-label="Find who does it" disabled={!ask.trim()}>
            <Icon name="arrow-right" size={16} tone="current" />
          </button>
        </form>

        <div className={styles.trades} role="group" aria-label="Trades">
          {ORDER.map((t) => (
            <button key={t} type="button" aria-pressed={trade === t} onClick={() => choose(t)}>
              {TRADES[t].label}
            </button>
          ))}
        </div>

        <p className={styles.label} aria-live="polite">
          {heard ?? `${plural} near you · closest first`}
        </p>

        {/* How far each one is from you, out to two kilometres */}
        <div className={styles.ruler} aria-hidden="true">
          <span className={styles.track} />
          {[0.5, 1, 1.5, 2].map((km) => (
            <span key={km} className={styles.mark} style={{ "--at": `${(km / RANGE_KM) * 100}%` } as CSSProperties}>
              {km.toFixed(1)} km
            </span>
          ))}
          <span className={styles.you}>You</span>
          {providers.map((p) => (
            <span
              key={p.id}
              className={styles.pin}
              data-picked={picked === p.id || undefined}
              style={{ transform: `translateX(${(p.km / RANGE_KM) * 100}%)` }}
            >
              <b>{initials(p.name)}</b>
            </span>
          ))}
        </div>

        {calling ? (
          <div className={styles.call} role="status">
            <span className={styles.avatar} data-ringing={!call?.connected || undefined}>
              {initials(calling.name)}
            </span>
            <div>
              <strong>{calling.name}</strong>
              <span className="tabular-nums">
                {call?.connected ? `On the line · ${clock(seconds)}` : "Calling…"}
              </span>
            </div>
            <button
              type="button"
              className={styles.save}
              aria-pressed={saved.includes(calling.id)}
              onClick={() =>
                setSaved((all) => (all.includes(calling.id) ? all.filter((id) => id !== calling.id) : [...all, calling.id]))
              }
            >
              <Icon name={saved.includes(calling.id) ? "check" : "bookmark"} size={16} tone="current" />
              {saved.includes(calling.id) ? "Saved" : "Save number"}
            </button>
            <button type="button" className={styles.hang} aria-label="Hang up" onClick={() => setCall(null)}>
              <Icon name="phone-end" size={18} tone="current" />
            </button>
            <p className={styles.direct}>The work and the payment are between you and them.</p>
          </div>
        ) : (
          <ol className={styles.rows}>
            {providers.map((p) => (
              <li key={`${trade}-${p.id}`} data-picked={picked === p.id || undefined}>
                <button type="button" className={styles.who} onClick={() => setPicked(p.id)} aria-pressed={picked === p.id}>
                  <span className={`${styles.km} tabular-nums`}>
                    {p.km.toFixed(1)}
                    <small>km</small>
                  </span>
                  <span className={styles.name}>
                    <strong>{p.name}</strong>
                    <span>
                      <Icon name="star" size={12} tone="current" /> {p.rating.toFixed(1)} · {TRADES[trade].label}
                      {saved.includes(p.id) && " · Saved"}
                    </span>
                  </span>
                </button>
                <button type="button" className={styles.dial} onClick={() => ring(p.id)} aria-label={`Call ${p.name}`}>
                  <Icon name="phone" size={16} tone="current" />
                  Call
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
