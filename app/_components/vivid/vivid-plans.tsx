import { Icon } from "@/components/icon";
import { HUB } from "@/lib/hub";
import { VividGlobe } from "./vivid-globe";
import styles from "./vivid-section.module.css";

// What each does, in the hub's own words (components/vivid/
// VividSubscriptionBanner.tsx), and no more: Free answers, explains and shows
// you where things are; Pro adds what works for your money. Vivid never
// trades, and never says what to buy or sell.
const BOTH = ["Answers any question about WorldStreet", "Shows you where things are", "Explains markets, terms and charts"];
const PRO_ONLY = [
  "Live crypto and forex prices",
  "Your whole portfolio, in the chat",
  "Price alerts that tell you the moment",
  "Sends money from a chat, once you say yes",
  "Talk to it by voice",
];

function Yes({ pro = false }: { pro?: boolean }) {
  return (
    <span className={pro ? styles.yesPro : styles.yes}>
      <Icon name="check" size={pro ? 16 : 14} tone="current" />
      <span className="sr-only">Yes</span>
    </span>
  );
}

/**
 * Free and Pro, side by side as one table, on a phone as well (nothing to
 * swipe): what Free does, then everything Pro adds, ticked only in Pro's
 * column, which is lit gold. Pro's way in under it.
 */
export function VividPlans() {
  return (
    <div data-plans className={styles.plansWrap}>
      <div className={styles.plansHead}>
        <p className={styles.eyebrow}>Free and Pro</p>
        <h3 className={styles.plansTitle}>
          Free shows you around. <span>Pro works for your money.</span>
        </h3>
        <a href={`${HUB}/register`} target="_blank" rel="noopener" className={styles.getPro}>
          Get Vivid Pro
          <Icon name="arrow-up-right" size={20} tone="current" />
        </a>
        <p className={styles.plansNote}>Free comes with every WorldStreet account.</p>
      </div>

      <table className={styles.compare}>
        <caption className="sr-only">What Vivid Free and Vivid Pro do</caption>
        <thead>
          <tr>
            <td />
            <th scope="col" className={styles.colFree}>
              Free
            </th>
            <th scope="col" className={styles.colPro}>
              <span className={styles.proHead}>
                <VividGlobe size={22} />
                <span className={styles.badgePro}>Pro</span>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {BOTH.map((what) => (
            <tr key={what}>
              <th scope="row">{what}</th>
              <td>
                <Yes />
              </td>
              <td className={styles.cellPro}>
                <Yes pro />
              </td>
            </tr>
          ))}
        </tbody>
        <tbody>
          <tr className={styles.plus}>
            <th scope="rowgroup" colSpan={2}>
              Everything in Free, plus
            </th>
            <td className={styles.cellPro} />
          </tr>
          {PRO_ONLY.map((what) => (
            <tr key={what} className={styles.proRow}>
              <th scope="row">{what}</th>
              <td>
                <span className={styles.no}>
                  <Icon name="minus" size={14} tone="current" />
                  <span className="sr-only">Not in Free</span>
                </span>
              </td>
              <td className={styles.cellPro}>
                <Yes pro />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className={styles.fineprint}>Vivid AI can make mistakes, so check anything important.</p>
    </div>
  );
}
