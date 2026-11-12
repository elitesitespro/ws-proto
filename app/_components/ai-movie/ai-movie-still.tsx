import Image from "next/image";
import s from "../platform-still.module.css";
import own from "./ai-movie-still.module.css";

const SLATE = [
  ["Prod.", "AI Studio", false],
  ["Scene", "12", false],
  ["Take", "3", true],
  ["Roll", "A", false],
] as const;
const CAST = [
  ["amara", "Amara", "Lead"],
  ["kunle", "Kunle", "Detective"],
  ["zainab", "Zainab", "Rival"],
  ["femi", "Femi", "Mentor"],
] as const;

/** AI Studio on a phone: the clapperboard on scene 12, a line of the script, and the cast on a strip of film. */
export function AiMovieStill() {
  return (
    <div
      className={s.still}
      data-brand="studio"
      role="img"
      aria-label="AI Studio: scene 12, take 3, a line written for Amara, the lead, and three more of the cast"
    >
      <div className={`${s.card} ${own.board}`}>
        <i className={own.clapper} />
        <div className={own.slate}>
          {SLATE.map(([label, value, lit]) => (
            <span key={label} className={s.stack}>
              <span className={s.meta}>{label}</span>
              <span className={`${s.lead} ${lit ? s.hue : ""}`}>{value}</span>
            </span>
          ))}
        </div>
        <p className={`${own.script} ${s.rule}`}>
          <span className={s.meta}>Int. rooftop, Lagos, night</span>
          <span>
            <span className={`${s.name} ${s.hue}`}>Amara</span> If the lights go, we shoot anyway.
          </span>
        </p>
      </div>
      <div className={`${own.film} ${s.grow}`}>
        {CAST.map(([id, name, role], i) => (
          <span key={id} className={s.photo} data-ring={i === 0 ? "" : undefined}>
            <Image src={`/assets/ai-movie/cast/${id}.webp`} alt="" fill sizes="(max-width: 600px) 25vw, 140px" />
            {i === 0 && <span className={`${s.tag} ${own.take}`}>Take 3</span>}
            <span className={s.caption} data-tight="">
              <span className={s.stack}>
                <span className={s.name}>{name}</span>
                <span className={s.meta}>{role}</span>
              </span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
