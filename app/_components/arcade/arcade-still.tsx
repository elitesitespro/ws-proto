import Image from "next/image";
import type { CSSProperties } from "react";
import { Icon } from "@/components/icon";
import s from "../platform-still.module.css";
import own from "./arcade-still.module.css";

/** Arcade on a phone: your place on the board, your streak, and a trivia question answered right. */
export function ArcadeStill() {
  return (
    <div
      className={s.still}
      data-brand="arcade"
      role="img"
      aria-label="Arcade: you are ranked 128, up 14 this week, at level 12 on a 6 day streak, and a trivia question answered right"
    >
      <div className={`${s.card} ${own.rank} ${s.grow}`} data-fill="">
        <div className={own.place}>
          <span className={s.giant}>#128</span>
          <span className={s.stack}>
            <span className={`${s.tag} ${own.climb}`}>
              <Icon name="trending-up" size={20} tone="current" />
              Up 14
            </span>
            <span className={s.meta}>this week</span>
          </span>
        </div>
        <div className={s.stack}>
          <span className={`${s.row} ${s.between} ${own.level}`}>
            <span className={s.name}>Level 12</span>
            <span className={`${s.meta} tabular-nums`}>640 / 1,000 XP</span>
          </span>
          <span className={s.bar} style={{ "--at": "64%" } as CSSProperties}>
            <i />
          </span>
        </div>
        <Image className={own.pad} src="/assets/arcade/controller.webp" alt="" width={104} height={104} />
        <span className={own.streak}>
          <b>6</b>
          day streak
        </span>
      </div>
      <div className={s.card} data-tight="">
        <div className={`${s.row} ${s.between}`}>
          <p className={s.lead}>What does “going long” mean?</p>
          <span className={s.meta}>Trivia duel</span>
        </div>
        <span className={own.answer} data-right="">
          <b>A</b>
          <span className={`${s.name} ${s.fill}`}>Betting the price rises</span>
          <Icon name="check-circle" size={20} tone="current" />
        </span>
        <span className={own.answer}>
          <b>B</b>
          <span className={s.fill}>Selling everything</span>
        </span>
      </div>
    </div>
  );
}
