import Image from "next/image";
import { Icon } from "@/components/icon";
import s from "../platform-still.module.css";

const MORE = ["perfume", "vase", "camry"] as const;

/** WorldStore on a phone: one listing, its seller, its price, and the money held safe. */
export function WorldstoreStill() {
  return (
    <div
      className={s.still}
      role="img"
      aria-label="A WorldStore listing from Ada’s Leather, rated 4.8: a leather tote at ₦45,000, down 20% from ₦56,250, with the payment held until it arrives"
    >
      <div className={`${s.photo} ${s.grow}`}>
        <Image src="/assets/worldstore/tote.webp" alt="" fill sizes="(max-width: 600px) 100vw, 560px" />
        <span className={s.sticker}>−20%</span>
        <span className={`${s.chip} ${s.pinned}`} data-side="right">
          <Icon name="star" size={20} tone="current" />
          Ada’s Leather · 4.8
        </span>
        <span className={s.thumbs}>
          {MORE.map((id) => (
            <Image key={id} src={`/assets/worldstore/${id}.webp`} alt="" width={36} height={36} />
          ))}
        </span>
      </div>
      <div className={`${s.row} ${s.between}`}>
        <span className={s.stack}>
          <span className={s.title}>Leather tote</span>
          <span className={s.meta}>Lekki, Lagos · 3 left</span>
        </span>
        <span className={`${s.stack} ${s.end}`}>
          <span className={`${s.title} ${s.hue} tabular-nums`}>₦45,000</span>
          <span className={`${s.meta} ${s.was} tabular-nums`}>₦56,250</span>
        </span>
      </div>
      <div className={s.note}>
        <span className={s.hue}>
          <Icon name="shield-check" size={20} tone="current" />
        </span>
        Your money is held until it arrives
      </div>
    </div>
  );
}
