"use client";

import { useRef, useState, type UIEvent } from "react";
import { tick } from "@/lib/haptics";
import { VividGlobe } from "./vivid-globe";
import { VIVID_URL } from "./vivid-links";
import styles from "./vivid-section.module.css";

const PLANS = ["Free", "Pro"] as const;

/**
 * Free and Pro, in the hub's own words (components/vivid/VividSubscriptionBanner.tsx).
 * Side by side where there's room. On a phone they're a row you swipe, under
 * a switch between the two that keeps up with it, the other plan showing at
 * the edge.
 */
export function VividPlans() {
  const rowRef = useRef<HTMLDivElement>(null);
  const [plan, setPlan] = useState(0);
  const pick = (i: number) => {
    setPlan(i);
    const row = rowRef.current;
    const first = row?.firstElementChild as HTMLElement | null;
    const card = row?.children[i] as HTMLElement | undefined;
    if (row && first && card) row.scrollTo({ left: card.offsetLeft - first.offsetLeft, behavior: "smooth" });
  };
  const swiped = (event: UIEvent<HTMLDivElement>) => {
    const row = event.currentTarget;
    const room = row.scrollWidth - row.clientWidth;
    const at = row.scrollLeft > room / 2 ? 1 : 0;
    if (room <= 0 || at === plan) return;
    setPlan(at);
    tick();
  };

  return (
    <div className={styles.plansWrap}>
      <div className={styles.switch} role="group" aria-label="Vivid plans" data-plan={PLANS[plan]}>
        {PLANS.map((name, i) => (
          <button key={name} type="button" aria-pressed={plan === i} onClick={() => pick(i)}>
            {name}
          </button>
        ))}
      </div>
      <div ref={rowRef} className={styles.plans} onScroll={swiped}>
        <article className={styles.plan} data-on={plan === 0 || undefined}>
          <p className={styles.planName}>
            Vivid <span className={styles.badge}>Free</span>
          </p>
          <h3>Your guide</h3>
          <ul>
            <li>Answers any question about WorldStreet</li>
            <li>Shows you where things are</li>
            <li>Explains markets, terms and charts</li>
          </ul>
        </article>
        <article className={`${styles.plan} ${styles.pro}`} data-on={plan === 1 || undefined}>
          <p className={styles.planName}>
            Vivid <span className={styles.badgePro}>Pro</span>
          </p>
          <h3>Works for your money</h3>
          <ul>
            <li>Live crypto and forex prices</li>
            <li>Your full portfolio, in the chat</li>
            <li>Watches that alert you later</li>
            <li>Sends money from a chat, once you say yes</li>
            <li>Talk to it by voice</li>
          </ul>
          <a href={VIVID_URL} target="_blank" rel="noopener" className={styles.voice}>
            <span className={styles.voiceOrb}>
              <i className={styles.breath} />
              <VividGlobe size={56} active />
            </span>
            <span>
              <b>Talk to Vivid</b>
              <small>Press the globe and just talk</small>
            </span>
          </a>
        </article>
      </div>
    </div>
  );
}
