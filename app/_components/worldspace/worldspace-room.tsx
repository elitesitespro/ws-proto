"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { Glass } from "@/ds/components/glass";
import { face, type PersonId } from "./people";
import styles from "./worldspace-room.module.css";

// The room's speakers take turns round the orbit; the last seat is yours,
// empty until you join
const SEATS: readonly (PersonId | "you")[] = ["mei", "tunde", "ngozi", "ravi", "adaeze", "you"];

type Reaction = { id: number; icon: "heart" | "flame"; x: number };

/**
 * A live Space Voice room, set round the WorldSpace helmet: its speakers
 * orbit it in 3D (passing behind it), each lit by a ring as they talk.
 * Join and you take the empty seat; hearts and fire float up from the orbit.
 * On a mouse the helmet leans a little toward the pointer.
 */
export function WorldspaceRoom({ joined, onJoin }: { joined: boolean; onJoin: () => void }) {
  const [hand, setHand] = useState(false);
  const [reactions, setReactions] = useState<readonly Reaction[]>([]);
  const sent = useRef(0);
  const orbit = useRef<HTMLDivElement>(null);

  // Written to CSS variables, so nothing re-renders
  useEffect(() => {
    const el = orbit.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (event: PointerEvent) => {
      el.style.setProperty("--lean-x", ((event.clientX / window.innerWidth - 0.5) * 8).toFixed(2));
      el.style.setProperty("--lean-y", ((0.5 - event.clientY / window.innerHeight) * 8).toFixed(2));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const react = (icon: Reaction["icon"]) => {
    sent.current += 1;
    const id = sent.current;
    // Each rises from a different point along the front of the orbit
    setReactions((all) => [...all.slice(-6), { id, icon, x: ((id * 37) % 60) - 30 }]);
  };
  const handUp = hand && joined;

  return (
    <div className={styles.room}>
      <div ref={orbit} className={styles.orbit} aria-hidden="true">
        {/* The stars behind blur more toward the middle, with no edge and no tint */}
        <span className={styles.haze} />
        <span className={styles.haze} />
        <span className={styles.haze} />
        <div className={styles.world}>
          <div className={styles.float}>
            <div className={styles.helmet}>
              <Image src="/assets/worldspace/helmet.webp" alt="" fill sizes="(max-width: 1023px) 160px, 240px" />
            </div>
          </div>
          <div className={`${styles.plane} ${styles.outer}`}>
            <span className={styles.ring} />
          </div>
          <div className={styles.plane}>
            <span className={styles.ring} />
            <div className={styles.spin}>
              {SEATS.map((who, i) => (
                <span
                  key={who}
                  className={styles.seat}
                  style={{ "--a": `${(i * 360) / SEATS.length}deg` } as CSSProperties}
                  data-empty={(who === "you" && !joined) || undefined}
                >
                  <span className={styles.face} style={{ "--i": i } as CSSProperties} data-you={who === "you" || undefined}>
                    {who === "you" ? (
                      <span className={styles.you}>{handUp ? <Icon name="hand" size={20} tone="current" /> : "You"}</span>
                    ) : (
                      <Image src={face(who)} alt="" width={48} height={48} />
                    )}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
        {reactions.map(({ id, icon, x }) => (
          <span
            key={id}
            className={styles.reaction}
            style={{ "--x": `${x}%` } as CSSProperties}
            onAnimationEnd={() => setReactions((all) => all.filter((r) => r.id !== id))}
          >
            <Icon name={icon} size={24} tone="current" />
          </span>
        ))}
      </div>

      <Glass as="section" tone="dark" className={styles.bar} aria-label="Creative club, live in Space Voice">
        <div className={styles.head}>
          <span className={styles.live}>Live</span>
          <span className={styles.eq} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className={styles.quiet}>Space Voice</span>
        </div>
        <div className={styles.title}>
          <strong>Creative club</strong>
          <span key={Number(joined)} className={`${styles.quiet} ${styles.count}`}>
            {joined ? "You’re listening in · 129" : "128 listening"}
          </span>
        </div>
        <div className={styles.actions}>
          <Button variant="outline" size="icon-sm" className={styles.pill} aria-label="Send a heart" onClick={() => react("heart")}>
            <Icon name="heart" size={20} tone="current" />
          </Button>
          <Button variant="outline" size="icon-sm" className={styles.pill} aria-label="Send fire" onClick={() => react("flame")}>
            <Icon name="flame" size={20} tone="current" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            className={styles.pill}
            aria-label="Raise hand"
            aria-pressed={handUp}
            onClick={() => {
              if (!joined) onJoin();
              setHand(!handUp);
            }}
          >
            <Icon name="hand" size={20} tone="current" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`${styles.pill} ${styles.join}`}
            aria-pressed={joined}
            onClick={onJoin}
          >
            {joined && <Icon name="check" size={16} tone="current" />}
            {joined ? "Joined" : "Join"}
          </Button>
        </div>
      </Glass>
    </div>
  );
}
