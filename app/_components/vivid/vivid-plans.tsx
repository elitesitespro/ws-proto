import { VividGlobe } from "./vivid-globe";
import { VIVID_URL } from "./vivid-links";
import styles from "./vivid-section.module.css";

/**
 * Free and Pro, in the hub's own words (components/vivid/VividSubscriptionBanner.tsx),
 * side by side, on a phone as well: two short lists read together, nothing
 * to swipe to.
 */
export function VividPlans() {
  return (
    <div className={styles.plansWrap}>
      <div className={styles.plans}>
        <article className={styles.plan}>
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
        <article className={`${styles.plan} ${styles.pro}`}>
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
