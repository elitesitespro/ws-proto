import styles from "./globe-scroll-cue.module.css";

/** "Scroll to explore", under the hero copy at the foot of the section. A
 *  hint only: there's nothing to click, the page scrolls as usual. */
export function GlobeScrollCue() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-3 z-10 hidden md:block">
      <div className="mx-auto flex w-full max-w-7xl items-end gap-2 px-6">
        <span className={styles.line} />
        <span className="text-xs leading-[20px] text-muted">Scroll to explore</span>
      </div>
    </div>
  );
}
