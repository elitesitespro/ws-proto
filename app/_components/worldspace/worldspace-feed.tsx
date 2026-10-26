"use client";

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { Glass } from "@/ds/components/glass";
import { PEOPLE, face, type PersonId } from "./people";
import styles from "./worldspace-feed.module.css";

type Post =
  | { kind: "live"; text: string }
  | { kind: "text"; text: string; likes: number; replies: number }
  | { kind: "poll"; text: string; options: readonly (readonly [string, number])[]; likes: number; replies: number }
  | { kind: "voice"; text: string; seconds: number; likes: number; replies: number };

type StoryId = PersonId | "you";

// Each story opens its person's latest post, the kinds WorldSpace has: a live
// room, a thought, a poll, a voice note
const STORIES: readonly { who: PersonId; when: string; post: Post }[] = [
  { who: "mei", when: "Live now", post: { kind: "live", text: "Hosting Creative club in Space Voice. Pull up a chair." } },
  { who: "amara", when: "2m", post: { kind: "text", text: "What are you creating this week?", likes: 128, replies: 24 } },
  {
    who: "tunde",
    when: "18m",
    post: { kind: "poll", text: "Sunday plans?", options: [["Beach day", 41], ["Film night", 57]], likes: 64, replies: 12 },
  },
  { who: "elena", when: "1h", post: { kind: "text", text: "Sunsets on the water all week. Who’s coming tomorrow?", likes: 342, replies: 51 } },
  { who: "ravi", when: "3h", post: { kind: "voice", text: "A quick one about Saturday’s meetup", seconds: 12, likes: 87, replies: 9 } },
];

// The composer's prompts, assembling and dissolving in turn while it's empty
const PROMPTS = ["What are you creating this week?", "Share a moment from today.", "Ask your people anything."];

// A voice note's waveform, the same shape every time
const WAVE = Array.from({ length: 32 }, (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)));

// After you post: likes arrive, then Amara aligns with you, then the note goes
const CHEERS_MS = [900, 1800, 2700, 5200, 5600];

/**
 * WorldSpace's feed. Stories along the top play through on their own, each
 * opening its person's post below (they pause while you're over the feed);
 * the composer under it posts for real, into your own story.
 */
export function WorldspaceFeed({ joined, onJoin }: { joined: boolean; onJoin: () => void }) {
  const [active, setActive] = useState<StoryId>("amara");
  const [seen, setSeen] = useState<ReadonlySet<StoryId>>(() => new Set(["amara"]));
  const [liked, setLiked] = useState<ReadonlySet<StoryId>>(() => new Set());
  const [aligned, setAligned] = useState<ReadonlySet<StoryId>>(() => new Set());
  const [votes, setVotes] = useState<Partial<Record<StoryId, number>>>({});
  const [bursts, setBursts] = useState(0);
  const [mine, setMine] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [prompt, setPrompt] = useState(0);
  const [cheers, setCheers] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mine === null) return;
    const timers = CHEERS_MS.map((ms, i) => setTimeout(() => setCheers(i + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, [mine]);

  const order: StoryId[] = [...(mine === null ? [] : ["you" as const]), ...STORIES.map((story) => story.who)];
  const show = (id: StoryId) => {
    setActive(id);
    setSeen((ids) => new Set(ids).add(id));
  };
  const next = () => show(order[(order.indexOf(active) + 1) % order.length]);
  const toggle = (set: typeof setLiked, id: StoryId) =>
    set((ids) => {
      const copy = new Set(ids);
      if (!copy.delete(id)) copy.add(id);
      return copy;
    });

  const post = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMine(text);
    setDraft("");
    setCheers(0);
    show("you");
    input.current?.blur();
  };

  const story = STORIES.find((s) => s.who === active);
  const name = active === "you" ? "You" : PEOPLE[active];
  const likes =
    (story?.post.kind === "live" ? 0 : (story?.post.likes ?? Math.min(cheers, 3))) + (liked.has(active) ? 1 : 0);

  return (
    <div className={styles.feed}>
      <ul className={styles.stories} aria-label="Stories">
        <li>
          <button
            type="button"
            className={styles.story}
            data-state={active === "you" ? "active" : mine !== null && !seen.has("you") ? "new" : "seen"}
            aria-pressed={active === "you"}
            aria-label={mine === null ? "Add to your story" : "Your story"}
            onClick={() => (mine === null ? input.current?.focus() : show("you"))}
          >
            <span className={styles.ring}>
              <span className={styles.me}>
                <Icon name="user" size={24} tone="current" />
              </span>
              {mine === null && (
                <span className={styles.add}>
                  <Icon name="plus" size={12} tone="current" />
                </span>
              )}
              {active === "you" && <Progress onDone={next} />}
            </span>
            <span className={styles.name}>You</span>
          </button>
        </li>
        {STORIES.map(({ who, post }) => (
          <li key={who}>
            <button
              type="button"
              className={styles.story}
              data-state={active === who ? "active" : seen.has(who) ? "seen" : "new"}
              data-live={post.kind === "live" || undefined}
              aria-pressed={active === who}
              aria-label={`${PEOPLE[who]}’s story${post.kind === "live" ? ", live" : ""}`}
              onClick={() => show(who)}
            >
              <span className={styles.ring}>
                <Image src={face(who)} alt="" width={48} height={48} />
                {post.kind === "live" && <span className={styles.chip}>Live</span>}
                {active === who && <Progress onDone={next} />}
              </span>
              <span className={styles.name}>{PEOPLE[who]}</span>
            </button>
          </li>
        ))}
      </ul>

      {/* The open story's post, swapping in; a double-tap likes it */}
      <Glass
        as="article"
        tone="dark"
        key={active}
        className={styles.post}
        aria-label={`${name === "You" ? "Your" : `${name}’s`} post`}
        onDoubleClick={() => {
          if (story?.post.kind === "live") return;
          if (!liked.has(active)) toggle(setLiked, active);
          setBursts((n) => n + 1);
        }}
      >
        <header className={styles.who}>
          {active === "you" ? (
            <span className={styles.me}>
              <Icon name="user" size={20} tone="current" />
            </span>
          ) : (
            <Image src={face(active)} alt="" width={48} height={48} />
          )}
          <div>
            <strong>{name}</strong>
            <span className={styles.quiet}>{story?.when ?? "Just now"}</span>
          </div>
          {active !== "you" && (
            <Button
              variant="outline"
              size="sm"
              className={styles.pill}
              aria-pressed={aligned.has(active)}
              onClick={() => toggle(setAligned, active)}
            >
              {aligned.has(active) && <Icon name="check" size={16} tone="current" />}
              {aligned.has(active) ? "Aligned" : "Align"}
            </Button>
          )}
        </header>

        <p className={styles.said}>{story?.post.text ?? mine}</p>

        {story?.post.kind === "poll" && (
          <Poll
            options={story.post.options}
            vote={votes[active]}
            onVote={(index) => setVotes((all) => ({ ...all, [active]: index }))}
          />
        )}
        {story?.post.kind === "voice" && <VoiceNote seconds={story.post.seconds} />}

        {story?.post.kind === "live" ? (
          <div className={styles.actions}>
            <span className={styles.quiet}>Space Voice · Creative club</span>
            <Button variant="outline" size="sm" className={styles.pill} aria-pressed={joined} onClick={onJoin}>
              {joined && <Icon name="check" size={16} tone="current" />}
              {joined ? "Listening" : "Listen in"}
            </Button>
          </div>
        ) : (
          <div className={styles.actions}>
            <Button
              variant="outline"
              size="sm"
              className={styles.pill}
              aria-pressed={liked.has(active)}
              onClick={() => toggle(setLiked, active)}
            >
              <Icon name="heart" size={20} tone="current" />
              {likes} {likes === 1 ? "like" : "likes"}
            </Button>
            {story?.post.kind === "poll" ? (
              <span className={styles.quiet}>
                {votes[active] === undefined ? "Tap to vote" : `${pollTotal(story.post.options, votes[active])} votes`}
              </span>
            ) : (
              story && (
                <span className={styles.quiet}>
                  <Icon name="chat" size={16} tone="current" /> {story.post.replies} replies
                </span>
              )
            )}
          </div>
        )}

        {bursts > 0 && (
          <span key={bursts} className={styles.burst} aria-hidden="true">
            <Icon name="heart" size={56} tone="current" />
          </span>
        )}
      </Glass>

      <form className={`cx-liquid cx-liquid--pill cx-glass-dark ${styles.composer}`} onSubmit={post}>
        <span className={styles.me}>
          <Icon name="user" size={16} tone="current" />
        </span>
        <label className={styles.field}>
          <span className="sr-only">Share something with your world</span>
          <input
            ref={input}
            value={draft}
            maxLength={120}
            autoComplete="off"
            onChange={(event) => setDraft(event.target.value)}
          />
          {!draft && (
            <span
              key={prompt}
              className={styles.prompt}
              aria-hidden="true"
              onAnimationEnd={(event) => {
                if (event.target === event.currentTarget) setPrompt((p) => (p + 1) % PROMPTS.length);
              }}
            >
              {[...PROMPTS[prompt]].map((letter, i) => (
                <span key={i} style={{ "--i": i } as CSSProperties}>
                  {letter}
                </span>
              ))}
            </span>
          )}
        </label>
        <Button type="submit" size="sm" className={styles.send} disabled={!draft.trim()}>
          Post
        </Button>
      </form>

      {/* Someone answers what you posted */}
      <div role="status" className={styles.toast} data-leaving={cheers === 4 || undefined}>
        {cheers >= 2 && cheers < 5 && (
          <>
            <Image src={face("amara")} alt="" width={48} height={48} />
            Amara aligned with you
          </>
        )}
      </div>
    </div>
  );
}

/** The open story's timer: a ring drawing round the face, then the next one */
function Progress({ onDone }: { onDone: () => void }) {
  return (
    <svg className={styles.progress} viewBox="0 0 56 56" aria-hidden="true">
      <circle cx="28" cy="28" r="27" pathLength={1} onAnimationEnd={onDone} />
    </svg>
  );
}

const pollTotal = (options: readonly (readonly [string, number])[], vote: number | undefined) =>
  options.reduce((sum, [, count]) => sum + count, 0) + (vote === undefined ? 0 : 1);

function Poll({
  options,
  vote,
  onVote,
}: {
  options: readonly (readonly [string, number])[];
  vote: number | undefined;
  onVote: (index: number) => void;
}) {
  const total = pollTotal(options, vote);
  return (
    <div className={styles.poll} role="group" aria-label="Poll">
      {options.map(([label, count], i) => {
        const share = (count + (vote === i ? 1 : 0)) / total;
        return (
          <button
            key={label}
            type="button"
            className={styles.option}
            aria-pressed={vote === i}
            onClick={() => onVote(i)}
            style={{ "--share": vote === undefined ? 0 : share } as CSSProperties}
          >
            <span className={styles.fill} />
            <span>{label}</span>
            {vote !== undefined && <span>{Math.round(share * 100)}%</span>}
          </button>
        );
      })}
    </div>
  );
}

/** A voice note that plays: the waveform lights up bar by bar */
function VoiceNote({ seconds }: { seconds: number }) {
  const [playing, setPlaying] = useState(false);
  const [round, setRound] = useState(0);
  const [started, setStarted] = useState(false);
  return (
    <div
      className={styles.voice}
      data-started={started || undefined}
      data-playing={playing || undefined}
      style={{ "--length": `${seconds}s` } as CSSProperties}
    >
      <Button
        variant="outline"
        size="icon-sm"
        className={styles.pill}
        aria-label={playing ? "Pause voice note" : "Play voice note"}
        aria-pressed={playing}
        onClick={() => {
          setStarted(true);
          setPlaying(!playing);
        }}
      >
        <Icon name={playing ? "pause" : "play"} size={16} tone="current" />
      </Button>
      <span key={round} className={styles.wave} aria-hidden="true">
        {WAVE.map((height, i) => (
          <i
            key={i}
            style={{ "--h": height, "--i": i } as CSSProperties}
            onAnimationEnd={
              i === WAVE.length - 1
                ? () => {
                    setPlaying(false);
                    setStarted(false);
                    setRound((n) => n + 1);
                  }
                : undefined
            }
          />
        ))}
      </span>
      <span className={styles.quiet}>0:{String(seconds).padStart(2, "0")}</span>
    </div>
  );
}
