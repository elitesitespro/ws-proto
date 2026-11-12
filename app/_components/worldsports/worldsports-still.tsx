import Image from "next/image";
import { drift, StillChart } from "../still-chart";
import s from "../platform-still.module.css";

// D. Adeyemi's share over the last fortnight (illustrative, as in the demo)
const FORTNIGHT = drift(23, 28, 1161, 1240, 0.3);

/** WorldSports on a phone: one player's share, its fortnight, and what you hold of it. */
export function WorldsportsStill() {
  return (
    <div
      className={s.still}
      role="img"
      aria-label="WorldSports: a share in D. Adeyemi at ₦1,240, up 6.8% this fortnight. You own 12, worth ₦14,880"
    >
      <div className={`${s.card} ${s.grow}`}>
        <div className={s.row}>
          <Image className={s.face} data-ring="" src="/assets/sports/player-adeyemi.webp" alt="" width={40} height={40} />
          <span className={`${s.stack} ${s.fill}`}>
            <span className={s.name}>D. Adeyemi</span>
            <span className={`${s.meta} ${s.clip}`}>Forward · Harbour City FC</span>
          </span>
          <span className={`${s.stack} ${s.end}`}>
            <span className={s.figure}>₦1,240</span>
            <span className={`${s.tag} ${s.gain}`}>+6.8%</span>
          </span>
        </div>
        <StillChart values={FORTNIGHT} ticks={["A fortnight ago", "Last week", "Today"]} />
      </div>
      <div className={s.split}>
        <span className={s.cell}>
          <span className={s.meta}>You own</span>
          <span className={`${s.name} tabular-nums`}>12 shares</span>
        </span>
        <span className={s.cell}>
          <span className={s.meta}>Worth</span>
          <span className={`${s.name} tabular-nums`}>₦14,880</span>
        </span>
        <span className={s.cell}>
          <span className={s.meta}>Up</span>
          <span className={`${s.name} ${s.gain} tabular-nums`}>₦948</span>
        </span>
      </div>
    </div>
  );
}
