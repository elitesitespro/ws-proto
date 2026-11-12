import Image from "next/image";
import { Icon } from "@/components/icon";
import s from "../platform-still.module.css";

const ON_CALL = [
  ["Mum", "Lagos", "/assets/people/meet-mum.webp"],
  ["Tunde", "Toronto", "/assets/people/meet-tunde.webp"],
  ["Ravi", "Nairobi", "/assets/people/meet-ravi.webp"],
] as const;

/** WorldMeet on a phone: the Sunday call, three cities on it, Mum speaking and captioned live. */
export function WorldmeetStill() {
  return (
    <div
      className={s.still}
      role="img"
      aria-label="A WorldMeet family call with Mum in Lagos, Tunde in Toronto and Ravi in Nairobi. Mum is speaking, captioned live in English"
    >
      <div className={`${s.card} ${s.grow}`}>
        <div className={s.row}>
          <span className={`${s.chip} ${s.live}`} data-on="">
            Live
          </span>
          <span className={`${s.name} ${s.fill} ${s.clip}`}>Sunday family call</span>
          <span className={`${s.meta} tabular-nums`}>12:05</span>
        </div>
        <div className={`${s.split} ${s.grow}`}>
          {ON_CALL.map(([name, city, src], i) => (
            <span key={name} className={s.photo} data-ring={i === 0 ? "" : undefined}>
              <Image src={src} alt="" fill sizes="(max-width: 600px) 33vw, 180px" />
              <span className={s.caption} data-tight="">
                <span className={s.stack}>
                  <span className={s.name}>{name}</span>
                  <span className={s.meta}>{city}</span>
                </span>
                {i === 0 && (
                  <span className={s.hue}>
                    <Icon name="audio-lines" size={20} tone="current" />
                  </span>
                )}
              </span>
            </span>
          ))}
        </div>
        <div className={s.note}>
          <span className={s.hue}>
            <Icon name="captions" size={20} tone="current" />
          </span>
          <span className={`${s.stack} ${s.fill}`}>
            <span className={s.meta}>Mum · captioned in English, Pidgin and French</span>
            <span className={s.name}>Can everyone hear me?</span>
          </span>
        </div>
      </div>
    </div>
  );
}
