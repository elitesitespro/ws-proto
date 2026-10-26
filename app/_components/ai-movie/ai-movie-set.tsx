"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { Icon } from "@/components/icon";
import styles from "./ai-movie-set.module.css";

type Member = { id: string; name: string; role: string; line: string; goal: string };
type Desk = "script" | "logline" | "trailer" | "captions" | "replies";

// A dozen of AI Movie's 52 characters, as worldstreetgold.com casts them
// (their portraits, names and parts); the lines are illustrative
const CAST: readonly Member[] = [
  { id: "kunle", name: "Kunle", role: "Detective", line: "Somebody cut these lights on purpose.", goal: "find out who switched off the city" },
  { id: "zainab", name: "Zainab", role: "Rival", line: "You shoot your film. I'll shoot mine.", goal: "beat her old crew to the premiere" },
  { id: "femi", name: "Femi", role: "Mentor", line: "Every great film starts in the dark.", goal: "see one last student finish a film" },
  { id: "chidi", name: "Chidi", role: "Driver", line: "Third Mainland in ten minutes. Hold on.", goal: "get the reels across the city before dawn" },
  { id: "ngozi", name: "Ngozi", role: "Mayor", line: "Not one more blackout on my watch.", goal: "keep the lights on through election night" },
  { id: "amara", name: "Amara", role: "Lead", line: "If the lights go, we shoot anyway.", goal: "finish her first film before the power runs out" },
  { id: "tolu", name: "Tolu", role: "Hacker", line: "Give me the grid. Five minutes.", goal: "bring the grid back before anyone notices" },
  { id: "musa", name: "Musa", role: "Bodyguard", line: "Nobody gets to the roof without me.", goal: "keep one witness safe until morning" },
  { id: "efe", name: "Efe", role: "Singer", line: "Then I'll sing them back on.", goal: "play the show of her life in a blackout" },
  { id: "bisi", name: "Bisi", role: "Grandmother", line: "In my day we lit lanterns and kept talking.", goal: "hold her family together for one more night" },
  { id: "obi", name: "Obi", role: "Villain", line: "Darkness is good for business.", goal: "sell the city its own light back" },
  { id: "lara", name: "Lara", role: "Reporter", line: "Roll camera. The city should see this.", goal: "break the story before the lights return" },
];

// The writing desk: everything written, for whoever leads
const DESKS: readonly [Desk, string][] = [
  ["script", "Script"],
  ["logline", "Logline"],
  ["trailer", "Trailer"],
  ["captions", "Captions"],
  ["replies", "Fan replies"],
];

type Line = { text: string; kind?: "slug" | "name" | "talk" | "fan" };

function written(desk: Desk, lead: Member): Line[] {
  const part = lead.role === "Lead" ? "film-maker" : lead.role.toLowerCase();
  switch (desk) {
    case "script":
      return [
        { text: "INT. ROOFTOP, LAGOS — NIGHT", kind: "slug" },
        { text: `Generator hum. ${lead.name.toUpperCase()} watches the city lights go out, block by block.` },
        { text: lead.name.toUpperCase(), kind: "name" },
        { text: lead.line, kind: "talk" },
      ];
    case "logline":
      return [{ text: `When the lights go out across Lagos, a ${part} has one night to ${lead.goal}.` }];
    case "trailer":
      return [
        { text: "One city." },
        { text: "One night with no lights." },
        { text: `And one ${part} who won't stop.` },
        { text: "LIGHTS OUT. Coming soon.", kind: "slug" },
      ];
    case "captions":
      return [{ text: `Day one on set: ${lead.name} takes the rooftop. 🎬 #LightsOut #AIMovie` }];
    case "replies":
      return [
        { text: `@tobi.reels: who's playing the ${part}??`, kind: "fan" },
        { text: `${lead.name}. Wait till you see the rooftop scene.` },
      ];
  }
}

/**
 * Day one on an AI Movie set: the clapperboard and the writing desk above,
 * the cast below. Pick your lead and everything written (the script, the
 * logline, the trailer, the captions, even the replies to fans) is rewritten
 * around them; call action and the board claps for the next take.
 */
export function AiMovieSet() {
  const [lead, setLead] = useState(CAST[5]);
  const [desk, setDesk] = useState<Desk>("script");
  const [take, setTake] = useState(3);
  const strip = useRef<HTMLOListElement>(null);

  // Keep the lead in the middle of the film strip (sideways only, so the
  // page itself never moves)
  useEffect(() => {
    const list = strip.current;
    const frame = list?.querySelector<HTMLElement>(`[data-id="${lead.id}"]`);
    if (!list || !frame) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollTo({ left: frame.offsetLeft - (list.clientWidth - frame.clientWidth) / 2, behavior: reduced ? "auto" : "smooth" });
  }, [lead]);

  // The page writes itself in, a word at a time
  const lines = written(desk, lead);
  const words = lines.map((line) => line.text.split(" "));
  const starts = words.map((_, i) => words.slice(0, i).flat().length);

  return (
    <div className={styles.stage}>
      <section className={styles.board} aria-label="Clapperboard and writing desk">
        {/* The clapper: it snaps shut on each new take */}
        <div key={take} className={styles.clapper} aria-hidden="true">
          <i />
        </div>
        <dl className={styles.slate}>
          <div>
            <dt>Prod.</dt>
            <dd>AI Movie</dd>
          </div>
          <div>
            <dt>Scene</dt>
            <dd className="tabular-nums">12</dd>
          </div>
          <div>
            <dt>Take</dt>
            <dd key={take} className={`${styles.take} tabular-nums`}>
              {take}
            </dd>
          </div>
          <div>
            <dt>Roll</dt>
            <dd>A</dd>
          </div>
        </dl>

        <div className={styles.desks} role="group" aria-label="The writing desk">
          {DESKS.map(([id, label]) => (
            <button key={id} type="button" aria-pressed={desk === id} onClick={() => setDesk(id)}>
              {label}
            </button>
          ))}
        </div>
        <div key={`${desk}-${lead.id}-${take}`} className={styles.page} aria-live="polite">
          {lines.map((line, i) => (
            <p key={i} data-kind={line.kind}>
              {words[i].map((w, j) => (
                <span key={j} style={{ "--i": starts[i] + j } as CSSProperties}>
                  {w}{" "}
                </span>
              ))}
            </p>
          ))}
          <p className={styles.drafting} style={{ "--i": words.flat().length } as CSSProperties}>
            Drafting the next line…
          </p>
        </div>
        <button type="button" className={styles.action} onClick={() => setTake(take + 1)}>
          <Icon name="clapperboard" size={16} tone="current" />
          Action
        </button>
      </section>

      <div className={styles.cast}>
        <p className={styles.call}>
          The cast · 52 <span>Ready on set. Pick your lead.</span>
        </p>
        <ol ref={strip} className={styles.strip}>
          {CAST.map((member) => (
            <li key={member.id} data-id={member.id}>
              <button
                type="button"
                className={styles.frame}
                aria-pressed={lead.id === member.id}
                aria-label={`Cast ${member.name}, ${member.role.toLowerCase()}, as your lead`}
                onClick={() => setLead(member)}
              >
                <Image src={`/assets/ai-movie/cast/${member.id}.webp`} alt="" fill sizes="96px" />
                {lead.id === member.id && (
                  <span key={take} className={styles.rolling} aria-label={`Take ${take}, rolling`}>
                    Take {take}
                  </span>
                )}
                <span className={styles.name}>
                  <strong>{member.name}</strong>
                  {member.role}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
