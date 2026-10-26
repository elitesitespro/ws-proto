import Image from "next/image";
import type { ArtProps } from "../street-districts";
import styles from "./lifestyle-art.module.css";

// The high street's four windows, one for each part of everyday life: a thing
// to buy, a trade, a school and a doctor
const WINDOWS = [
  { id: "buy", src: "/assets/worldstore/tote.webp" },
  { id: "trade", src: "/assets/workworld/tailor.webp" },
  { id: "learn", src: "/assets/academy/software-app-development.webp" },
  { id: "doctor", src: "/assets/worldhealth/consultation.webp" },
] as const;

// Worldwork's trades; the tailor is the one nearby
const TRADES = ["barber", "electrician", "tailor", "welder", "mechanic", "plumber"] as const;

/**
 * Lifestyle St's billboard art. By default a high street at dusk whose four
 * windows light up as the car arrives; looking at an exit, that platform's
 * own picture in its own colours. Every layer stays mounted and crossfades.
 */
export function LifestyleArt({ focus, lit }: ArtProps) {
  return (
    <div aria-hidden="true" className={styles.art} data-focus={focus ?? undefined} data-lit={lit || undefined}>
      {/* Life, handled: the high street at dusk */}
      <div className={`${styles.layer} ${styles.street}`}>
        <span className={styles.skyline} />
        <span className={styles.facade} />
        <span className={styles.fascia} />
        <span className={styles.lamp} />
        <span className={styles.kerb} />
        <div className={styles.windows}>
          {WINDOWS.map((pane) => (
            <div key={pane.id} className={styles.window}>
              <div className={styles.pane} data-pane={pane.id}>
                <Image src={pane.src} alt="" fill sizes="(min-width: 1024px) 10vw, 25vw" className={styles.view} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WorldStore: its W on the back wall, two finds on plinths under spotlights */}
      <div className={`${styles.layer} ${styles.store}`}>
        <svg className={styles.storeW} viewBox="0 0 82 56">
          <path d="M40.9 25.2 27.6 49 4 7h26.7l10.2 18.2Z" />
          <path d="M77.9 7 54.3 49 40.9 25.2 51.2 7h26.7Z" />
        </svg>
        <div className={styles.stand} data-item="vase">
          <span className={`${styles.beam} ${styles.spot}`} />
          <div className={styles.find}>
            <Image src="/assets/worldstore/vase.webp" alt="" fill sizes="(min-width: 1024px) 14vw, 40vw" className={styles.cutout} />
          </div>
          <span className={styles.plinth} />
        </div>
        <div className={styles.stand} data-item="perfume">
          <span className={`${styles.beam} ${styles.spot}`} />
          <div className={styles.find}>
            <Image src="/assets/worldstore/perfume.webp" alt="" fill sizes="(min-width: 1024px) 18vw, 50vw" className={styles.cutout} />
          </div>
          <span className={styles.plinth} />
        </div>
        <span className={`${styles.chip} ${styles.held}`}>Payment held until it arrives</span>
      </div>

      {/* Worldwork: the trades in black and white, one of them nearby */}
      <div className={`${styles.layer} ${styles.work}`}>
        <div className={styles.trades}>
          {TRADES.map((trade) => (
            <div key={trade} className={styles.trade} data-near={trade === "tailor" || undefined}>
              <Image src={`/assets/workworld/${trade}.webp`} alt="" fill sizes="(min-width: 1024px) 14vw, 35vw" />
              {trade === "tailor" && <span className={`${styles.chip} ${styles.near}`}>2 km away</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Mastery Academy: a school on its pedestal under a warm light, a certificate leaning on it */}
      <div className={`${styles.layer} ${styles.school}`}>
        <div className={styles.piece}>
          <Image
            src="/assets/academy/digital-business-remote-careers.webp"
            alt=""
            fill
            sizes="(min-width: 1024px) 55vw, 100vw"
          />
        </div>
        <span className={`${styles.beam} ${styles.warmth}`} />
        <div className={styles.cert}>
          <Image src="/assets/academy/mark.webp" alt="" width={48} height={27} className={styles.certMark} />
          <span className={styles.certLines} />
          <span className={styles.seal} />
        </div>
      </div>

      {/* WorldHealth: a doctor on a calm video call */}
      <div className={`${styles.layer} ${styles.health}`}>
        <span className={styles.halo} />
        <div className={styles.call}>
          <Image
            src="/assets/worldhealth/consultation.webp"
            alt=""
            fill
            sizes="(min-width: 1024px) 30vw, 90vw"
            className={styles.feed}
          />
          <Image src="/assets/worldhealth/mark.svg" alt="" width={28} height={28} unoptimized className={styles.healthMark} />
          <span className={`${styles.chip} ${styles.doctor}`}>Dr Funmi Adebayo</span>
        </div>
      </div>
    </div>
  );
}
