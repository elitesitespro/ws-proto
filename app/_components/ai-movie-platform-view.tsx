import Image from "next/image";
import { PlatformViewShell } from "./platform-view-shell";
import { AiMovieSet } from "./ai-movie/ai-movie-set";
import styles from "./ai-movie-platform-view.module.css";

/**
 * AI Movie (movie.worldstreetgold.com), in its own night navy and gold: its
 * mark and its line, then a set you can direct (ai-movie/).
 */
export function AiMoviePlatformView() {
  return (
    <PlatformViewShell
      name="AI Movie"
      glass="dark"
      eyebrow={
        <span className={styles.brand}>
          <span className={styles.mark}>
            <Image src="/assets/ai-movie/mark.webp" alt="" width={24} height={14} />
          </span>
          AI Movie
          <span className={styles.when}>Sun 14:30 · Day one on set</span>
        </span>
      }
      title={
        <>
          One studio for every film
          <br />
          you want to{" "}
          <span className={styles.marked}>
            make.
            {/* The gold zigzag under it, as on worldstreetgold.com */}
            <svg aria-hidden="true" viewBox="0 0 120 24" preserveAspectRatio="none" className={styles.stroke}>
              <path d="M3 8 L40 18 L62 9 L84 18 L117 6" pathLength={1} />
            </svg>
          </span>
        </>
      }
    >
      <AiMovieSet />
    </PlatformViewShell>
  );
}
