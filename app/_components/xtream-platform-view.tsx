import Image from "next/image";
import { ArrowUpRight, Eye, Gift, Radio } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import styles from "./xtream-platform-view.module.css";

export function XtreamPlatformView() {
  return (
    <article className={styles.view} aria-label="Xtream live streaming">
      <h3 className={styles.title}>
        <span className="text-lg font-semibold tracking-tight">
          Everyone’s going live on
        </span>
        <span className={styles.wordmark}>Xtream</span>
      </h3>
      <div className={styles.actions}>
        <a
          href="https://xtream.worldstreetgold.com"
          target="_blank"
          rel="noreferrer"
          className={`${buttonVariants({ size: "lg" })} ${styles.primary}`}
        >
          Go live <Radio size={20} aria-hidden="true" />
        </a>
        <a
          href="https://xtream.worldstreetgold.com"
          target="_blank"
          rel="noreferrer"
          className={`${buttonVariants({ size: "lg", variant: "outline" })} ${styles.secondary}`}
        >
          Watch live <ArrowUpRight size={20} aria-hidden="true" />
        </a>
      </div>
      <p className={styles.tagline}>
        <span aria-hidden="true" />
        Every kind of room, live right now
      </p>
      <div className={styles.scene}>
        <div className={styles.gift}>
          <span className={styles.giftIcon}>
            <Gift size={24} aria-hidden="true" />
          </span>
          <p>
            <strong>@kingsley sent a rocket</strong>
            <span>+$4.00 to the host</span>
          </p>
        </div>
        <div className={styles.host}>
          <Image
            src="/assets/images/xtream-live.webp"
            alt="A live host wearing headphones"
            fill
            sizes="(max-width: 600px) 144px, 208px"
            className={styles.photo}
          />
          <div className={styles.badges}>
            <span className={styles.live}>
              <span aria-hidden="true" />
              Live
            </span>
            <span className={styles.viewers}>
              <Eye size={20} aria-hidden="true" />
              2.4k
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
