import { useId, type ReactNode } from "react";
import styles from "./dashboard-preview.module.css";

// Drawings for the dashboard preview, after worldstreet-hub's own
// (components/home/promo/illustrations.tsx and components/money/Flag.tsx).

/** The WorldStreet W (components/system/BrandMark in the hub): two polygons, 435 by 246. */
const W = (
  <>
    <polygon points="0,0 159.68,0 217.66,102.5 139.01,245.73" />
    <polygon points="435.32,0 275.64,0 217.66,102.5 296.32,245.73" />
  </>
);

/** The W, `width` across, centred on (x, y). */
function Mark({ x, y, width, fill }: { x: number; y: number; width: number; fill?: string }) {
  const k = width / 435.32;
  return (
    <g transform={`translate(${x - width / 2} ${y - (245.73 * k) / 2}) scale(${k})`} fill={fill}>
      {W}
    </g>
  );
}

/** The W on its own, for the sidebar's logo. */
export function WorldStreetMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 435.32 245.73" aria-hidden="true" focusable="false" fill="currentColor">
      {W}
    </svg>
  );
}

const GOLD = "#FACC15";
const AMBER = "#F59E0B";
const AMBER_LO = "#D97706";
const AMBER_DEEP = "#B45309";
const BROWN = "#422006";
const CREAM = "#FFFBEB";

/** A Kash coin: its edge, its rim with a light outline, its face, an inner ring and the W. */
function Coin({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <>
      <circle cx={x} cy={y + r * 0.12} r={r} fill={AMBER_DEEP} stroke={CREAM} strokeWidth="2.6" />
      <circle cx={x} cy={y} r={r} fill={AMBER_LO} stroke={CREAM} strokeWidth="2.6" />
      <circle cx={x} cy={y} r={r * 0.8} fill={AMBER} />
      <circle cx={x} cy={y} r={r * 0.66} fill="none" stroke={GOLD} strokeWidth="1.4" />
      <Mark x={x} y={y} width={r * 0.95} fill={BROWN} />
    </>
  );
}

/** WorldStreet Kash's banner art: two coins and a line going up. The big coin turns now and then. */
export function KashDrawing() {
  return (
    <svg className={styles.drawing} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <g fill="none" stroke={BROWN} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="58,104 80,88 90,94 114,52" />
        <polyline points="102,53 114,52 117,64" />
      </g>
      <circle cx="100" cy="20" r="7" fill={AMBER} stroke={CREAM} strokeWidth="2" />
      <circle cx="18" cy="28" r="5" fill={AMBER} stroke={CREAM} strokeWidth="1.8" />
      <Coin x={74} y={54} r={22} />
      <g className={styles.coinTurn}>
        <Coin x={44} y={76} r={30} />
      </g>
    </svg>
  );
}

/** A small timer that ticks, for Countdown Marketplace's banner. */
export function Timer({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 26" aria-hidden="true" focusable="false">
      <rect x="9.5" y=".5" width="5" height="2.6" rx="1" fill="#D9B26F" />
      <rect x="11" y="2.5" width="2" height="2.5" fill="#D9B26F" />
      <circle cx="12" cy="15" r="9.6" fill="#0C0A09" stroke="#D9B26F" strokeWidth="1.8" />
      <g className={styles.tick}>
        <path d="M12 15V8.6" stroke="#F5F5F4" strokeWidth="1.8" strokeLinecap="round" />
      </g>
      <circle cx="12" cy="15" r="1.5" fill="#F5F5F4" />
    </svg>
  );
}

function Round({ id, children }: { id: string; children: ReactNode }) {
  // A flag can show more than once on the page, so each clip is its own
  const clip = `flag-${id}${useId()}`;
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false" className={styles.flag}>
      <defs>
        <clipPath id={clip}>
          <circle cx="12" cy="12" r="12" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>{children}</g>
    </svg>
  );
}

/** A wallet's round flag, drawn here (the hub loads them from a flag CDN). */
export function Flag({ currency }: { currency: "USD" | "NGN" | "KES" | "GBP" | "EUR" | "GHS" }) {
  switch (currency) {
    case "EUR":
      return (
        <Round id="eur">
          <rect width="24" height="24" fill="#003399" />
          <g fill="#FFCC00">
            {Array.from({ length: 12 }, (_, i) => (
              <circle
                key={i}
                // Rounded, so the server and the browser draw them alike
                cx={(12 + 6.4 * Math.cos((i * Math.PI) / 6)).toFixed(2)}
                cy={(12 + 6.4 * Math.sin((i * Math.PI) / 6)).toFixed(2)}
                r=".95"
              />
            ))}
          </g>
        </Round>
      );
    case "GHS":
      return (
        <Round id="ghs">
          <rect width="24" height="8" fill="#CE1126" />
          <rect y="8" width="24" height="8" fill="#FCD116" />
          <rect y="16" width="24" height="8" fill="#006B3F" />
          <path d="M12 8.6l.95 2.9h3.05l-2.47 1.8.94 2.9L12 14.4l-2.47 1.8.94-2.9-2.47-1.8h3.05Z" fill="#000" />
        </Round>
      );
    case "USD":
      return (
        <Round id="usd">
          <rect width="24" height="24" fill="#fff" />
          {[0, 2, 4, 6, 8, 10, 12].map((i) => (
            <rect key={i} y={(i * 24) / 13} width="24" height={24 / 13} fill="#B22234" />
          ))}
          <rect width="12" height={(24 / 13) * 7} fill="#3C3B6E" />
          <g fill="#fff">
            {[2.4, 6, 9.6].flatMap((x) => [2.6, 6.4, 10.2].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r=".75" />))}
          </g>
        </Round>
      );
    case "NGN":
      return (
        <Round id="ngn">
          <rect width="24" height="24" fill="#fff" />
          <rect width="8" height="24" fill="#008751" />
          <rect x="16" width="8" height="24" fill="#008751" />
        </Round>
      );
    case "KES":
      return (
        <Round id="kes">
          <rect width="24" height="24" fill="#fff" />
          <rect width="24" height="7.2" fill="#000" />
          <rect y="8.4" width="24" height="7.2" fill="#BB0000" />
          <rect y="16.8" width="24" height="7.2" fill="#006600" />
          <ellipse cx="12" cy="12" rx="3" ry="6" fill="#BB0000" stroke="#000" strokeWidth=".8" />
          <rect x="11.4" y="6.6" width="1.2" height="10.8" rx=".6" fill="#fff" />
        </Round>
      );
    case "GBP":
      return (
        <Round id="gbp">
          <rect width="24" height="24" fill="#012169" />
          <path d="M0 0L24 24M24 0L0 24" stroke="#fff" strokeWidth="4.8" />
          <path d="M0 0L24 24M24 0L0 24" stroke="#C8102E" strokeWidth="1.6" />
          <path d="M12 0V24M0 12H24" stroke="#fff" strokeWidth="6.4" />
          <path d="M12 0V24M0 12H24" stroke="#C8102E" strokeWidth="3.6" />
        </Round>
      );
  }
}
