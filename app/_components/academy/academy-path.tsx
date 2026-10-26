"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import { Icon, type IconName } from "@/components/icon";
import styles from "./academy-path.module.css";

type School = { id: string; name: string; line: string; program: string; note?: string };

// The eight schools of WorldStreet Mastery Academy, with their own art
// (academy.worldstreetgold.com) and a programme from the live catalogue
const SCHOOLS: readonly School[] = [
  {
    id: "trading-financial-markets",
    name: "Trading & Financial Markets",
    line: "Understand the markets. Develop your skills. Trade with knowledge.",
    program: "Cryptocurrency Trading Masterclass",
    note: "Free to start",
  },
  {
    id: "blockchain-web3",
    name: "Blockchain & Web3",
    line: "The technology behind blockchain, digital assets and the Web3 economy.",
    program: "Blockchain Technology Mastery",
  },
  {
    id: "ai-automation",
    name: "Artificial Intelligence & Automation",
    line: "How AI is changing business, productivity, creativity and everyday work.",
    program: "AI & Automation",
  },
  {
    id: "software-app-development",
    name: "Software & App Development",
    line: "How modern apps are designed and built, with AI-powered tools.",
    program: "App Development with AI",
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    line: "Digital security, cyber threats and responsible practice.",
    program: "Cybersecurity",
  },
  {
    id: "data-analytics",
    name: "Data & Analytics",
    line: "Collect, understand, analyse and communicate data for better decisions.",
    program: "Data Analysis",
  },
  {
    id: "digital-media-creative",
    name: "Digital Media & Creative Technology",
    line: "Turn ideas into compelling content for the creator economy.",
    program: "Content Creation & Video Editing",
  },
  {
    id: "digital-business-remote-careers",
    name: "Digital Business & Remote Careers",
    line: "Selling, marketing, e-commerce and work in the global digital economy.",
    program: "Digital Marketing Masterclass",
    note: "From $26",
  },
];

// The academy's own path: from interest to knowledge, knowledge to skill,
// and skill to opportunity
const PATH: readonly { label: string; doing: string; act: string; icon: IconName }[] = [
  { label: "Interest", doing: "Choose your school", act: "Choose this school", icon: "compass" },
  { label: "Knowledge", doing: "Learn from expert instructors", act: "Finish the lessons", icon: "book-open" },
  { label: "Skill", doing: "Practise on real projects", act: "Hand in your project", icon: "wrench" },
  { label: "Opportunity", doing: "Earn your certificate", act: "Claim your certificate", icon: "certificate" },
];

const two = (n: number) => String(n).padStart(2, "0");

/**
 * The academy's schools, one at a time on their pedestals, and the path
 * through the one you're looking at: step it on from interest to
 * opportunity and the ring fills, until the certificate's yours. Each
 * school keeps its own progress.
 */
export function AcademyPath() {
  const [at, setAt] = useState(0);
  const [done, setDone] = useState<Record<string, number>>({ "trading-financial-markets": 1 });

  const school = SCHOOLS[at];
  const steps = done[school.id] ?? 0;
  const finished = steps >= PATH.length;
  const go = (by: number) => setAt((i) => (i + by + SCHOOLS.length) % SCHOOLS.length);
  const step = () => setDone((d) => ({ ...d, [school.id]: Math.min(PATH.length, (d[school.id] ?? 0) + 1) }));
  const again = () => setDone((d) => ({ ...d, [school.id]: 0 }));

  return (
    <div className={styles.stage}>
      <div className={styles.schools}>
        <div className={styles.stand}>
          <Image
            key={school.id}
            src={`/assets/academy/${school.id}.webp`}
            alt=""
            fill
            sizes="(max-width: 1023px) 90vw, 440px"
            className={styles.art}
          />
          <div className={styles.about}>
            <span className={`${styles.count} tabular-nums`}>
              School {two(at + 1)} of {two(SCHOOLS.length)}
            </span>
            <strong key={school.id}>
              <small>School of</small>
              {school.name}
            </strong>
            <p>{school.line}</p>
          </div>
          <div className={styles.arrows}>
            <button type="button" aria-label="Previous school" onClick={() => go(-1)}>
              <Icon name="chevron-left" size={20} tone="current" />
            </button>
            <button type="button" aria-label="Next school" onClick={() => go(1)}>
              <Icon name="chevron-right" size={20} tone="current" />
            </button>
          </div>
        </div>
        <div className={styles.shelf} role="group" aria-label="Schools">
          {SCHOOLS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`School of ${s.name}`}
              aria-pressed={i === at}
              data-done={(done[s.id] ?? 0) >= PATH.length || undefined}
              onClick={() => setAt(i)}
            >
              <Image src={`/assets/academy/${s.id}.webp`} alt="" fill sizes="64px" />
              {(done[s.id] ?? 0) > 0 && (
                <i style={{ "--p": (done[s.id] ?? 0) / PATH.length } as CSSProperties} aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      </div>

      <section className={styles.path} aria-label={`Your path through ${school.program}`}>
        <header className={styles.program}>
          <span className={styles.kicker}>Featured programme</span>
          <strong>{school.program}</strong>
          {school.note && <span className={styles.note}>{school.note}</span>}
        </header>

        <div className={styles.progress}>
          <span
            className={styles.ring}
            role="progressbar"
            aria-label="Path progress"
            aria-valuemin={0}
            aria-valuemax={PATH.length}
            aria-valuenow={steps}
            style={{ "--p": steps / PATH.length } as CSSProperties}
          >
            <b className="tabular-nums">{Math.round((steps / PATH.length) * 100)}%</b>
          </span>
          <span>
            <strong>{finished ? "Certificate earned" : `Step ${steps + 1} of ${PATH.length}`}</strong>
            <small>{finished ? "Learn. Apply. Grow." : PATH[steps].doing}</small>
          </span>
        </div>

        <ol className={styles.steps}>
          {PATH.map((p, i) => (
            <li key={p.label} data-state={i < steps ? "done" : i === steps ? "now" : undefined}>
              <span className={styles.dot}>
                <Icon name={i < steps ? "check" : p.icon} size={16} tone="current" />
              </span>
              <span>
                <b>{p.label}</b>
                <small>{p.doing}</small>
              </span>
            </li>
          ))}
        </ol>

        {finished ? (
          <div key={school.id} className={styles.certificate} role="status">
            <span className={styles.seal}>
              <Icon name="award" size={24} tone="current" />
            </span>
            <span>
              <small>Mastery Academy · certificate</small>
              <b>School of {school.name}</b>
            </span>
            <button type="button" onClick={again} aria-label="Start this path again">
              <Icon name="refresh" size={16} tone="current" />
            </button>
          </div>
        ) : (
          <button type="button" className={styles.next} onClick={step}>
            {PATH[steps].act}
            <Icon name="arrow-right" size={16} tone="current" />
          </button>
        )}
      </section>
    </div>
  );
}
