"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { PlatformViewShell } from "./platform-view-shell";
import { CallGlobe, type Place } from "./worldmeet/call-globe";
import styles from "./worldmeet-platform-view.module.css";

type Lang = "en" | "pcm" | "fr";
type Id = "mum" | "tunde" | "ravi" | "elena" | "mei";

const LANGS: readonly [Lang, string][] = [
  ["en", "English"],
  ["pcm", "Pidgin"],
  ["fr", "Français"],
];

const HOME: Place = { lon: -0.1, lat: 51.5 }; // you, in London

// Who's on the Sunday call, each in their own city
const PEOPLE: Record<Id, { name: string; city: string; place: Place; face: string }> = {
  mum: { name: "Mum", city: "Lagos", place: { lon: 3.4, lat: 6.5 }, face: "/assets/people/meet-mum.webp" },
  tunde: { name: "Tunde", city: "Toronto", place: { lon: -79.4, lat: 43.7 }, face: "/assets/people/meet-tunde.webp" },
  ravi: { name: "Ravi", city: "Nairobi", place: { lon: 36.8, lat: -1.3 }, face: "/assets/people/meet-ravi.webp" },
  elena: { name: "Elena", city: "São Paulo", place: { lon: -46.6, lat: -23.5 }, face: "/assets/people/meet-elena.webp" },
  mei: { name: "Mei", city: "Johannesburg", place: { lon: 28, lat: -26.2 }, face: "/assets/people/meet-mei.webp" },
};
// Mum's on the line already; Tunde and Ravi come in on their own, the rest
// when you share the link
const ORDER: readonly Id[] = ["mum", "tunde", "ravi", "elena", "mei"];
const ARRIVALS_MS = [1600, 3400];

// The conversation, captioned live in the language you pick; a line is
// said only once its speaker is on the call (and yours not while muted)
const SCRIPT: readonly { by: Id | "you"; say: Record<Lang, string> }[] = [
  { by: "mum", say: { en: "Can everyone hear me?", pcm: "Una dey hear me?", fr: "Tout le monde m’entend ?" } },
  {
    by: "tunde",
    say: { en: "Loud and clear from Toronto.", pcm: "I dey hear you well well from Toronto.", fr: "Très bien, depuis Toronto." },
  },
  { by: "ravi", say: { en: "Morning from Nairobi!", pcm: "Good morning from Nairobi o!", fr: "Bonjour de Nairobi !" } },
  { by: "elena", say: { en: "Sorry I’m late!", pcm: "Sorry, I late small!", fr: "Désolée du retard !" } },
  {
    by: "mei",
    say: {
      en: "Hi all, joining from Johannesburg.",
      pcm: "Hello everybody, na from Johannesburg I dey join.",
      fr: "Salut, je me joins depuis Johannesburg.",
    },
  },
  { by: "you", say: { en: "Everyone’s here. Let’s start.", pcm: "Everybody don come. Make we start.", fr: "Tout le monde est là. On commence." } },
];

const LINE_MS = 3200;
const STARTED_AT = 12 * 60 + 4; // the call's been going a while when you arrive

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

/**
 * WorldMeet, which WorldCall became: one call, voice to video, one person to
 * everyone. You're on with Mum in Lagos when you arrive; Tunde and Ravi join
 * from their cities, each drawing a gold arc across the globe to you, and
 * sharing the link brings in the rest. Whoever's talking lights up, on the
 * globe and in the call, captioned live in English, Pidgin or French.
 */
export function WorldmeetPlatformView() {
  const [here, setHere] = useState(1);
  const [inCall, setInCall] = useState(true);
  const [seconds, setSeconds] = useState(STARTED_AT);
  const [line, setLine] = useState(0);
  const [muted, setMuted] = useState(false);
  const [hand, setHand] = useState(false);
  const [captions, setCaptions] = useState(true);
  const [lang, setLang] = useState<Lang>("en");

  // The first guests arrive on their own
  useEffect(() => {
    if (!inCall) return;
    const timers = ARRIVALS_MS.map((ms, i) => setTimeout(() => setHere((n) => Math.max(n, i + 2)), ms));
    return () => timers.forEach(clearTimeout);
  }, [inCall]);

  // The clock runs and the conversation goes round whoever's here
  useEffect(() => {
    if (!inCall) return;
    const tick = setInterval(() => setSeconds((s) => s + 1), 1000);
    const talk = setInterval(() => {
      setLine((current) => {
        for (let step = 1; step <= SCRIPT.length; step++) {
          const next = (current + step) % SCRIPT.length;
          const by = SCRIPT[next].by;
          if (by === "you" ? !muted : ORDER.indexOf(by) < here) return next;
        }
        return current;
      });
    }, LINE_MS);
    return () => {
      clearInterval(tick);
      clearInterval(talk);
    };
  }, [inCall, here, muted]);

  const guests = inCall ? ORDER.slice(0, here) : [];
  const said = SCRIPT[line];
  const speaking = inCall && (said.by === "you" || guests.includes(said.by)) ? said.by : null;

  return (
    <PlatformViewShell
      name="WorldMeet"
      glass="light"
      eyebrow={
        <span className={styles.brand}>
          <Image src="/assets/worldmeet/mark.svg" alt="" width={28} height={28} unoptimized />
          WorldMeet
        </span>
      }
      title={
        <>
          <span className={styles.lead}>Family in London. Team in Lagos.</span>
          <span className={styles.link}>
            One{" "}
            <span className={styles.marked}>
              link.
              {/* A hand-drawn gold squiggle under the word, as on worldstreetgold.com */}
              <svg aria-hidden="true" viewBox="0 0 120 24" preserveAspectRatio="none" className={styles.squiggle}>
                <path d="M3 14 C 15 4, 25 4, 33 13 S 51 22, 61 12 S 81 3, 91 12 S 109 21, 117 10" pathLength={1} />
              </svg>
            </span>
          </span>
        </>
      }
    >
      <div className={styles.stage}>
        <div className={styles.world}>
          {/* The call going out, in gold rings */}
          <span className={styles.waves} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <CallGlobe
            home={HOME}
            homePin={
              <span className={styles.home} data-talking={speaking === "you" || undefined}>
                {muted && inCall ? <Icon name="mic-off" size={16} tone="current" /> : "You"}
              </span>
            }
            guests={guests.map((id) => ({
              id,
              place: PEOPLE[id].place,
              talking: speaking === id,
              pin: (
                <span className={styles.them} data-talking={speaking === id || undefined}>
                  <Image src={PEOPLE[id].face} alt="" width={48} height={48} />
                  <span className={styles.city}>{PEOPLE[id].city}</span>
                </span>
              ),
            }))}
          />
        </div>

        <section className={styles.card} aria-label="Sunday family call">
          {inCall ? (
            <>
              <header className={styles.head}>
                <span className={styles.live}>Live</span>
                <strong>Sunday family call</strong>
                <span className={`${styles.quiet} tabular-nums`}>{clock(seconds)}</span>
              </header>

              <ul className={styles.tiles} aria-label={`${guests.length + 1} on the call`}>
                <li className={styles.tile} data-talking={speaking === "you" || undefined}>
                  <span className={styles.me}>You</span>
                  {(muted || hand) && (
                    <span className={styles.plate}>
                      {muted && <Icon name="mic-off" size={12} tone="current" />}
                      {hand && <Icon name="hand" size={12} tone="current" />}
                    </span>
                  )}
                </li>
                {guests.map((id) => (
                  <li key={id} className={styles.tile} data-talking={speaking === id || undefined}>
                    <Image src={PEOPLE[id].face} alt="" width={96} height={96} />
                    <span className={styles.plate}>{PEOPLE[id].name}</span>
                  </li>
                ))}
              </ul>

              {captions && (
                <div className={styles.captions}>
                  <div className={styles.langs} role="group" aria-label="Caption language">
                    {LANGS.map(([id, label]) => (
                      <button key={id} type="button" aria-pressed={lang === id} onClick={() => setLang(id)}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <p key={`${line}-${lang}`} className={styles.line}>
                    <span className={styles.speaker}>{said.by === "you" ? "You" : PEOPLE[said.by].name}</span>
                    {said.say[lang].split(" ").map((word, i) => (
                      <span key={i} style={{ "--i": i } as CSSProperties}>
                        {word}{" "}
                      </span>
                    ))}
                  </p>
                </div>
              )}

              <div className={styles.controls}>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className={styles.tool}
                  aria-label="Mute"
                  aria-pressed={muted}
                  onClick={() => setMuted(!muted)}
                >
                  <Icon name={muted ? "mic-off" : "mic"} size={20} tone="current" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className={styles.tool}
                  aria-label="Raise hand"
                  aria-pressed={hand}
                  onClick={() => setHand(!hand)}
                >
                  <Icon name="hand" size={20} tone="current" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className={styles.tool}
                  aria-label="Live captions"
                  aria-pressed={captions}
                  onClick={() => setCaptions(!captions)}
                >
                  <Icon name="captions" size={20} tone="current" />
                </Button>
                <Button
                  size="sm"
                  className={styles.share}
                  disabled={here === ORDER.length}
                  onClick={() => setHere((n) => Math.min(ORDER.length, n + 1))}
                >
                  <Icon name="link" size={16} tone="current" />
                  {here === ORDER.length ? "All here" : "Share link"}
                </Button>
                <Button size="icon-sm" className={styles.leave} aria-label="Leave the call" onClick={() => setInCall(false)}>
                  <Icon name="phone" size={20} tone="current" />
                </Button>
              </div>
            </>
          ) : (
            <div className={styles.left}>
              <span className={styles.quiet}>You left the call</span>
              <strong className="tabular-nums">{clock(seconds)}</strong>
              <span className={styles.quiet}>time in the call</span>
              <Button
                className={styles.rejoin}
                onClick={() => {
                  setHere(1);
                  setLine(0);
                  setSeconds(0);
                  setInCall(true);
                }}
              >
                <Icon name="phone" size={20} tone="current" />
                Rejoin
              </Button>
            </div>
          )}
        </section>
      </div>
    </PlatformViewShell>
  );
}
