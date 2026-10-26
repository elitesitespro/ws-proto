import { VividPlans } from "./vivid-plans";
import { VividSwitchboard } from "./vivid-switchboard";
import styles from "./vivid-section.module.css";

/**
 * Vivid, after the wallet. Thirteen platforms is a lot to keep in your
 * head, so you don't: you ask Vivid, and it shows you where to go. The
 * dashboard's Ask Vivid globe flies down into the middle of a switchboard of
 * real questions and the platforms that answer them, all of it readable at a
 * glance. Then what it does free, and with Pro.
 */
export function VividSection() {
  return (
    <section id="vivid" aria-labelledby="vivid-heading" className={styles.section}>
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <header className={styles.head}>
          <div>
            <p className={styles.eyebrow}>Vivid AI</p>
            <h2
              id="vivid-heading"
              className="text-3xl leading-[1.1] font-normal tracking-[-0.035em] text-balance md:text-4xl lg:text-display-sm"
            >
              You don’t have to remember all thirteen.
            </h2>
          </div>
          <p className={styles.lede}>
            Ask Vivid in plain words. It knows every platform, explains what’s new to you, and shows you where to
            go.
          </p>
        </header>

        <VividSwitchboard />
        <VividPlans />
      </div>
    </section>
  );
}
