"use client";

import { useEffect, useEffectEvent, useRef, useState, type CSSProperties, type FormEvent } from "react";
import Image from "next/image";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import styles from "./xtream-battle.module.css";

type Side = "zara" | "kojo";
type Gift = { id: string; name: string; price: number; verb?: string };
type Backer = { handle: string; face: string };
type Line = { id: number; who: string; face?: string; text: string; gift?: Gift; side?: Side };
type Burst = { id: number; side: Side; gift: Gift; big: boolean; sprites: { x: number; d: number; s: number }[] };
type Toast = { id: number; who: string; face?: string; gift: Gift; count: number };

// Xtream's own battle: its host and challenger loops and posters
// (xtream.worldstreetgold.com/promo), and gifts drawn as Noto's animated
// emoji, as in the app (Google, CC BY 4.0)
const HOSTS: Record<Side, { name: string; video: string; poster: string }> = {
  zara: { name: "Zara", video: "/assets/xtream/zara.mp4", poster: "/assets/images/xtream-live.webp" },
  kojo: { name: "Kojo Beats", video: "/assets/xtream/kojo.mp4", poster: "/assets/xtream/kojo.webp" },
};
const SIDES: readonly Side[] = ["zara", "kojo"];

// A few of Xtream's gifts and their prices, from $0.50 to $100
const GIFTS: readonly Gift[] = [
  { id: "clap", name: "Clap", price: 0.5 },
  { id: "heart", name: "Heart", price: 1 },
  { id: "fire", name: "Fire", price: 2, verb: "lit it up" },
  { id: "rocket", name: "Rocket", price: 5 },
  { id: "diamond", name: "Diamond", price: 20 },
  { id: "crown", name: "Crown", price: 100, verb: "crowned the stream" },
];
// How often the room sends each (mostly small, now and then a crown)
const ROOM_ODDS = [30, 30, 20, 14, 5, 1];

const face = (id: string) => `/assets/people/${id}.webp`;
const BACKERS: Record<Side, readonly Backer[]> = {
  zara: [
    { handle: "whale.eth", face: face("daniel") },
    { handle: "lagos_ape", face: face("emeka") },
    { handle: "kofi.sol", face: face("kofi") },
  ],
  kojo: [
    { handle: "degen_ada", face: face("amaka") },
    { handle: "amap_queen", face: face("zainab") },
    { handle: "tobi.btc", face: face("segun") },
  ],
};
const START = {
  score: { zara: 1284, kojo: 942 },
  backed: { "whale.eth": 620, "lagos_ape": 310, "kofi.sol": 180, degen_ada: 480, amap_queen: 260, "tobi.btc": 140 } as Record<string, number>,
};

// The room talking; the last line only near the end
const CHATTER: readonly { who: string; face: string; text: string; late?: boolean }[] = [
  { who: "whale.eth", face: face("daniel"), text: "Zara all day 🔥" },
  { who: "amap_queen", face: face("zainab"), text: "this beat is crazy" },
  { who: "mei.wav", face: face("lin"), text: "first battle, this is wild" },
  { who: "degen_ada", face: face("amaka"), text: "Kojo come back!!" },
  { who: "lagos_ape", face: face("emeka"), text: "who's singing tonight 😂" },
  { who: "tobi.btc", face: face("segun"), text: "send the crown" },
  { who: "kofi.sol", face: face("kofi"), text: "last 10s decides it", late: true },
];

const ROUND = 45;
const WALLET = 500;
const COMBO_MS = 2500;

let uid = 0;
const next = () => ++uid;
const money = (n: number, cents = false) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 })}`;
const price = (n: number) => (n < 1 ? "$0.50" : money(n));
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const gifted = (gift: Gift) => gift.verb ?? `sent a ${gift.name}`;

function pick<T>(items: readonly T[], odds?: readonly number[]) {
  if (!odds) return items[Math.floor(Math.random() * items.length)];
  let roll = Math.random() * odds.reduce((a, b) => a + b, 0);
  for (let i = 0; i < items.length; i++) if ((roll -= odds[i]) < 0) return items[i];
  return items[0];
}

/**
 * An Xtream battle: two rooms, one clock. Zara and Kojo Beats live side by
 * side, the room's gifts pulling the bar one way or the other. Tap a side
 * to back it, then send gifts from your wallet: they burst on the picture,
 * combos stack, and a crown in the last seconds buys fifteen more. When the
 * clock runs out the loser sings, and the next round starts.
 */
export function XtreamBattle() {
  const reduced = useReducedMotion();
  const [left, setLeft] = useState(ROUND);
  const [score, setScore] = useState(START.score);
  const [backed, setBacked] = useState(START.backed);
  const [side, setSide] = useState<Side>("zara");
  const [wallet, setWallet] = useState(WALLET);
  const [mine, setMine] = useState({ zara: 0, kojo: 0 });
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);
  const [added, setAdded] = useState(0);
  const [chat, setChat] = useState<Line[]>(() =>
    CHATTER.slice(0, 5).map((line) => ({ id: next(), ...line })),
  );
  const [tab, setTab] = useState<"chat" | "backers">("chat");
  const [draft, setDraft] = useState("");

  const over = left <= 0;
  const combo = useRef({ gift: "", side: "", at: 0, count: 0, toast: 0 });
  const extended = useRef(0);

  const say = (line: Omit<Line, "id">) => setChat((lines) => [...lines.slice(-13), { id: next(), ...line }]);

  const burst = (to: Side, gift: Gift) => {
    if (reduced) return;
    const big = gift.price >= 20;
    const count = gift.price < 2 ? 3 : big ? 3 : 4;
    const sprites = Array.from({ length: count }, (_, i) => ({
      x: Math.round((Math.random() - 0.5) * 120),
      d: i * 90,
      s: 0.7 + Math.random() * 0.6,
    }));
    setBursts((all) => [...all.slice(-11), { id: next(), side: to, gift, big, sprites }]);
  };

  // The clock
  useEffect(() => {
    if (over) return;
    const tick = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(tick);
  }, [over]);

  // The room backs both sides, the trailing one a little harder, so it's close
  const roomGives = useEffectEvent(() => {
    const behind: Side = score.zara < score.kojo ? "zara" : "kojo";
    const to: Side = Math.random() < 0.62 ? behind : behind === "zara" ? "kojo" : "zara";
    const gift = pick(GIFTS, ROOM_ODDS);
    const who = pick(BACKERS[to]);
    setScore((s) => ({ ...s, [to]: s[to] + gift.price }));
    setBacked((b) => ({ ...b, [who.handle]: (b[who.handle] ?? 0) + gift.price }));
    burst(to, gift);
    if (gift.price >= 5) {
      setToast({ id: next(), who: who.handle, face: who.face, gift, count: 1 });
      say({ who: who.handle, face: who.face, text: gifted(gift), gift, side: to });
    }
  });
  const roomTalks = useEffectEvent(() => say(pick(CHATTER.filter((line) => !line.late || left <= 12))));
  useEffect(() => {
    if (over) return;
    const room = setInterval(roomGives, 1300);
    const talk = setInterval(roomTalks, 2100);
    return () => {
      clearInterval(room);
      clearInterval(talk);
    };
  }, [over]);

  function rematch() {
    extended.current = 0;
    combo.current = { gift: "", side: "", at: 0, count: 0, toast: 0 };
    setLeft(ROUND);
    setScore(START.score);
    setBacked(START.backed);
    setMine({ zara: 0, kojo: 0 });
    setWallet(WALLET);
    setToast(null);
    setBursts([]);
  }

  // After the result, the next round
  const again = useEffectEvent(() => rematch());
  useEffect(() => {
    if (!over) return;
    const later = setTimeout(again, 10000);
    return () => clearTimeout(later);
  }, [over]);

  const send = (gift: Gift, now: number) => {
    if (over || wallet < gift.price) return;
    const last = combo.current;
    const same = last.gift === gift.id && last.side === side && now - last.at < COMBO_MS;
    combo.current = { gift: gift.id, side, at: now, count: same ? last.count + 1 : 1, toast: same ? last.toast : next() };
    setWallet((w) => Math.round((w - gift.price) * 100) / 100);
    setScore((s) => ({ ...s, [side]: s[side] + gift.price }));
    setMine((m) => ({ ...m, [side]: m[side] + gift.price }));
    setToast({ id: combo.current.toast, who: "you", gift, count: combo.current.count });
    burst(side, gift);
    if (!same) say({ who: "you", text: gifted(gift), gift, side });
    // A crown in the last fifteen seconds buys fifteen more (twice a round)
    if (gift.id === "crown" && left <= 15 && extended.current < 2) {
      extended.current += 1;
      setLeft((s) => s + 15);
      setAdded(next());
    }
  };

  const post = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    say({ who: "you", text });
    setDraft("");
  };

  const leader: Side = score.zara >= score.kojo ? "zara" : "kojo";
  const trailer: Side = leader === "zara" ? "kojo" : "zara";
  const gap = Math.round(score[leader] - score[trailer]);
  const share = score.zara / (score.zara + score.kojo);
  const yours = mine.zara + mine.kojo;
  // Each side's top three, and you under them once you've backed it
  const board = (to: Side) => {
    const ranked = [
      ...BACKERS[to].map((b) => ({ ...b, amount: backed[b.handle] ?? 0 })),
      ...(mine[to] ? [{ handle: "you", face: "", amount: mine[to] }] : []),
    ]
      .sort((a, b) => b.amount - a.amount)
      .map((b, i) => ({ ...b, rank: i + 1 }));
    return ranked.filter((b) => b.rank <= 3 || b.handle === "you");
  };

  return (
    <div className={styles.stage}>
      <div className={styles.battle}>
        <div className={styles.screen} data-over={over || undefined} data-winner={over ? leader : undefined}>
          {SIDES.map((to) => (
            <button
              key={to}
              type="button"
              className={styles.half}
              data-side={to}
              aria-pressed={side === to}
              aria-label={`Back ${HOSTS[to].name}`}
              disabled={over}
              onClick={() => setSide(to)}
            >
              <video
                src={HOSTS[to].video}
                poster={HOSTS[to].poster}
                autoPlay={!reduced}
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden="true"
              />
              {side === to && !over && <span className={styles.backing}>You’re backing</span>}
            </button>
          ))}

          {/* The scoreboard: what each side has, the bar between, the clock */}
          <div className={styles.hud} aria-live="off">
            <div className={styles.scores}>
              {SIDES.map((to) => (
                <p key={to} data-side={to}>
                  <span>{HOSTS[to].name}</span>
                  <strong className="tabular-nums">{money(Math.round(score[to]))}</strong>
                </p>
              ))}
            </div>
            <div className={styles.tug} aria-hidden="true">
              <i className={styles.fill} style={{ transform: `scaleX(${share})` }} />
              <i className={styles.seam} style={{ transform: `translateX(${share * 100}%)` }} />
            </div>
            <div className={styles.clock}>
              <span className={`${styles.timer} tabular-nums`} data-hot={left <= 10 || undefined}>
                {clock(left)}
              </span>
              {added > 0 && !over && (
                <span key={added} className={styles.plus}>
                  +15s
                </span>
              )}
            </div>
            {!over && (
              <span className={styles.lead}>
                {gap === 0 ? "Dead level" : `${HOSTS[leader].name} leads by ${money(gap)}`}
              </span>
            )}
          </div>

          {/* Gifts bursting up the side they backed */}
          <div className={styles.bursts} aria-hidden="true">
            {bursts.map((b) => (
              <span
                key={b.id}
                className={styles.burst}
                data-side={b.side}
                data-big={b.big || undefined}
                onAnimationEnd={(event) => {
                  if (event.target === event.currentTarget) setBursts((all) => all.filter((x) => x.id !== b.id));
                }}
              >
                {b.big && <Image unoptimized className={styles.takeover} src={`/assets/xtream/gifts/${b.gift.id}.webp`} alt="" width={112} height={112} />}
                {b.sprites.map((s, i) => (
                  <Image unoptimized
                    key={i}
                    src={`/assets/xtream/gifts/${b.gift.id}.webp`}
                    alt=""
                    width={48}
                    height={48}
                    style={{ "--x": `${s.x}px`, "--d": `${s.d}ms`, "--s": s.s } as CSSProperties}
                  />
                ))}
              </span>
            ))}
          </div>

          {toast && !over && (
            <p key={toast.id} className={styles.toast} role="status">
              {toast.face ? (
                <Image src={toast.face} alt="" width={32} height={32} />
              ) : (
                <span className={styles.me}>Y</span>
              )}
              <span>
                <strong>
                  @{toast.who} sent a {toast.gift.name}
                </strong>
                <span className={styles.value}>
                  {price(toast.gift.price)}
                  {toast.count > 1 && (
                    <b key={toast.count} className={styles.combo}>
                      ×{toast.count}
                    </b>
                  )}
                </span>
              </span>
              <Image unoptimized src={`/assets/xtream/gifts/${toast.gift.id}.webp`} alt="" width={28} height={28} />
            </p>
          )}
          {!over && (
            <span className={styles.forfeit}>
              <b>Loser</b> sings a song live
            </span>
          )}

          {over && (
            <div className={styles.result} role="status">
              <Image unoptimized src="/assets/xtream/gifts/crown.webp" alt="" width={56} height={56} />
              <strong>{HOSTS[leader].name} wins</strong>
              <span className="tabular-nums">
                {money(Math.round(score[leader]))} to {money(Math.round(score[trailer]))}. {HOSTS[trailer].name} sings
                a song live.
              </span>
              {yours > 0 && (
                <span className={styles.yours}>
                  You put {money(yours, yours % 1 !== 0)} behind{" "}
                  {mine.zara && mine.kojo ? "both of them" : HOSTS[mine.zara ? "zara" : "kojo"].name}
                </span>
              )}
              <Button size="sm" className={styles.rematch} onClick={rematch}>
                <Icon name="refresh" size={16} tone="current" />
                Rematch
              </Button>
            </div>
          )}
        </div>

        {/* Your side, your gifts, your wallet */}
        <div className={styles.tray}>
          <button
            type="button"
            className={styles.side}
            data-side={side}
            onClick={() => setSide(side === "zara" ? "kojo" : "zara")}
            aria-label={`Backing ${HOSTS[side].name}. Switch sides`}
          >
            <Icon name="arrows-left-right" size={16} tone="current" />
            <span>
              <strong>{HOSTS[side].name}</strong>
              <span className="tabular-nums">{money(wallet, true)}</span>
            </span>
          </button>
          <div className={styles.gifts} role="group" aria-label="Send a gift">
            {GIFTS.map((gift) => (
              <button
                key={gift.id}
                type="button"
                className={styles.gift}
                disabled={over || wallet < gift.price}
                onClick={(event) => send(gift, event.timeStamp)}
                aria-label={`Send a ${gift.name}, ${price(gift.price)}`}
              >
                <Image unoptimized src={`/assets/xtream/gifts/${gift.id}.webp`} alt="" width={32} height={32} />
                <span className="tabular-nums">{price(gift.price)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* The room: its chat, and who's backing whom */}
      <section className={styles.room} aria-label="Battle chat">
        <div className={styles.tabs} role="group" aria-label="Show">
          <button type="button" aria-pressed={tab === "chat"} onClick={() => setTab("chat")}>
            Live chat
          </button>
          <button type="button" aria-pressed={tab === "backers"} onClick={() => setTab("backers")}>
            Top backers
          </button>
        </div>
        {tab === "chat" ? (
          <ol className={styles.chat} aria-live="polite">
            {chat.map((line) => (
              <li key={line.id} data-gift={line.gift ? "" : undefined} data-side={line.side}>
                {line.face ? (
                  <Image src={line.face} alt="" width={24} height={24} />
                ) : (
                  <span className={styles.me}>Y</span>
                )}
                <p>
                  <b>{line.who}</b> {line.text}
                  {line.gift && (
                    <span className={styles.value}>
                      {" "}
                      {price(line.gift.price)} to {line.side && HOSTS[line.side].name}
                    </span>
                  )}
                </p>
                {line.gift && <Image unoptimized src={`/assets/xtream/gifts/${line.gift.id}.webp`} alt="" width={20} height={20} />}
              </li>
            ))}
          </ol>
        ) : (
          <div className={styles.backers}>
            {SIDES.map((to) => (
              <div key={to} data-side={to}>
                <h4>{HOSTS[to].name}</h4>
                <ol>
                  {board(to).map((b) => (
                    <li key={b.handle} data-you={b.handle === "you" || undefined}>
                      <span className="tabular-nums">{b.rank}</span>
                      {b.face ? <Image src={b.face} alt="" width={24} height={24} /> : <span className={styles.me}>Y</span>}
                      <span>@{b.handle}</span>
                      <b className={`${styles.value} tabular-nums`}>{money(Math.round(b.amount))}</b>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}
        <form className={styles.say} onSubmit={post}>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Say something…"
            aria-label="Say something in the chat"
            maxLength={80}
          />
          <button type="submit" aria-label="Send" disabled={!draft.trim()}>
            <Icon name="send" size={16} tone="current" />
          </button>
        </form>
      </section>
    </div>
  );
}
