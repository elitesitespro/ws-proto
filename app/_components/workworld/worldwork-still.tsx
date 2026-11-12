import Image from "next/image";
import { Icon } from "@/components/icon";
import s from "../platform-still.module.css";
import own from "./worldwork-still.module.css";

const NEAR = [
  ["0.6", "Tunde Welding Works", "4.8"],
  ["1.4", "Ifeanyi Metal & Gates", "4.6"],
  ["1.9", "Kola Iron Doors", "4.7"],
] as const;

/** Worldwork on a phone: the welders near you, closest first, and what a customer said of the nearest. */
export function WorldworkStill() {
  return (
    <div
      className={s.still}
      data-brand="work"
      role="img"
      aria-label="Worldwork: three welders near you. The closest, Tunde Welding Works, is 0.6 km away and rated 4.8"
    >
      <div className={`${s.photo} ${s.grow}`} data-short="">
        <Image src="/assets/workworld/welder.webp" alt="" fill sizes="(max-width: 600px) 100vw, 560px" />
        <span className={`${s.chip} ${s.pinned}`}>
          <Icon name="map-pin" size={20} tone="current" />
          Welders near you
        </span>
        <span className={s.caption}>
          <span className={s.name}>“He showed up in twenty minutes and fixed it on the spot.”</span>
        </span>
      </div>
      {NEAR.map(([away, name, rating], i) => (
        <div key={name} className={`${s.row} ${i ? s.rule : ""}`}>
          <span className={`${own.away} ${i ? s.dim : ""}`}>
            <span className={s.title}>{away}</span> km
          </span>
          <span className={`${s.name} ${s.fill} ${s.clip}`}>{name}</span>
          <span className={`${s.row} ${s.meta} tabular-nums`}>
            <Icon name="star" size={20} tone="current" />
            {rating}
          </span>
        </div>
      ))}
    </div>
  );
}
