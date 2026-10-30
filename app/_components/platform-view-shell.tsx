import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import { buttonVariants } from "@/components/ui/button";
import {
  hueAttrs,
  platformDetails,
  type ShowcasePlatformName,
} from "./platform-showcase-content";
import { SceneFit } from "./scene-fit";
import styles from "./platform-views.module.css";

// The platform's name where it isn't its key (the products' own
// spellings), for the way in and the preview's label
const exploreLabel: Partial<Record<ShowcasePlatformName, string>> = {
  XStream: "Xtream",
  Vsion: "Vision",
  WorkWorld: "Worldwork",
};
// The small print beside the way in, where the platform needs some: the
// trading ones carry their risk (care and Prediction say theirs in the
// scene). Short, so it stays one line beside the button on a phone.
const footnote: Partial<Record<ShowcasePlatformName, string>> = {
  Forex: "Capital at risk",
  Crypto: "Capital at risk",
  WorldSports: "Illustrative · 18+",
};

export function PlatformViewShell({
  name,
  eyebrow,
  title,
  children,
  glass,
}: {
  name: ShowcasePlatformName;
  /** A line above the title: the platform's own mark and name, say. */
  eyebrow?: ReactNode;
  title: ReactNode;
  children: ReactNode;
  /** The tone of the liquid glass in this view: light over a pastel fill or
   *  a map, dark over a film still or a night scene. Pieces can still set
   *  their own (a name tag over a photo is dark glass on a light view). */
  glass?: "light" | "dark";
}) {
  const detail = platformDetails[name];
  const label = exploreLabel[name] ?? name;
  // The preview wears its platform's colour (the same one its timeline stop
  // is filled with): read var(--hue) and its family inside.
  const hue = hueAttrs(name);
  return (
    <article
      className={`${styles.view} ${styles.composition} ${styles[name.replaceAll(" ", "")]} ${glass ? `cx-glass-${glass}` : ""}`}
      aria-label={`${label} platform preview`}
      data-hue={hue["data-hue"]}
      style={hue.style}
    >
      <header className={styles.intro}>
        {eyebrow && <div className={styles.eyebrow}>{eyebrow}</div>}
        <h3>{title}</h3>
        <p>{detail.description}</p>
      </header>
      <SceneFit className={styles.scene}>{children}</SceneFit>
      <footer className={styles.footer}>
        {detail.href ? (
          <a
            href={detail.href}
            target={detail.href.startsWith("https") ? "_blank" : undefined}
            rel={detail.href.startsWith("https") ? "noreferrer" : undefined}
            className={`${buttonVariants({ size: "lg" })} ${styles.link}`}
          >
            Explore {label}
            <Icon name="arrow-up-right" size={20} tone="current" />
          </a>
        ) : (
          // Not open yet: no way in, so it says when instead
          <p className={`${buttonVariants({ size: "lg", variant: "outline" })} ${styles.link} ${styles.soon}`}>
            <Icon name="hourglass" size={20} tone="current" />
            Coming soon
          </p>
        )}
        <span>
          {footnote[name] ?? "Sample preview"}
        </span>
      </footer>
    </article>
  );
}
