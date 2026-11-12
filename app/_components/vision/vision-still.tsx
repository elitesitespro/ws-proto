import Image from "next/image";
import type { CSSProperties } from "react";
import { Icon } from "@/components/icon";
import s from "../platform-still.module.css";
import own from "./vision-still.module.css";

const FRIENDS = ["tobi", "amara", "kemi"] as const;

/** Vision on a phone: tonight's watch party mid-episode, what's up next, and who's watching with you. */
export function VisionStill() {
  return (
    <div
      className={s.still}
      role="img"
      aria-label="A Vision watch party: Lagos After Dark, 41 minutes in, watched in sync with Tobi, Amara and Kemi. Gold Season is up next"
    >
      <div className={`${own.shelf} ${s.grow}`}>
        <span className={s.photo}>
          <Image src="/assets/vision/lagos-after-dark.webp" alt="" fill sizes="(max-width: 600px) 80vw, 480px" />
          <span className={`${s.chip} ${s.pinned} ${s.live}`} data-on="">
            Watch party · in sync
          </span>
          <span className={s.caption}>
            <span className={s.stack}>
              <span className={s.eyebrow}>Original · season 1</span>
              <span className={s.title}>Lagos After Dark</span>
              <span className={s.meta}>Episode 3 · The long night</span>
            </span>
          </span>
        </span>
        <span className={s.photo}>
          <Image src="/assets/vision/gold-season.webp" alt="" fill sizes="(max-width: 600px) 20vw, 120px" />
          <span className={s.caption} data-tight="">
            <span className={s.meta}>Up next</span>
          </span>
        </span>
      </div>
      <div className={s.row}>
        <span className={s.glyph}>
          <Icon name="pause" size={20} tone="current" />
        </span>
        <span className={`${s.bar} ${s.fill}`} style={{ "--at": "70%" } as CSSProperties}>
          <i />
        </span>
        <span className={`${s.meta} tabular-nums`}>41:08 / 58:30</span>
      </div>
      <div className={s.row}>
        <span className={s.faces}>
          {FRIENDS.map((id) => (
            <Image key={id} className={s.face} data-small="" src={`/assets/people/party-${id}.webp`} alt="" width={28} height={28} />
          ))}
        </span>
        <span className={`${s.fill} ${s.clip}`}>
          <span className={`${s.name} ${s.hue}`}>Tobi</span> no way he’s the buyer
        </span>
        <span className={s.meta}>3 watching</span>
      </div>
    </div>
  );
}
