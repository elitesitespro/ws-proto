import Image from "next/image";
import { WorkworldMapBackground } from "./workworld-map-background";
import styles from "./platform-backdrop.module.css";

export function PlatformBackdrop({ name }: { name: string }) {
  if (name === "WorkWorld") return <WorkworldMapBackground />;
  if (!["Vsion", "Forex", "Arcade", "WorldSpace"].includes(name)) return null;
  return (
    <div
      key={name}
      aria-hidden="true"
      className={`${styles.backdrop} ${styles[name]}`}
    >
      {name === "Vsion" && (
        <Image
          src="/assets/images/dune-0.jpg"
          alt=""
          fill
          sizes="100vw"
          className={styles.film}
        />
      )}
      {name === "WorldSpace" && (
        <div className={styles.collage}>
          {[
            "academy-course.jpg",
            "active-meeting-1.jpg",
            "elena-avatar.jpg",
          ].map((src) => (
            <div key={src}>
              <Image
                src={`/assets/images/${src}`}
                alt=""
                fill
                sizes="(max-width: 1023px) 60vw, 40vw"
              />
            </div>
          ))}
        </div>
      )}
      {name === "Forex" && (
        <svg
          className={styles.chart}
          viewBox="0 0 1200 800"
          preserveAspectRatio="none"
        >
          <path
            d="M0 160H1200M0 320H1200M0 480H1200M0 640H1200M200 0V800M400 0V800M600 0V800M800 0V800M1000 0V800"
            fill="none"
            stroke="currentColor"
            opacity=".12"
          />
          <path
            d="M0 700L80 670L160 710L240 570L320 600L400 520L480 570L560 400L640 460L720 320L800 370L880 240L960 280L1040 160L1120 200L1200 80V800H0Z"
            fill="currentColor"
            opacity=".07"
          />
          <path
            className={styles.chartLine}
            d="M0 700L80 670L160 710L240 570L320 600L400 520L480 570L560 400L640 460L720 320L800 370L880 240L960 280L1040 160L1120 200L1200 80"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            pathLength="1"
          />
        </svg>
      )}
      {name === "Arcade" && (
        <>
          <div className={styles.planet} />
          <div className={styles.stars} />
          <div className={styles.gameFloor} />
        </>
      )}
      <div className={styles.shade} />
    </div>
  );
}
