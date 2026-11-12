import Image from "next/image";
import { Icon } from "@/components/icon";
import s from "../platform-still.module.css";

const DOCTORS = [
  ["Dr Funmi Adebayo", "Family medicine · Nigeria", "$30", "10:30", "/assets/worldhealth/funmi.webp"],
  ["Dr Ravi Shah", "Family medicine · Kenya", "$28", "11:00", "/assets/people/doc-ravi.webp"],
] as const;

/** WorldHealth on a phone: a video consultation booked, and who's free soonest. */
export function WorldhealthStill() {
  return (
    <div
      className={s.still}
      data-brand="health"
      role="img"
      aria-label="WorldHealth: a video consultation with Dr Funmi Adebayo today at 10:30 for $30, and Dr Ravi Shah free at 11:00"
    >
      <div className={`${s.photo} ${s.grow}`}>
        <Image src="/assets/worldhealth/consultation.webp" alt="" fill sizes="(max-width: 600px) 100vw, 560px" />
        <span className={`${s.chip} ${s.pinned}`} data-on="">
          <Icon name="video" size={20} tone="current" />
          Video · today 10:30
        </span>
        <span className={s.caption}>
          <span>
            <span className={s.name}>Vivid</span> A family doctor is a good place to start.
          </span>
        </span>
      </div>
      <div className={s.card} data-tight="">
        {DOCTORS.map(([name, field, rate, next, src], i) => (
          <div key={name} className={`${s.row} ${i ? "" : s.picked}`}>
            <Image className={s.face} src={src} alt="" width={40} height={40} />
            <span className={`${s.stack} ${s.fill}`}>
              <span className={s.row}>
                <span className={`${s.name} ${s.clip}`}>{name}</span>
                <span className={s.hue}>
                  <Icon name="badge-check" size={20} tone="current" />
                </span>
              </span>
              <span className={`${s.meta} ${s.clip}`}>{field}</span>
            </span>
            <span className={`${s.stack} ${s.end}`}>
              <span className={`${s.name} tabular-nums`}>{rate}</span>
              <span className={`${s.meta} tabular-nums`}>{i ? `Next ${next}` : `Booked ${next}`}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
