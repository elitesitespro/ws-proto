import Image from "next/image";
import s from "../platform-still.module.css";
import own from "./xtream-still.module.css";

const ROOMS = [
  ["Zara", "$1,285", "/assets/images/xtream-live.webp"],
  ["Kojo Beats", "$942", "/assets/xtream/kojo.webp"],
] as const;

/** Xtream on a phone: a live battle, two rooms, the clock between them and the gift that just landed. */
export function XtreamStill() {
  return (
    <div
      className={s.still}
      data-on="white"
      role="img"
      aria-label="An Xtream live battle with 43 seconds left: Zara on $1,285 leads Kojo Beats on $942, and a viewer has just sent Zara a $100 crown"
    >
      <div className={`${s.split} ${own.versus} ${s.grow}`}>
        {ROOMS.map(([name, sent, src], i) => (
          <span key={name} className={s.photo} data-ring={i === 0 ? "" : undefined}>
            <Image src={src} alt="" fill sizes="(max-width: 600px) 50vw, 280px" />
            <span className={own.score} data-side={i ? "right" : undefined}>
              <span className={s.name}>{name}</span>
              <span className={s.title}>{sent}</span>
            </span>
            {i === 0 ? (
              <span className={`${s.chip} ${s.pinned} ${s.live}`} data-on="" data-foot="">
                You’re backing
              </span>
            ) : (
              <span className={`${s.chip} ${s.pinned}`} data-foot="">
                Loser sings live
              </span>
            )}
          </span>
        ))}
        <span className={own.clock}>0:43</span>
      </div>
      <span className={own.tug}>
        <i />
      </span>
      <div className={s.row}>
        <Image src="/assets/xtream/gifts/crown.webp" alt="" width={32} height={32} />
        <span className={`${s.stack} ${s.fill}`}>
          <span className={`${s.name} ${s.clip}`}>whale.eth sent Zara a crown</span>
          <span className={s.meta}>Zara leads by $343 · 8.1K watching</span>
        </span>
        <span className={`${s.chip} tabular-nums`} data-on="">
          $100
        </span>
      </div>
    </div>
  );
}
