import type { CSSProperties, Ref } from "react";
import { Icon } from "@/components/icon";
import { hueAttrs, platformDetails, type ShowcasePlatformName } from "../platform-showcase-content";
import { platforms } from "../platform-timeline-section";
import type { Exit } from "./street-districts";
import styles from "./street-section.module.css";

/**
 * A platform's exit off the street: a road sign with its number on a tab, its
 * tile as on the wheel, its name and a few words, out to the platform. It
 * lights once the car has passed it; looking at it puts its platform up on
 * the district's billboard.
 */
export function ExitSign({
  ref,
  exit,
  number,
  order,
  lit,
  onLook,
}: {
  ref?: Ref<HTMLLIElement>;
  exit: Exit;
  number: number;
  /** Its place among its district's exits: where they're side by side, they light in turn. */
  order: number;
  lit: boolean;
  onLook: (name: ShowcasePlatformName | null) => void;
}) {
  const { href } = platformDetails[exit.name];
  const icon = platforms.find((platform) => platform.name === exit.name)?.icon ?? "arrow-up-right";

  return (
    <li ref={ref} style={{ "--order": order } as CSSProperties}>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={styles.exit}
        data-lit={lit || undefined}
        {...hueAttrs(exit.name)}
        onMouseEnter={() => onLook(exit.name)}
        onMouseLeave={() => onLook(null)}
        onFocus={() => onLook(exit.name)}
        onBlur={() => onLook(null)}
      >
        <span className={styles.exitNumber}>Exit {number}</span>
        <span className={styles.exitTile}>
          <Icon name={icon} size={20} tone="current" />
        </span>
        <span className={styles.exitText}>
          <b>{exit.label}</b>
          <small>{exit.hook}</small>
        </span>
        <Icon name="arrow-up-right" size={20} tone="current" className={styles.exitGo} />
      </a>
    </li>
  );
}
