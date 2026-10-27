import { memo } from "react";
import { Icon } from "@/components/icon";
import { hueAttrs, platformDetails, type ShowcasePlatformName } from "../platform-showcase-content";
import { platforms } from "../platform-timeline-section";
import type { Exit } from "./street-districts";
import styles from "./street-section.module.css";

/**
 * A platform's exit off the street: a road sign with its number on a tab, its
 * tile as on the wheel, its name and a few words, out to the platform. It
 * lights once the car has passed it; looking at it puts its platform up on
 * the district's billboard. `now`: it's the one up there (where the car
 * picks it, passing). Only the sign whose state changes renders again.
 */
export const ExitSign = memo(function ExitSign({
  register,
  exit,
  number,
  lit,
  now = false,
  onLook,
}: {
  /** Hears the sign's element, by its number, to lay the street by. */
  register: (number: number, el: HTMLLIElement | null) => void;
  exit: Exit;
  number: number;
  lit: boolean;
  now?: boolean;
  onLook: (name: ShowcasePlatformName | null) => void;
}) {
  const { href } = platformDetails[exit.name];
  const icon = platforms.find((platform) => platform.name === exit.name)?.icon ?? "arrow-up-right";

  return (
    <li ref={(el) => register(number, el)}>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={styles.exit}
        data-lit={lit || undefined}
        data-now={now || undefined}
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
});
