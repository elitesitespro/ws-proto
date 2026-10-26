"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { cn } from "cn";
import { Icon, type IconName } from "@/components/icon";
import type { Face, GameArt, PinCard } from "./globe-pins-content";
import styles from "./globe-pins.module.css";

/** A card's live state: the figure that ticks, and whatever else its kind keeps moving. */
export type PinLive = {
  /** The figure that ticks: a price, or a count of people, players or sales. */
  value: number;
  /** Prices: the change, in %. */
  change: number;
  /** Prices: recent values, oldest first, for the sparkline. */
  history: readonly number[];
  /** Matches: the leaders' scores. */
  scores: readonly number[];
  /** Matches: seconds left in the round. */
  seconds: number;
  /** Matches: the last points scored, and by which leader (their place in the card's list). */
  gain?: { slot: number; by: number };
  /** Bumps on every tick, so the figure that moved can flash. */
  tick: number;
  up: boolean;
};

const fmt = (n: number, decimals = 0) =>
  n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/** The figure that just moved flashes: emerald or red for money, the platform's colour for the rest. */
function flashFor(live: PinLive, money: boolean) {
  if (live.tick === 0) return undefined;
  if (!money) return styles.flashCount;
  return live.up ? styles.flashUp : styles.flashDown;
}

function Photo({
  src,
  className,
  sizes,
  position,
  size,
}: {
  src: string;
  className?: string;
  sizes: string;
  position?: string;
  /** A square of this many px, for faces. */
  size?: number;
}) {
  return (
    <span className={cn("relative block shrink-0 overflow-hidden", className)} style={size ? { width: size, height: size } : undefined}>
      <Image src={src} alt="" fill sizes={sizes} className="object-cover" style={position ? { objectPosition: position } : undefined} />
    </span>
  );
}

// The ring, in the card's own tint, cuts each face out of the one beside it in a stack
function Avatar({ face, size }: { face: Face; size: number }) {
  return (
    <Photo src={face.src} sizes={`${size}px`} size={size} position="50% 30%" className="rounded-full ring-2 ring-[rgb(var(--cx-glass-rgb))]" />
  );
}

function FaceStack({ faces, size = 20 }: { faces: readonly Face[]; size?: number }) {
  return (
    <span className="flex">
      {faces.map((face, i) => (
        <span key={face.name} className={cn(i > 0 && "-ml-[6px]")}>
          <Avatar face={face} size={size} />
        </span>
      ))}
    </span>
  );
}

/** A solid tile in the platform's colour, with the glyph in its ink: the card's mark. */
function Mark({ icon, size = 24 }: { icon: IconName; size?: number }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-sm bg-[var(--hue)]" style={{ width: size, height: size }}>
      <Icon name={icon} size={Math.round(size * 0.62)} tone="current" className="text-[var(--hue-on)]" />
    </span>
  );
}

function ChangePill({ change, stable }: { change: number; stable?: boolean }) {
  if (stable) {
    return <span className="rounded-pill bg-white/10 px-1 text-xs leading-[20px] text-[var(--cx-glass-text-2)]">Stable</span>;
  }
  const up = change >= 0;
  return (
    <span
      className={cn(
        "rounded-pill px-1 text-xs leading-[20px] font-medium tabular-nums",
        up ? "bg-[var(--credit-chip)] text-credit" : "bg-[var(--debit-chip)] text-debit"
      )}
    >
      {up ? "+" : "−"}
      {Math.abs(change).toFixed(2)}%
    </span>
  );
}

/** The last few prices as a line, filled faintly beneath, in the money's colour. */
function Sparkline({ values, up }: { values: readonly number[]; up: boolean }) {
  const id = useId();
  const w = 52;
  const h = 28;
  const lo = Math.min(...values);
  const span = Math.max(...values) - lo || 1;
  const points = values.map((v, i) => [(i / (values.length - 1)) * w, h - 3 - ((v - lo) / span) * (h - 6)] as const);
  const line = points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join("");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className={cn("shrink-0 self-end", up ? "text-credit" : "text-debit")} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.32" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line}L${w},${h}L0,${h}Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={points[points.length - 1][0] - 1} cy={points[points.length - 1][1]} r="2" fill="currentColor" />
    </svg>
  );
}

const label = "text-xs leading-[20px] text-[var(--cx-glass-text-2)]";

/** The body of one pin's card, by kind. The card's glass, accent and link are around it (globe-pins.tsx). */
export function PinCardBody({ card, live, city, icon }: { card: PinCard; live: PinLive; city: string; icon: IconName }) {
  const place = (text: string) => text.replace("{city}", city);

  switch (card.kind) {
    case "rate":
    case "coin": {
      const money = !(card.kind === "coin" && card.stable);
      return (
        <span className="flex w-[288px] items-center gap-1.5 py-1.5 pr-1.5 pl-1.5">
          {card.kind === "rate" ? (
            <span className="flex shrink-0">
              <Photo src={card.flags[0]} sizes="28px" className="size-[28px] rounded-full ring-2 ring-[rgb(var(--cx-glass-rgb))]" />
              <Photo src={card.flags[1]} sizes="28px" className="-ml-1 size-[28px] rounded-full ring-2 ring-[rgb(var(--cx-glass-rgb))]" />
            </span>
          ) : (
            <Photo src={card.logo} sizes="36px" className="size-[36px] rounded-full" />
          )}
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="flex items-center gap-1">
              <span className={label}>
                {card.kind === "rate" ? (
                  <>
                    <span className="font-medium text-[var(--cx-glass-text)]">{card.base}</span>/{card.quote}
                  </>
                ) : (
                  <span className="font-medium text-[var(--cx-glass-text)]">{card.symbol}</span>
                )}
              </span>
              <ChangePill change={live.change} stable={card.kind === "coin" && card.stable} />
            </span>
            <span key={live.tick} className={cn("text-base leading-[28px] font-medium tabular-nums", flashFor(live, money))}>
              {card.kind === "coin" && "$"}
              {fmt(live.value, card.decimals)}
            </span>
          </span>
          <Sparkline values={live.history} up={card.kind === "coin" && card.stable ? true : live.change >= 0} />
        </span>
      );
    }

    case "live":
      return (
        <span className="flex w-[232px] flex-col gap-1 p-1">
          <span className="relative block h-[120px] overflow-hidden rounded-md">
            <Photo src={card.thumb} sizes="216px" position="50% 30%" className="absolute inset-0" />
            <span className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,.55),transparent_45%)]" />
            <span className="absolute top-1 left-1 flex items-center gap-[6px] rounded-pill bg-[var(--hue)] py-[2px] pr-1 pl-[8px] text-xs leading-[20px] font-medium text-[var(--hue-on)]">
              <span className={styles.liveDot} />
              LIVE
            </span>
            <span className="absolute bottom-1 left-1 flex items-center gap-[6px] rounded-pill bg-black/50 px-1 text-xs leading-[20px] text-white tabular-nums backdrop-blur-sm">
              <Icon name="eye" size={14} tone="current" className="text-white" />
              <span key={live.tick} className={flashFor(live, false)}>
                {fmt(live.value)}
              </span>
            </span>
          </span>
          <span className="flex items-center gap-1 px-[4px] pb-[4px]">
            <Avatar face={card.host} size={28} />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-xs leading-[20px] font-medium text-[var(--cx-glass-text)]">{card.title}</span>
              <span className={label}>Live from {city}</span>
            </span>
          </span>
        </span>
      );

    case "chat":
      return (
        <span className="flex w-[296px] flex-col gap-1 p-1.5">
          <span className="flex items-center gap-1 pr-[24px]">
            <Mark icon={icon} size={24} />
            <span className="min-w-0 flex-1 truncate text-xs leading-[20px] font-medium text-[var(--cx-glass-text)]">{place(card.group)}</span>
            <span className="flex items-center gap-[6px] text-xs leading-[20px] text-[var(--cx-glass-text-2)] tabular-nums">
              <span className="size-[6px] rounded-full bg-credit" />
              <span key={live.tick} className={flashFor(live, false)}>
                {fmt(live.value)}
              </span>
              online
            </span>
          </span>
          <span className="flex items-end gap-1">
            <Avatar face={card.from} size={28} />
            <span className="min-w-0 flex-1 rounded-md rounded-bl-[4px] bg-white/[.08] px-1.5 py-1">
              <span className="block text-xs leading-[16px] font-medium text-[var(--hue-ink)]">{card.from.name}</span>
              <span className="block text-xs leading-[20px] whitespace-normal text-[var(--cx-glass-text)]">{card.message}</span>
            </span>
          </span>
          <span className="flex items-center justify-between gap-1">
            <span className={cn(label, "flex items-center gap-[6px]")}>
              <Avatar face={card.typing} size={16} />
              {card.typing.name} is typing
              <span className={styles.typing}>
                <span />
                <span />
                <span />
              </span>
            </span>
            <FaceStack faces={card.faces} />
          </span>
        </span>
      );

    case "match": {
      // The live board: leaders re-sort as they score, each with a bar against the leader
      const scored = card.leaders.map((leader, i) => ({ ...leader, slot: i, score: live.scores[i] ?? leader.score }));
      const order = [...scored].sort((a, b) => b.score - a.score);
      const best = order[0].score || 1;
      return (
        <span className="flex w-[272px] flex-col gap-1 p-1.5">
          <span className="flex items-center gap-1.5 pr-[24px]">
            <GameArtTile art={card.art} />
            <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
              <span className="w-fit rounded-pill border border-[var(--hue-line)] bg-[var(--hue-soft)] px-[8px] text-xs leading-[18px] font-medium tracking-[0.06em] text-[var(--hue-ink)] uppercase tabular-nums">
                Round {card.round}/{card.rounds}
              </span>
              <span className="truncate text-sm leading-[24px] font-medium text-[var(--cx-glass-text)]">{card.game}</span>
              <span className={cn(label, "flex items-center gap-[6px] tabular-nums")}>
                <span className={cn(styles.liveDot, "text-[var(--hue)]")} />
                {fmt(live.value)} playing · {city}
              </span>
            </span>
          </span>
          <span className="flex flex-col gap-[6px] rounded-md bg-black/25 p-1 ring-1 ring-white/[.06]">
            {order.map((leader, rank) => (
              <span key={leader.name} className="flex items-center gap-1 text-xs leading-[20px]">
                <RankBadge rank={rank} />
                <Avatar face={leader} size={20} />
                <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                  <span className="flex items-center justify-between gap-1">
                    <span className="truncate text-[var(--cx-glass-text)]">{leader.name}</span>
                    <span className={cn("relative tabular-nums", rank === 0 ? "font-medium text-[var(--hue-ink)]" : "text-[var(--cx-glass-text-2)]")}>
                      {live.gain?.slot === leader.slot && (
                        <span key={live.tick} className={styles.gain}>
                          +{live.gain.by}
                        </span>
                      )}
                      {fmt(leader.score)}
                    </span>
                  </span>
                  <span className="block h-[3px] overflow-hidden rounded-pill bg-white/10">
                    <span
                      className={cn("block h-full rounded-pill transition-[width] duration-500", rank === 0 ? "bg-[var(--hue)]" : "bg-white/35")}
                      style={{ width: `${(leader.score / best) * 100}%` }}
                    />
                  </span>
                </span>
              </span>
            ))}
          </span>
          <span className="flex items-center justify-between">
            <span className="flex items-center gap-[6px] rounded-pill bg-[var(--hue)] py-[4px] pr-1.5 pl-1 text-xs leading-[20px] font-medium text-[var(--hue-on)]">
              <Icon name="play" size={14} tone="current" className="text-[var(--hue-on)]" />
              Play now
            </span>
            <Countdown seconds={live.seconds} />
          </span>
        </span>
      );
    }

    case "product":
      return (
        <span className="flex w-[256px] items-center gap-1.5 p-1 pr-[32px]">
          <ProductImage src={card.image} icon={card.icon} />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-xs leading-[20px] font-medium text-[var(--cx-glass-text)]">{card.name}</span>
            <span className="flex items-baseline gap-1">
              <span className="text-sm leading-[24px] font-medium text-[var(--hue-ink)]">{card.price}</span>
              <span className={cn(label, "tabular-nums")}>
                <span key={live.tick} className={cn("font-medium text-[var(--cx-glass-text)]", flashFor(live, false))}>
                  {fmt(live.value)}
                </span>{" "}
                sold today
              </span>
            </span>
            <span className={cn(label, "truncate")}>{place(card.seller)}</span>
          </span>
        </span>
      );

    case "course": {
      const progress = Math.round((card.lesson / card.lessons) * 100);
      return (
        <span className="flex w-[272px] items-center gap-1.5 p-1 pr-[32px]">
          <Photo src={card.cover} sizes="64px" className="h-[84px] w-[64px] rounded-sm" />
          <span className="flex min-w-0 flex-1 flex-col gap-[6px]">
            <span className="flex flex-col">
              <span className="truncate text-xs leading-[20px] font-medium text-[var(--cx-glass-text)]">{card.title}</span>
              <span className={label}>
                Lesson {card.lesson} of {card.lessons}
              </span>
            </span>
            <span className="block h-[6px] overflow-hidden rounded-pill bg-white/10">
              <span className="block h-full rounded-pill bg-[var(--hue)]" style={{ width: `${progress}%` }} />
            </span>
            <span className={cn(label, "flex items-center gap-[6px] tabular-nums")}>
              <FaceStack faces={card.faces} size={18} />
              <span key={live.tick} className={cn("font-medium text-[var(--cx-glass-text)]", flashFor(live, false))}>
                {fmt(live.value)}
              </span>
              learning
            </span>
          </span>
        </span>
      );
    }
  }
}

/** A game's art: a picture, letter tiles with a little lip like a board game's, or a glyph, on a glowing tile. */
function GameArtTile({ art }: { art: GameArt }) {
  return (
    <span className="relative grid size-[56px] shrink-0 place-items-center overflow-hidden rounded-md bg-[radial-gradient(circle_at_50%_40%,rgba(var(--hue-rgb),.42),rgba(var(--hue-rgb),.08)_72%)] ring-1 ring-[var(--hue-line)]">
      {art.kind === "image" && <Image src={art.src} alt="" fill sizes="56px" className="object-contain p-[6px]" />}
      {art.kind === "letters" && (
        <span className="grid grid-cols-2 gap-[3px]">
          {[...art.letters].slice(0, 4).map((letter, i) => (
            <span
              key={i}
              className="grid size-[20px] place-items-center rounded-[5px] bg-[var(--hue)] text-xs leading-none font-medium text-[var(--hue-on)] shadow-[0_2px_0_rgba(0,0,0,.4)]"
            >
              {letter}
            </span>
          ))}
        </span>
      )}
      {art.kind === "icon" && <Icon name={art.icon} size={30} tone="current" className="text-[var(--hue-ink)]" />}
    </span>
  );
}

/** First place wears the crown; the rest their number. */
function RankBadge({ rank }: { rank: number }) {
  return rank === 0 ? (
    <span className="grid size-[20px] shrink-0 place-items-center rounded-full bg-[var(--hue)]">
      <Icon name="crown" size={12} tone="current" className="text-[var(--hue-on)]" />
    </span>
  ) : (
    <span className="grid size-[20px] shrink-0 place-items-center rounded-full text-xs leading-none text-[var(--cx-glass-text-2)] tabular-nums ring-1 ring-white/20">
      {rank + 1}
    </span>
  );
}

/** The round's clock: seconds left, in a ring that drains. */
function Countdown({ seconds }: { seconds: number }) {
  const r = 14;
  const length = 2 * Math.PI * r;
  return (
    <span className="flex items-center gap-1 text-xs leading-[20px] text-[var(--cx-glass-text-2)]">
      left in round
      <span className="relative grid size-[34px] place-items-center">
        <svg width="34" height="34" viewBox="0 0 34 34" className="absolute inset-0 -rotate-90" aria-hidden="true">
          <circle cx="17" cy="17" r={r} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="2.5" />
          <circle
            cx="17"
            cy="17"
            r={r}
            fill="none"
            stroke="var(--hue)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={length}
            strokeDashoffset={length * (1 - seconds / 60)}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
        </svg>
        <span className="text-xs leading-none font-medium text-[var(--cx-glass-text)] tabular-nums">{seconds}</span>
      </span>
    </span>
  );
}

/** The product's photo on a warm tile, or its glyph if the photo isn't there. */
function ProductImage({ src, icon }: { src: string; icon: IconName }) {
  const [missing, setMissing] = useState(false);
  return (
    <span className="relative grid size-[68px] shrink-0 place-items-center overflow-hidden rounded-md bg-[radial-gradient(circle_at_50%_35%,rgba(var(--hue-rgb),.35),rgba(var(--hue-rgb),.08)_70%)]">
      {missing ? (
        <Icon name={icon} size={32} tone="current" className="text-[var(--hue-ink)]" />
      ) : (
        <Image src={src} alt="" fill sizes="68px" className="object-contain p-[6px]" onError={() => setMissing(true)} />
      )}
    </span>
  );
}
