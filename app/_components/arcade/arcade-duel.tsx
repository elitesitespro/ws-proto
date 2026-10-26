"use client";

import { useEffect, useEffectEvent, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/icon";
import styles from "./arcade-duel.module.css";

type Question = { ask: string; answers: readonly string[]; right: number };
type Pick = { by: "you" | "bot"; answer: number };

// Arcade's own Trivia Duel questions (worldstreet-arcade's preview data)
const QUESTIONS: readonly Question[] = [
  { ask: "What does “going long” mean?", answers: ["Betting the price rises", "Selling everything", "Betting the price falls", "Holding cash"], right: 0 },
  { ask: "Leverage of 10x on a $100 position controls…", answers: ["$10", "$110", "$1,000", "$100"], right: 2 },
  { ask: "A “whale” in crypto slang is…", answers: ["A brand-new trader", "A holder big enough to move the market", "A coin that sank", "A slow blockchain"], right: 1 },
  { ask: "“Buy the rumour, sell the news” describes markets…", answers: ["Ignoring the news", "Moving a week late", "Moving only on rumours", "Pricing events in before they happen"], right: 3 },
  { ask: "A futures curve in “contango” means…", answers: ["Futures trade above spot", "Futures trade below spot", "Spot prices are frozen", "The market is closed"], right: 0 },
];
const REVEAL_MS = 1600;
const XP_PER_POINT = 50;

// The board around you: everyone else from #120 down, in order, points
// falling away (you sit among them)
const OTHERS = ["Kemi A.", "Femi O.", "Grace N.", "Ibrahim S.", "Zainab M.", "Tunde A.", "Chidi E.", "Musa D.", "Esther I.", "Bisi K.", "Yemi O.", "Sade L."].map(
  (name, i) => ({ name, points: (4980 - i * 61).toLocaleString("en-GB") }),
);
const TOP = 120;
const START_RANK = 128;
// Who's at a rank: above you, the others in order; below, one place down
const at = (rank: number, mine: number) => OTHERS[rank - TOP - (rank > mine ? 1 : 0)];

/**
 * Arcade's Trivia Duel against the Street Bot: five questions, eight seconds
 * each, first right answer takes the point. Every point is XP on your card
 * and a step up the weekly board, past whoever's above you; finish the duel
 * and today's streak is kept.
 */
export function ArcadeDuel() {
  const [round, setRound] = useState(0);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [score, setScore] = useState({ you: 0, bot: 0 });
  const [rank, setRank] = useState(START_RANK);
  const [xp, setXp] = useState(640);
  const [streak, setStreak] = useState(6);
  const [passed, setPassed] = useState<{ id: number; name: string } | null>(null);

  const done = round >= QUESTIONS.length;
  const question = QUESTIONS[Math.min(round, QUESTIONS.length - 1)];
  const taken = picks.find((p) => p.answer === question.right);
  const yours = picks.find((p) => p.by === "you");
  const bots = picks.find((p) => p.by === "bot");
  const outOfTime = picks.some((p) => p.answer === -1);
  const revealed = Boolean(taken) || outOfTime || (Boolean(yours) && Boolean(bots));

  function answer(by: Pick["by"], choice: number) {
    if (revealed || picks.some((p) => p.by === by)) return;
    setPicks([...picks, { by, answer: choice }]);
    if (choice !== question.right) return;
    setScore((s) => ({ ...s, [by]: s[by] + 1 }));
    if (by === "you") {
      setXp((x) => x + XP_PER_POINT);
      setRank(rank - 1);
      setPassed({ id: round, name: at(rank - 1, rank).name });
    }
  }

  // The bot thinks, then answers (right about two times in three)
  const botAnswers = useEffectEvent(() => {
    const right = Math.random() < 0.62;
    const wrong = [0, 1, 2, 3].filter((a) => a !== question.right);
    answer("bot", right ? question.right : wrong[Math.floor(Math.random() * 3)]);
  });
  useEffect(() => {
    if (done) return;
    const think = setTimeout(botAnswers, 2800 + Math.random() * 4200);
    return () => clearTimeout(think);
  }, [round, done]);

  // Then the next question
  useEffect(() => {
    if (!revealed || done) return;
    const next = setTimeout(() => {
      setPicks([]);
      setRound((r) => r + 1);
    }, REVEAL_MS);
    return () => clearTimeout(next);
  }, [revealed, done]);

  const timeUp = () => {
    if (!revealed) setPicks((all) => [...all, { by: "you", answer: -1 }]);
  };

  const again = () => {
    setRound(0);
    setPicks([]);
    setScore({ you: 0, bot: 0 });
  };

  // Finishing a duel keeps the streak alive for today
  useEffect(() => {
    if (!done) return;
    const keep = setTimeout(() => setStreak((s) => Math.max(s, 7)), 600);
    return () => clearTimeout(keep);
  }, [done]);

  const level = 12 + Math.floor(xp / 1000);
  const into = xp % 1000;
  const verdict = score.you > score.bot ? "You won" : score.you < score.bot ? "The Street Bot won" : "A draw";

  return (
    <div className={styles.stage}>
      <section className={styles.duel} aria-label="Trivia Duel against the Street Bot">
        <header className={styles.head}>
          <span className={styles.player}>
            <i className={styles.you}>You</i>
            <strong className="tabular-nums">{score.you}</strong>
          </span>
          <span className={styles.rounds} aria-label={`Question ${Math.min(round + 1, 5)} of 5`}>
            {QUESTIONS.map((_, i) => (
              <i key={i} data-state={i < round ? "done" : i === round && !done ? "now" : undefined} />
            ))}
          </span>
          <span className={styles.player} data-bot>
            <strong className="tabular-nums">{score.bot}</strong>
            <i className={styles.bot}>
              <Icon name="bot" size={16} tone="current" />
            </i>
          </span>
        </header>
        <p className={styles.versus}>
          <span>Trivia Duel</span>
          <span>vs the Street Bot</span>
        </p>

        {done ? (
          <div className={styles.over} role="status">
            <strong>{verdict}</strong>
            <span className="tabular-nums">
              {score.you}–{score.bot} · +{score.you * XP_PER_POINT} XP · Streak kept
            </span>
            <button type="button" className={styles.again} onClick={again}>
              <Icon name="refresh" size={16} tone="current" />
              One more round
            </button>
          </div>
        ) : (
          <div key={round} className={styles.round}>
            <div className={styles.clock} aria-hidden="true">
              <i data-stopped={revealed || undefined} onAnimationEnd={timeUp} />
            </div>
            <p className={styles.ask}>{question.ask}</p>
            <div className={styles.answers}>
              {question.answers.map((text, i) => {
                const state = !revealed
                  ? yours?.answer === i
                    ? "wrong"
                    : undefined
                  : i === question.right
                    ? "right"
                    : picks.some((p) => p.answer === i)
                      ? "wrong"
                      : undefined;
                return (
                  <button
                    key={text}
                    type="button"
                    className={styles.answer}
                    data-state={state}
                    disabled={revealed || Boolean(yours)}
                    onClick={() => answer("you", i)}
                  >
                    <span className={styles.letter}>{"ABCD"[i]}</span>
                    {text}
                    {bots?.answer === i && (
                      <span className={styles.botPick}>
                        <Icon name="bot" size={12} tone="current" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className={styles.call} aria-live="polite">
              {revealed
                ? taken?.by === "you"
                  ? "Your point. First right answer."
                  : taken?.by === "bot"
                    ? "The Street Bot got there first."
                    : outOfTime
                      ? "Out of time. Nobody scores."
                      : "Nobody got it."
                : yours
                  ? "Not that one. The bot can still take it."
                  : bots
                    ? "The bot missed. Your turn."
                    : "First right answer takes the point."}
            </p>
          </div>
        )}
      </section>

      {/* The weekly board around you, and your card on it */}
      <div className={styles.board}>
        <ol className={styles.ghosts} aria-hidden="true">
          {[rank - 2, rank - 1].map((r) => (
            <li key={at(r, rank).name}>
              <b>#{r}</b>
              <span>{at(r, rank).name}</span>
              <small className="tabular-nums">{at(r, rank).points} pts</small>
            </li>
          ))}
        </ol>
        <div className={styles.card}>
          <Image src="/assets/arcade/controller.webp" alt="" width={240} height={240} className={styles.pad} />
          {passed && (
            <span key={passed.id} className={styles.up}>
              <Icon name="trending-up" size={16} tone="current" />
              You passed {passed.name}
            </span>
          )}
          <strong key={rank} className={`${styles.rank} tabular-nums`}>
            #{rank}
          </strong>
          <span className={styles.me}>
            You · Level {level} · Street Regular
          </span>
          <span className={styles.bar} aria-label={`${into} of 1,000 XP to level ${level + 1}`}>
            <i style={{ transform: `scaleX(${into / 1000})` }} />
          </span>
          <span className={`${styles.xp} tabular-nums`}>
            <span>Lv {level}</span>
            {into} / 1,000 XP
            <span>Lv {level + 1}</span>
          </span>
          <span className={styles.since}>Up {14 + START_RANK - rank} since Monday</span>
        </div>
        <ol className={styles.ghosts} aria-hidden="true">
          {[rank + 1].map((r) => (
            <li key={at(r, rank).name}>
              <b>#{r}</b>
              <span>{at(r, rank).name}</span>
              <small className="tabular-nums">{at(r, rank).points} pts</small>
            </li>
          ))}
        </ol>
        <span key={streak} className={styles.streak} aria-label={`${streak} day streak`}>
          <Icon name="flame" size={16} tone="current" />
          <b className="tabular-nums">{streak}</b>
          day streak
        </span>
      </div>
    </div>
  );
}
