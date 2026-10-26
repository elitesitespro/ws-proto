"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Icon, type IconName } from "@/components/icon";
import styles from "./worldhealth-consult.module.css";

type Mode = "video" | "audio" | "text";
type Field = "Family medicine" | "Dermatology" | "Psychology";
type Doctor = {
  id: string;
  name: string;
  field: Field;
  country: string;
  speaks: string;
  rate: number;
  next: string;
  face: string;
  room?: string;
};
type Step = "choose" | "booked" | "consult";

// What people ask Vivid on WorldHealth's own page, and the kind of
// consultant it points to. Vivid informs; it doesn't diagnose.
const CONCERNS: readonly { ask: string; field: Field; reply: string }[] = [
  { ask: "I’ve had a headache for three days", field: "Family medicine", reply: "A family medicine consultant is a good place to start." },
  { ask: "Is this rash something to worry about?", field: "Dermatology", reply: "Dermatology consultants can look at it with you on video." },
  { ask: "I’ve been feeling anxious lately", field: "Psychology", reply: "A psychology consultant can talk it through with you." },
];

// Sample consultants, each with their own rate and hours, soonest first
const DOCTORS: readonly Doctor[] = [
  {
    id: "funmi",
    name: "Dr Funmi Adebayo",
    field: "Family medicine",
    country: "Nigeria",
    speaks: "English, Yoruba",
    rate: 30,
    next: "10:30",
    face: "/assets/worldhealth/funmi.webp",
    room: "/assets/worldhealth/consultation.webp",
  },
  { id: "ravi", name: "Dr Ravi Shah", field: "Family medicine", country: "Kenya", speaks: "English, Swahili", rate: 28, next: "11:00", face: "/assets/people/doc-ravi.webp" },
  { id: "sofia", name: "Dr Sofia Moretti", field: "Dermatology", country: "Italy", speaks: "Italian, English", rate: 45, next: "10:45", face: "/assets/worldhealth/sofia.webp" },
  { id: "adaeze", name: "Dr Adaeze Okafor", field: "Dermatology", country: "Nigeria", speaks: "English, Igbo", rate: 35, next: "12:00", face: "/assets/people/doc-adaeze.webp" },
  { id: "amara", name: "Dr Amara Diallo", field: "Psychology", country: "Senegal", speaks: "French, English", rate: 32, next: "10:30", face: "/assets/people/doc-amara.webp" },
  { id: "elena", name: "Dr Elena Costa", field: "Psychology", country: "Portugal", speaks: "Portuguese, English", rate: 40, next: "11:15", face: "/assets/people/doc-elena.webp" },
];
const MODES: readonly [Mode, string, IconName][] = [
  ["video", "Video", "video"],
  ["audio", "Audio", "phone"],
  ["text", "Text", "chat"],
];

const clock = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const first = (name: string) => name.split(" ")[1];

/**
 * WorldHealth, as its own page has it: tell Vivid how you feel, see the
 * reviewed consultants for it soonest first, pick video, audio or text and
 * book; then you're in the consultation. Vivid informs, it doesn't
 * diagnose, and none of it is for emergencies.
 */
export function WorldhealthConsult() {
  const [concern, setConcern] = useState(0);
  const [doctorId, setDoctorId] = useState("funmi");
  const [mode, setMode] = useState<Mode>("video");
  const [step, setStep] = useState<Step>("choose");
  const [seconds, setSeconds] = useState(0);
  const [said, setSaid] = useState(1);
  const [muted, setMuted] = useState(false);
  const [ended, setEnded] = useState<string | null>(null);

  const { field, reply, ask } = CONCERNS[concern];
  const shortlist = DOCTORS.filter((d) => d.field === field).sort((a, b) => a.next.localeCompare(b.next));
  const doctor = DOCTORS.find((d) => d.id === doctorId) ?? shortlist[0];

  // In the consultation: the clock runs, and in text the messages come in
  useEffect(() => {
    if (step !== "consult") return;
    const tick = setInterval(() => setSeconds((s) => s + 1), 1000);
    const type = setInterval(() => setSaid((n) => Math.min(n + 1, 3)), 2400);
    return () => {
      clearInterval(tick);
      clearInterval(type);
    };
  }, [step]);

  const pickConcern = (i: number) => {
    setConcern(i);
    setDoctorId(DOCTORS.filter((d) => d.field === CONCERNS[i].field).sort((a, b) => a.next.localeCompare(b.next))[0].id);
    setStep("choose");
    setEnded(null);
  };
  const join = () => {
    setSeconds(0);
    setSaid(1);
    setMuted(false);
    setStep("consult");
  };
  const end = () => {
    setEnded(`Consultation with ${doctor.name} ended · ${clock(seconds)}`);
    setStep("choose");
  };

  const chat = [
    { me: false, text: `Hello, I’m ${doctor.name}. Tell me what’s been going on.` },
    { me: true, text: `${ask}.` },
    { me: false, text: "Thank you. I’ll ask a few questions so I understand it properly." },
  ].slice(0, said);

  return (
    <div className={styles.stage}>
      {/* Vivid: describe how you feel */}
      <section className={styles.vivid} aria-label="Ask Vivid">
        <p className={styles.prompt}>
          <Icon name="sparkle" size={16} tone="current" />
          Ask Vivid, or describe how you feel
        </p>
        <div className={styles.asks} role="group" aria-label="Things people ask">
          {CONCERNS.map((c, i) => (
            <button key={c.ask} type="button" aria-pressed={concern === i} onClick={() => pickConcern(i)}>
              {c.ask}
            </button>
          ))}
        </div>
        <p key={concern} className={styles.reply} aria-live="polite">
          <b>Vivid</b> {reply} Here are {field.toLowerCase()} consultants, soonest first.
        </p>
        <p className={styles.informs}>Vivid informs. It doesn’t diagnose, and it isn’t emergency care.</p>
        <p className={styles.emergency}>
          <Icon name="alert" size={16} tone="current" />
          <span>
            <strong>Not for emergencies.</strong> If it’s urgent, call your local emergency number.
          </span>
        </p>
      </section>

      {/* The consultants, then your booking, then the consultation */}
      <section className={styles.card} aria-label="Consultation">
        {step === "consult" ? (
          <div className={styles.room} data-mode={mode}>
            <div className={styles.view}>
              {mode === "video" ? (
                doctor.room ? (
                  <Image src={doctor.room} alt="" fill sizes="(max-width: 1023px) 90vw, 400px" className={styles.feed} />
                ) : (
                  <>
                    <Image src={doctor.face} alt="" fill sizes="96px" className={styles.blur} />
                    <Image src={doctor.face} alt="" width={112} height={112} className={styles.portrait} />
                  </>
                )
              ) : mode === "audio" ? (
                <span className={styles.voice}>
                  <Image src={doctor.face} alt="" width={96} height={96} />
                  <span className={styles.bars} aria-hidden="true">
                    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                      <i key={i} />
                    ))}
                  </span>
                </span>
              ) : (
                <ol className={styles.messages} aria-live="polite">
                  {chat.map((m, i) => (
                    <li key={i} data-me={m.me || undefined}>
                      {m.text}
                    </li>
                  ))}
                </ol>
              )}
              <span className={styles.live}>
                In consultation · <span className="tabular-nums">{clock(seconds)}</span>
              </span>
              {mode === "video" && (
                <span className={styles.self} aria-hidden="true">
                  {muted ? <Icon name="mic-off" size={16} tone="current" /> : "You"}
                </span>
              )}
            </div>
            <div className={styles.callBar}>
              <span className={styles.callWho}>
                <strong>{doctor.name}</strong>
                <span>
                  {doctor.field} · {MODES.find(([m]) => m === mode)?.[1]}
                </span>
              </span>
              {mode !== "text" && (
                <button
                  type="button"
                  className={styles.round}
                  aria-label={muted ? "Unmute" : "Mute"}
                  aria-pressed={muted}
                  onClick={() => setMuted(!muted)}
                >
                  <Icon name={muted ? "mic-off" : "mic"} size={18} tone="current" />
                </button>
              )}
              <button type="button" className={styles.end} onClick={end}>
                <Icon name="phone-end" size={18} tone="current" />
                End
              </button>
            </div>
          </div>
        ) : step === "booked" ? (
          <div className={styles.booked} role="status">
            <Image src={doctor.face} alt="" width={64} height={64} />
            <strong>Booked with {doctor.name}</strong>
            <span className="tabular-nums">
              Today, {doctor.next} · {MODES.find(([m]) => m === mode)?.[1]} · ${doctor.rate} from your wallet
            </span>
            <span className={styles.fine}>Cancel up to 1h before for a full refund to your wallet.</span>
            <div className={styles.bookedActions}>
              <button type="button" className={styles.book} onClick={join}>
                <Icon name={MODES.find(([m]) => m === mode)?.[2] ?? "video"} size={18} tone="current" />
                It’s {doctor.next}: join
              </button>
              <button type="button" className={styles.ghost} onClick={() => setStep("choose")}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className={styles.head}>
              <span>Soonest first</span>
              <span>{field}</span>
            </p>
            {ended && (
              <p key={ended} className={styles.ended} role="status">
                <Icon name="check-circle" size={16} tone="current" />
                {ended}
              </p>
            )}
            <ul className={styles.doctors}>
              {shortlist.map((d) => (
                <li key={d.id}>
                  <button type="button" aria-pressed={doctor.id === d.id} onClick={() => setDoctorId(d.id)}>
                    <Image src={d.face} alt="" width={48} height={48} />
                    <span className={styles.who}>
                      <strong>
                        {d.name}
                        <Icon name="badge-check" size={16} tone="current" label="Reviewed" />
                      </strong>
                      <span>
                        {d.field} · {d.country}
                      </span>
                      <span>Speaks {d.speaks}</span>
                    </span>
                    <span className={styles.when}>
                      <b className="tabular-nums">${d.rate}</b>
                      <span className="tabular-nums">Next {d.next}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <div className={styles.modes} role="group" aria-label="Meet by">
              {MODES.map(([m, label, icon]) => (
                <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}>
                  <Icon name={icon} size={16} tone="current" />
                  {label}
                </button>
              ))}
            </div>
            <button type="button" className={styles.book} onClick={() => setStep("booked")}>
              Book {first(doctor.name)} at {doctor.next} · ${doctor.rate}
            </button>
          </>
        )}
      </section>
    </div>
  );
}
