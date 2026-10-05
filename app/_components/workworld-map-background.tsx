import styles from "./workworld-map-background.module.css";

export function WorkworldMapBackground({
  active = true,
}: {
  active?: boolean;
}) {
  return (
    <div aria-hidden="true" className={styles.background} data-active={active}>
      <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <path
          d="M-80 640Q280 340 560 480T1280 220"
          fill="none"
          stroke="#b4cec4"
          strokeWidth="96"
        />
        <g fill="none" stroke="#f9f8ef" strokeWidth="24">
          <path d="M-80 120L1280 580M120 -80L600 880M920 -80L680 880M-80 640L1280 180" />
          <path
            d="M-80 360L1280 800M400 -80L880 880M-80 820L1280 360M1160 -80L1000 880"
            strokeWidth="12"
          />
        </g>
      </svg>
    </div>
  );
}
