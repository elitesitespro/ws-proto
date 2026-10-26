import type { CSSProperties } from "react";
import Image from "next/image";
import { Icon } from "@/components/icon";
import type { ArtProps } from "../street-districts";
import styles from "./entertainment-art.module.css";

const vars = (v: Record<string, string | number>) => v as CSSProperties;

// Tonight's wall: Vision's originals (its art), five staggered columns
const WALL = [
  ["danfo", "third-mainland", "market-women"],
  ["bull-run", "night-shift", "gold-season"],
  ["the-floor", "lagos-after-dark", "danfo"],
  ["gold-season", "the-floor", "bull-run"],
  ["third-mainland", "market-women", "night-shift"],
];

// The bulbs round the lightbox, in the order they come on: along the top,
// down the right, back along the bottom and up the left
const at = (n: number) => Math.round(n * 100) / 100;
const BULBS: readonly (readonly [number, number])[] = [
  ...[0, 1, 2, 3, 4, 5].map((i) => [i * 20, 0] as const),
  ...[1, 2, 3, 4, 5, 6, 7, 8].map((i) => [100, at((i * 100) / 9)] as const),
  ...[5, 4, 3, 2, 1, 0].map((i) => [i * 20, 100] as const),
  ...[8, 7, 6, 5, 4, 3, 2, 1].map((i) => [0, at((i * 100) / 9)] as const),
];

// The room from the back row: heads against the foot of the screen (where
// they sit and how wide, as a share of the screen; two friends leaning in)
const SEATS = [
  { x: -2, w: 16, drop: 6 },
  { x: 13, w: 14, drop: 2, lean: 7 },
  { x: 25, w: 14, drop: 4, lean: -6 },
  { x: 45, w: 17, drop: 9 },
  { x: 63, w: 14, drop: 3 },
  { x: 79, w: 16, drop: 7, lean: -3 },
];

// The room backing the battle: Xtream's gifts (Noto's animated emoji), and
// a crown on the leader
const GIFTS = [
  { id: "crown", x: 92, y: -2, size: 15, turn: 16 },
  { id: "fire", x: 40, y: 86, size: 12, turn: -12 },
  { id: "heart", x: 16, y: 96, size: 9, turn: 10 },
  { id: "rocket", x: 76, y: 96, size: 10, turn: -8 },
];

// AI Movie's cast (their portraits); Amara leads
const CAST = ["kunle", "zainab", "femi", "chidi", "amara", "ngozi", "efe", "bisi", "musa"];

/**
 * Entertainment Blvd's billboard. By default, a night out, in: tonight's
 * wall under marquee bulbs (they come on when you arrive), one show live in
 * the lightbox and the gamepad tucked in by it. Look at an exit and it's
 * that platform's ad: Xtream's battle, Vision's big screen, AI Movie's
 * slate and cast, Arcade's gamepad and streak.
 */
export function EntertainmentArt({ focus, lit }: ArtProps) {
  return (
    <div aria-hidden="true" className={styles.art} data-focus={focus ?? undefined} data-lit={lit || undefined}>
      {/* Something good is always on */}
      <div className={`${styles.layer} ${styles.night}`}>
        <div className={styles.wallMask}>
          <div className={styles.wall}>
            {WALL.map((column, c) => (
              <div key={c} className={styles.column}>
                {column.map((id) => (
                  <span key={id} className={styles.tile}>
                    <Image
                      src={`/assets/vision/${id}.webp`}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 13vw, 26vw"
                      className={styles.photo}
                    />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <i className={`${styles.wash} ${styles.glow}`} />
        <i className={`${styles.halo} ${styles.glow}`} />

        {/* The lightbox: tonight's show, ringed with bulbs */}
        <div className={styles.marquee}>
          <span className={styles.poster}>
            <Image
              src="/assets/vision/owambe.webp"
              alt=""
              fill
              sizes="(min-width: 1024px) 16vw, 34vw"
              className={styles.photo}
            />
            <span className={styles.live}>Live</span>
          </span>
          <span className={styles.bulbs}>
            {BULBS.map(([x, y], i) => (
              <i key={i} style={vars({ "--x": `${x}%`, "--y": `${y}%`, "--i": i })} />
            ))}
          </span>
        </div>

        <span className={styles.pad}>
          <Image src="/assets/arcade/controller.webp" alt="" fill sizes="(min-width: 1024px) 14vw, 34vw" />
        </span>
      </div>

      {/* Xtream: two creators, one battle, the heat between them */}
      <div className={`${styles.layer} ${styles.xtream}`}>
        <div className={styles.battle}>
          <span className={styles.side} data-side="zara">
            <Image
              src="/assets/images/xtream-live.webp"
              alt=""
              fill
              sizes="(min-width: 1024px) 13vw, 40vw"
              className={styles.photo}
            />
            <span className={styles.live}>Live</span>
          </span>
          <span className={styles.side} data-side="kojo">
            <Image
              src="/assets/xtream/kojo.webp"
              alt=""
              fill
              sizes="(min-width: 1024px) 13vw, 40vw"
              className={styles.photo}
            />
          </span>
          <i className={styles.seam} />
          <span className={styles.vs}>VS</span>
          {GIFTS.map((gift) => (
            <Image
              key={gift.id}
              unoptimized
              src={`/assets/xtream/gifts/${gift.id}.webp`}
              alt=""
              width={112}
              height={112}
              className={styles.gift}
              style={vars({ "--x": `${gift.x}%`, "--y": `${gift.y}%`, "--s": `${gift.size}cqmin`, "--turn": `${gift.turn}deg` })}
            />
          ))}
        </div>
      </div>

      {/* Vision: one of our films on the big screen, friends in the seats */}
      <div className={`${styles.layer} ${styles.vision}`}>
        <div className={styles.cinema}>
          <span className={`${styles.beam} ${styles.glow}`}>
            <i />
          </span>
          <span className={styles.screen}>
            <Image
              src="/assets/vision/lagos-after-dark.webp"
              alt=""
              fill
              sizes="(min-width: 1024px) 32vw, 88vw"
              className={`${styles.photo} ${styles.film}`}
            />
            <span className={styles.together}>Watching together</span>
          </span>
          <span className={styles.seats}>
            {SEATS.map((seat, i) => (
              <i
                key={i}
                style={vars({ "--x": `${seat.x}%`, "--w": `${seat.w}%`, "--drop": `${seat.drop}%`, "--lean": `${seat.lean ?? 0}deg` })}
              />
            ))}
          </span>
        </div>
      </div>

      {/* AI Movie: the cast rolling by on a strip of film, and the slate
          clapping on your first take */}
      <div className={`${styles.layer} ${styles.movie}`}>
        <i className={`${styles.spot} ${styles.glow}`} />
        <div className={styles.reel}>
          <div className={styles.roll}>
            {[0, 1].map((copy) =>
              CAST.map((id) => (
                <span key={`${copy}-${id}`} className={styles.cell}>
                  <span className={styles.frame} data-lead={id === "amara" || undefined}>
                    <Image
                      src={`/assets/ai-movie/cast/${id}.webp`}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 8vw, 22vw"
                      className={styles.photo}
                    />
                  </span>
                </span>
              )),
            )}
          </div>
        </div>
        <div className={styles.slate}>
          <i className={styles.arm} />
          <i className={styles.stick} />
          <span className={styles.board}>
            <span>
              <Image unoptimized src="/assets/ai-movie/mark.webp" alt="" width={72} height={42} className={styles.mark} />
            </span>
            <span className={styles.take}>Take 1</span>
            <span className={styles.chalk} />
          </span>
        </div>
      </div>

      {/* Arcade: the gamepad, big on its cream and lime, and the streak */}
      <div className={`${styles.layer} ${styles.arcade}`}>
        <i className={styles.paper} />
        <i className={styles.ring} />
        <span className={styles.padBig}>
          <Image src="/assets/arcade/controller.webp" alt="" fill sizes="(min-width: 1024px) 26vw, 64vw" />
        </span>
        <span className={styles.streak}>
          <span className={styles.coin}>
            <Icon name="flame" size={24} tone="current" />
          </span>
          7-day streak
        </span>
      </div>
    </div>
  );
}
