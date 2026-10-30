import styles from "./brand-loader.module.css";

/**
 * The W drawing itself, then back out: the hub's one loading state
 * (worldstreet-hub components/landing/BrandLoader.tsx), so waiting on the
 * landing and waiting in the hub look like the same thing.
 *
 *  block   centred in whatever box contains it, the size the hub's route loader draws it
 *  inline  sized to the text beside it, for a button mid-submit
 */
export function BrandLoader({
  size = "block",
  label = "Loading",
  className,
}: {
  size?: "block" | "inline";
  /** Announced to screen readers; null where something else already says it. */
  label?: string | null;
  className?: string;
}) {
  return (
    <span
      className={[styles.root, styles[size], className].filter(Boolean).join(" ")}
      role={label ? "status" : undefined}
      aria-label={label ?? undefined}
    >
      <svg className={styles.mark} viewBox="0 0 435.32 245.73" aria-hidden="true" focusable="false">
        <path pathLength={1} d="M0 0 L159.68 0 L217.66 102.5 L139.01 245.73 Z" />
        <path pathLength={1} d="M435.32 0 L275.64 0 L217.66 102.5 L296.32 245.73 Z" />
      </svg>
    </span>
  );
}
