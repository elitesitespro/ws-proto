import Image from "next/image";
import type { CSSProperties } from "react";
import { Icon } from "@/components/icon";
import { face, type PersonId } from "./people";
import s from "../platform-still.module.css";
import own from "./worldspace-still.module.css";

// Who's in the room, and where each sits on the helmet's orbit (% across, % down)
const ORBIT: readonly (readonly [PersonId, number, number])[] = [
  ["mei", 10, 62],
  ["amara", 86, 34],
  ["ravi", 70, 84],
];
const POLL = [
  ["Beach day", "41%", false],
  ["Film night", "57%", true],
] as const;

/** WorldSpace on a phone: a live Space Voice room in orbit round the helmet, and Tunde's poll. */
export function WorldspaceStill() {
  return (
    <div
      className={s.still}
      role="img"
      aria-label="WorldSpace: Mei hosting a live room, Creative club, with 128 listening, and Tunde’s poll about Sunday plans"
    >
      <div className={`${s.card} ${own.room} ${s.grow}`}>
        <span className={own.orbit}>
          <i className={own.path} />
          <Image className={own.helmet} src="/assets/worldspace/helmet.webp" alt="" fill sizes="(max-width: 600px) 45vw, 320px" />
          {ORBIT.map(([id, x, y]) => (
            <Image
              key={id}
              className={`${s.face} ${own.rider}`}
              data-ring=""
              data-small=""
              style={{ left: `${x}%`, top: `${y}%` }}
              src={face(id)}
              alt=""
              width={28}
              height={28}
            />
          ))}
        </span>
        <span className={s.stack}>
          <span className={`${s.row} ${s.eyebrow}`}>
            <span className={`${s.tag} ${s.live}`}>Live</span>
            Space Voice
          </span>
          <span className={s.title}>Creative club</span>
          <span className={s.meta}>Mei is hosting · 128 listening</span>
        </span>
      </div>
      <div className={s.card} data-tight="">
        <div className={s.row}>
          <Image className={s.face} src={face("tunde")} alt="" width={40} height={40} />
          <span className={`${s.stack} ${s.fill}`}>
            <span className={s.meta}>Tunde · 18 minutes ago</span>
            <span className={s.lead}>Sunday plans?</span>
          </span>
          <span className={`${s.row} ${s.hue}`}>
            <Icon name="heart" size={20} tone="current" />
            64
          </span>
        </div>
        {POLL.map(([answer, share, ahead]) => (
          <span key={answer} className={s.meter} data-on={ahead ? "" : undefined} style={{ "--at": share } as CSSProperties}>
            <span className={ahead ? s.name : undefined}>{answer}</span>
            <span className={`${s.name} tabular-nums`}>{share}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
