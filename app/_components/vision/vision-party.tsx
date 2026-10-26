"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import { Icon } from "@/components/icon";
import styles from "./vision-party.module.css";

type Title = { id: string; title: string; tag: string; detail: string; length: number; start?: number };
type Friend = { id: string; name: string; city: string; face: string };

// Vision's originals as worldstreetgold.com shows them (its art, illustrative
// titles), with sample running times
const TITLES: readonly Title[] = [
  { id: "lagos-after-dark", title: "Lagos After Dark", tag: "Original · S1", detail: "S1 · E3  The Long Night", length: 3510, start: 2468 },
  { id: "the-floor", title: "The Floor", tag: "Film", detail: "Film · 1h 52m", length: 6720 },
  { id: "third-mainland", title: "Third Mainland", tag: "Original · S2", detail: "S2 · E1", length: 3120 },
  { id: "market-women", title: "Market Women", tag: "Original · S1", detail: "S1 · E1", length: 2820 },
  { id: "bull-run", title: "Bull Run", tag: "Documentary", detail: "Documentary · 1h 34m", length: 5640 },
  { id: "danfo", title: "Danfo", tag: "Film", detail: "Film · 1h 41m", length: 6060 },
  { id: "night-shift", title: "Night Shift", tag: "Film", detail: "Film · 1h 48m", length: 6480 },
  { id: "gold-season", title: "Gold Season", tag: "Original · S1", detail: "S1 · E1", length: 3300 },
  { id: "owambe", title: "Owambe", tag: "Comedy", detail: "Comedy · 1h 36m", length: 5760 },
];
// The wall: three columns, each drifting its own way
const COLUMNS = [
  ["lagos-after-dark", "market-women", "night-shift"],
  ["the-floor", "bull-run", "gold-season"],
  ["third-mainland", "danfo", "owambe"],
].map((ids) => ids.map((id) => TITLES.find((t) => t.id === id)!));

const FRIENDS: readonly Friend[] = [
  { id: "tobi", name: "Tobi", city: "Lagos", face: "/assets/people/party-tobi.webp" },
  { id: "amara", name: "Amara", city: "London", face: "/assets/people/party-amara.webp" },
  { id: "kemi", name: "Kemi", city: "Toronto", face: "/assets/people/party-kemi.webp" },
  { id: "ngozi", name: "Ngozi", city: "Abuja", face: "/assets/people/party-ngozi.webp" },
];
const AT_START = 3;
const OTHERS = 2; // watching, but not your friends

const CHATTER: readonly [string, string][] = [
  ["Tobi", "no way he’s the buyer 😭"],
  ["Amara", "I knew it from the first episode"],
  ["Kemi", "turn it up, this part 🔥"],
  ["Tobi", "who’s making popcorn"],
  ["Amara", "the music in this 👌"],
];

const time = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
};

/**
 * A Vision watch party: every screen plays in sync, so pause for one is
 * pause for all. Your friends' screens sit under yours, the picture moving
 * on each at the same moment; pick a title off the wall and everyone's on
 * it; share the link and someone else joins.
 */
export function VisionParty() {
  const [current, setCurrent] = useState(TITLES[0]);
  const [at, setAt] = useState(TITLES[0].start ?? 0);
  const [playing, setPlaying] = useState(true);
  const [here, setHere] = useState(AT_START);
  const [line, setLine] = useState<{ id: number; who: string; text: string }>({ id: 0, who: "Tobi", text: CHATTER[0][1] });
  const [news, setNews] = useState<{ id: number; text: string } | null>(null);

  // The film plays, for everyone at once
  useEffect(() => {
    if (!playing) return;
    const tick = setInterval(() => setAt((s) => (s + 1) % current.length), 1000);
    const talk = setInterval(
      () =>
        setLine((l) => {
          const [who, text] = CHATTER[(l.id + 1) % CHATTER.length];
          return { id: l.id + 1, who, text };
        }),
      3800,
    );
    return () => {
      clearInterval(tick);
      clearInterval(talk);
    };
  }, [playing, current]);

  const tell = (text: string) => setNews((n) => ({ id: (n?.id ?? 0) + 1, text }));
  const say = (who: string, text: string) => setLine((l) => ({ id: l.id + 1, who, text }));

  const toggle = () => {
    setPlaying(!playing);
    tell(playing ? "You paused it for everyone" : "Playing for everyone");
    if (playing) say("Kemi", "perfect, grabbing snacks");
  };
  const seek = (by: number) => {
    setAt((s) => Math.min(current.length - 1, Math.max(0, s + by)));
    tell(`Everyone ${by > 0 ? "skipped ahead" : "went back"} ${Math.abs(by)} seconds`);
  };
  const pick = (title: Title) => {
    if (title.id === current.id) return;
    setCurrent(title);
    setAt(title.start ?? 0);
    setPlaying(true);
    tell(`You put on ${title.title}. Everyone’s watching`);
    say("Amara", "ooh, good pick");
  };
  const invite = () => {
    const friend = FRIENDS[here];
    setHere(here + 1);
    tell(`${friend.name} joined from ${friend.city}`);
    say(friend.name, "made it! what did I miss");
  };

  // The picture's slow drift follows the film's time, so every screen
  // moves together, and stops when it's paused
  const drift = { "--drift": Math.abs(((at / 24) % 2) - 1) } as CSSProperties;
  const art = `/assets/vision/${current.id}.webp`;
  const friends = FRIENDS.slice(0, here);

  return (
    <div className={styles.stage}>
      <div className={styles.party}>
        <div className={styles.frame} data-paused={!playing || undefined}>
          <Image key={current.id} src={art} alt="" fill sizes="(max-width: 1023px) 90vw, 420px" className={styles.art} style={drift} />
          <div className={styles.top}>
            <span className={styles.sync}>Watch party · in sync</span>
            <span className="tabular-nums">{here + 1 + OTHERS} watching</span>
          </div>
          <div className={styles.now}>
            <span className={styles.tag}>{current.tag}</span>
            <strong>{current.title}</strong>
            <span>{current.detail}</span>
          </div>
          {!playing && (
            <span className={styles.paused} aria-hidden="true">
              <Icon name="pause" size={32} tone="current" />
            </span>
          )}
          {news && (
            <p key={news.id} className={styles.news} role="status">
              {news.text}
            </p>
          )}
        </div>

        <div className={styles.controls}>
          <button type="button" className={styles.tool} aria-label="Back 10 seconds, for everyone" onClick={() => seek(-10)}>
            <Icon name="rewind" size={20} tone="current" />
          </button>
          <button
            type="button"
            className={styles.play}
            aria-label={playing ? "Pause for everyone" : "Play for everyone"}
            onClick={toggle}
          >
            <Icon name={playing ? "pause" : "play"} size={20} tone="current" />
          </button>
          <button type="button" className={styles.tool} aria-label="Forward 10 seconds, for everyone" onClick={() => seek(10)}>
            <Icon name="fast-forward" size={20} tone="current" />
          </button>
          <div className={styles.progress} aria-hidden="true">
            <i style={{ transform: `scaleX(${at / current.length})` }} />
          </div>
          <span className={`${styles.time} tabular-nums`}>
            {time(at)} / {time(current.length)}
          </span>
        </div>

        {/* Everyone's screen, showing the same moment */}
        <ul className={styles.screens} aria-label={`${here + 1} friends in the party`}>
          {[{ id: "you", name: "You", city: "Home", face: "" }, ...friends].map((friend) => (
            <li key={friend.id}>
              <div className={styles.mini} data-paused={!playing || undefined}>
                <Image src={art} alt="" fill sizes="96px" className={styles.art} style={drift} />
                {!playing && <Icon name="pause" size={16} tone="current" />}
              </div>
              <span className={styles.who}>
                {friend.face ? <Image src={friend.face} alt="" width={20} height={20} /> : <i className={styles.me}>Y</i>}
                <span>
                  {friend.name}
                  <small>{friend.city}</small>
                </span>
              </span>
            </li>
          ))}
          <li>
            <button type="button" className={styles.invite} onClick={invite} disabled={here === FRIENDS.length}>
              <Icon name={here === FRIENDS.length ? "check" : "user-plus"} size={20} tone="current" />
              {here === FRIENDS.length ? "All in" : "Invite"}
            </button>
          </li>
        </ul>

        <p key={line.id} className={styles.chat}>
          <b>{line.who}</b> {line.text}
        </p>
      </div>

      {/* Tonight's wall: pick one and everyone's on it */}
      <div className={styles.wall}>
        <div className={styles.tilt}>
          {COLUMNS.map((column, c) => (
            <div key={c} className={styles.column} data-column={c}>
              {[0, 1].map((copy) =>
                column.map((title) => (
                  <button
                    key={`${copy}-${title.id}`}
                    type="button"
                    className={styles.poster}
                    aria-pressed={current.id === title.id}
                    aria-label={`Watch ${title.title} together`}
                    aria-hidden={copy ? true : undefined}
                    tabIndex={copy ? -1 : undefined}
                    data-copy={copy || undefined}
                    onClick={() => pick(title)}
                  >
                    <Image src={`/assets/vision/${title.id}.webp`} alt="" fill sizes="160px" />
                    <span className={styles.tag}>{title.tag}</span>
                    <strong>{title.title}</strong>
                    {current.id === title.id && <span className={styles.watching}>Watching</span>}
                  </button>
                )),
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
