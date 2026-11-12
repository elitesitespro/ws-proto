import Image from "next/image";
import { Icon } from "@/components/icon";
import s from "../platform-still.module.css";
import own from "./embassy-still.module.css";

const DONE = ["Passport renewed", "Schengen visa filed", "Flight and hotel held"];

/** E-Embassy on a phone: Lisbon through its arch, the route there, and every step behind it. */
export function EmbassyStill() {
  return (
    <div
      className={`${s.still} ${own.trip}`}
      data-brand="embassy"
      role="img"
      aria-label="E-Embassy: a trip from Lagos to Lisbon, 22 degrees and clear, with the visa approved and every step done"
    >
      <div className={`${s.photo} ${own.arch}`}>
        <Image src="/assets/embassy/lisbon.webp" alt="" fill sizes="(max-width: 600px) 45vw, 300px" />
        <span className={own.weather}>
          <span className={s.meta}>Lisbon now</span>
          <span className={s.title}>22°</span>
          <span className={s.meta}>Clear skies</span>
        </span>
        <span className={own.approved}>
          <Icon name="check-circle" size={20} tone="current" />
          Visa approved
        </span>
      </div>
      <div className={own.plan}>
        <div className={`${s.card} ${own.ticket}`} data-tight="">
          <span className={s.stack}>
            <span className={s.title}>LOS</span>
            <span className={s.meta}>Lagos</span>
          </span>
          <span className={`${own.route} ${s.fill} ${s.hue}`}>
            <Icon name="send" size={20} tone="current" />
          </span>
          <span className={`${s.stack} ${s.end}`}>
            <span className={s.title}>LIS</span>
            <span className={s.meta}>Lisbon</span>
          </span>
        </div>
        {DONE.map((step) => (
          <div key={step} className={s.row}>
            <span className={s.hue}>
              <Icon name="check-circle" size={20} tone="current" />
            </span>
            <span className={`${s.fill} ${s.clip}`}>{step}</span>
          </div>
        ))}
        <span className={s.meta}>Four nights in Alfama · Amaka is your consultant</span>
      </div>
    </div>
  );
}
