import Image from "next/image";
import type { CSSProperties } from "react";
import s from "../platform-still.module.css";

/** Mastery Academy on a phone: one of its schools, and a course a quarter done. */
export function AcademyStill() {
  return (
    <div
      className={s.still}
      role="img"
      aria-label="Mastery Academy: the school of trading and financial markets, first of eight, and the Cryptocurrency Trading Masterclass 25% done, on step 2 of 4"
    >
      <div className={`${s.photo} ${s.grow}`}>
        <Image src="/assets/academy/trading-financial-markets.webp" alt="" fill sizes="(max-width: 600px) 100vw, 560px" />
        <span className={s.caption}>
          <span className={s.stack}>
            <span className={s.eyebrow}>School 1 of 8</span>
            <span className={s.title}>Trading &amp; financial markets</span>
          </span>
        </span>
      </div>
      <div className={s.card} data-tight="">
        <div className={s.row}>
          <span className={s.ring} style={{ "--at": "25%" } as CSSProperties}>
            25%
          </span>
          <span className={`${s.stack} ${s.fill}`}>
            <span className={`${s.name} ${s.clip}`}>Cryptocurrency Trading Masterclass</span>
            <span className={s.meta}>Step 2 of 4 · free to start</span>
          </span>
        </div>
        <span className={s.steps}>
          <i data-done="" />
          <i data-now="" />
          <i />
          <i />
        </span>
        <div className={`${s.row} ${s.between} ${s.meta}`}>
          <span>Interest</span>
          <span>Knowledge</span>
          <span>Skill</span>
          <span>Opportunity</span>
        </div>
      </div>
    </div>
  );
}
