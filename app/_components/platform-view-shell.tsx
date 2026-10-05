import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
  platformDetails,
  type ShowcasePlatformName,
} from "./platform-showcase-content";
import styles from "./platform-views.module.css";

export function PlatformViewShell({
  name,
  title,
  children,
  controls,
  extra,
}: {
  name: ShowcasePlatformName;
  title: ReactNode;
  children: ReactNode;
  controls?: ReactNode;
  extra?: ReactNode;
}) {
  const detail = platformDetails[name];
  return (
    <article
      className={`${styles.view} ${styles.composition} ${styles[name.replaceAll(" ", "")]}`}
      aria-label={`${name} platform preview`}
    >
      <header className={styles.intro}>
        <h3>{title}</h3>
        <p>{detail.description}</p>
      </header>
      {controls && <div className={styles.tabs}>{controls}</div>}
      <div className={styles.scene}>{children}</div>
      {extra && <div className={styles.extras}>{extra}</div>}
      <footer className={styles.footer}>
        <a
          href={detail.href}
          target={detail.href.startsWith("https") ? "_blank" : undefined}
          rel={detail.href.startsWith("https") ? "noreferrer" : undefined}
          className={`${buttonVariants({ size: "lg" })} ${styles.link}`}
        >
          Explore{" "}
          {name === "AI Movie"
            ? "studio"
            : name === "WorldHealth"
              ? "care"
              : name}
          <ArrowUpRight size={20} aria-hidden="true" />
        </a>
        <span>
          {name === "WorldHealth" ? "Not for emergencies" : "Sample preview"}
        </span>
      </footer>
    </article>
  );
}

export function Portrait({
  src,
  name,
  className = "",
}: {
  src: string;
  name: string;
  className?: string;
}) {
  return (
    <div className={`${styles.portrait} ${className}`}>
      <Image
        src={`/assets/images/${src}`}
        alt={name}
        fill
        sizes="(max-width: 600px) 144px, 320px"
        className={styles.cover}
      />
      <span>{name}</span>
    </div>
  );
}

export function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className={styles.stat}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export function Sparkline({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`${styles.sparkline} ${className}`}
      viewBox="0 0 480 120"
      preserveAspectRatio="none"
      role="img"
      aria-label="Illustrative upward price movement"
    >
      <path
        d="M0 32H480M0 72H480M0 112H480"
        stroke="currentColor"
        opacity=".1"
      />
      <path
        className={styles.draw}
        d="M0 102 L20 96 L40 100 L60 80 L80 88 L100 65 L120 71 L140 60 L160 70 L180 54 L200 65 L220 44 L240 58 L260 36 L280 43 L300 25 L320 39 L340 18 L360 26 L380 10 L400 24 L420 9 L440 18 L460 5 L480 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        vectorEffect="non-scaling-stroke"
        pathLength="1"
      />
    </svg>
  );
}
