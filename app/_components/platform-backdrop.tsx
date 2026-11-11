import { memo, type CSSProperties } from "react";
import { WorkworldMapBackground } from "./workworld-map-background";
import styles from "./platform-backdrop.module.css";

// WorldSpace's sky: the same stars on every visit (a seeded sequence), in
// three depths, faint and small to near and bright; the nearest twinkle,
// each on its own beat
const STARS = (() => {
  let seed = 7;
  const next = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: 180 }, (_, index) => {
    const depth = index < 120 ? 0 : index < 162 ? 1 : 2;
    return {
      x: `${(next() * 100).toFixed(2)}%`,
      y: `${(next() * 100).toFixed(2)}%`,
      r: [0.6, 1, 1.6][depth],
      opacity: [0.35, 0.65, 1][depth],
      beat:
        depth === 2
          ? ({ "--t": `${(3 + next() * 2.5).toFixed(2)}s`, "--d": `${(next() * -4).toFixed(2)}s` } as CSSProperties)
          : undefined,
    };
  });
})();

// Memoised, like the page it sits behind (platform-view.tsx): the dial passing doesn't draw it again
export const PlatformBackdrop = memo(function PlatformBackdrop({ name }: { name: string }) {
  if (name === "WorkWorld") return <WorkworldMapBackground />;
  // Every platform has one; a platform without its own class in the CSS
  // shows the section's fill
  return (
    <div
      key={name}
      aria-hidden="true"
      className={`${styles.backdrop} ${styles[name.replaceAll(" ", "")] ?? ""}`}
    >
      {name === "WorldSpace" && (
        <>
          {/* The still stars, painted once */}
          <svg className={styles.sky}>
            {STARS.map((star, index) =>
              star.beat ? null : <circle key={index} cx={star.x} cy={star.y} r={star.r} opacity={star.opacity} />,
            )}
          </svg>
          {/* The nearest, which twinkle: each a dot of its own, so the
              browser fades it on the GPU, instead of restyling and
              repainting the whole sky every frame as it did when they were
              circles in it */}
          {STARS.map((star, index) =>
            star.beat ? (
              <i
                key={index}
                className={styles.twinkle}
                style={{ ...star.beat, left: star.x, top: star.y, width: star.r * 2, height: star.r * 2 }}
              />
            ) : null,
          )}
        </>
      )}
      {name === "XStream" && (
        <div className={styles.signal}>
          <i />
          <i />
          <i />
        </div>
      )}
      {name === "Crypto" && <div className={styles.cryptoSky} />}
      <div className={styles.shade} />
    </div>
  );
});
