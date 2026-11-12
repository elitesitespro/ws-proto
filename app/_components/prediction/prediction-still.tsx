import type { CSSProperties } from "react";
import { Icon } from "@/components/icon";
import { StillChart } from "../still-chart";
import s from "../platform-still.module.css";
import own from "./prediction-still.module.css";

// The crowd's chance of yes over the last week (illustrative, as in the demo)
const WEEK = [49, 50, 49, 51, 52, 51, 53, 52, 54, 53, 55, 54, 53, 55, 56, 55, 57, 56, 55, 57, 58, 57, 56, 58, 59, 58, 57, 58];

/** Prediction Market on a phone: one question, the crowd's week on it, and what each side pays. */
export function PredictionStill() {
  return (
    <div
      className={s.still}
      data-on="white"
      role="img"
      aria-label="Prediction Market: will the Super Eagles beat Cameroon on Saturday? The crowd says 58% yes, up 3 today. Yes pays 1.72 times, no pays 2.38 times"
    >
      <div className={`${s.card} ${s.grow}`}>
        <div className={`${s.row} ${s.between}`}>
          <span className={`${s.row} ${s.eyebrow}`}>
            <Icon name="trophy" size={20} tone="current" />
            Sport · 3,412 calls
          </span>
          <span className={s.meta}>Closes Sat 17:00</span>
        </div>
        <p className={s.lead}>Will the Super Eagles beat Cameroon on Saturday?</p>
        <div className={s.row}>
          <span className={s.figure}>58%</span>
          <span className={s.meta}>chance of yes</span>
          <span className={`${s.tag} ${s.gain}`}>+3 today</span>
        </div>
        <StillChart values={WEEK} mark={{ at: 50, label: "Even odds" }} />
      </div>
      <div className={own.odds} style={{ "--yes": "58fr", "--no": "42fr" } as CSSProperties}>
        <span className={s.cell} data-on="">
          <span className={s.meta}>Yes · pays 1.72×</span>
          <span className={`${s.lead} tabular-nums`}>58%</span>
        </span>
        <span className={s.cell}>
          <span className={s.meta}>No · pays 2.38×</span>
          <span className={`${s.lead} tabular-nums`}>42%</span>
        </span>
      </div>
    </div>
  );
}
