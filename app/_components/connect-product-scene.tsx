"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Check,
  RotateCcw,
  Heart,
  MessageCircle,
  Mic,
  MicOff,
  MonitorUp,
  Phone,
  Users,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./connect-product-scene.module.css";

const stories = [
  ["WorldSpace", "A thought becomes a conversation.", "Create posts"],
  ["WorldSpace", "Find a corner that feels like you.", "Join communities"],
  ["WorldCall", "A familiar voice. A little closer.", "Make one-to-one calls"],
  ["WorldMeet", "Bring everyone into the room.", "Start video meetings"],
  ["WorldMeet", "Make room for your next big idea.", "Share your screen"],
];
const people = ["Amara", "Elena", "Jay", "Alex"];
function Avatar({ src, size = 40 }: { src: string; size?: number }) {
  return (
    <Image
      src={`/assets/images/${src}`}
      alt=""
      width={size}
      height={size}
      className={styles.avatar}
    />
  );
}
function AudioBars({ paused = false }: { paused?: boolean }) {
  return (
    <div className={styles.wave} data-paused={paused} aria-hidden="true">
      {Array.from({ length: 17 }, (_, i) => (
        <i
          key={i}
          style={{
            animationDelay: `${i * -0.13}s`,
            height: `${16 + (i % 5) * 8}px`,
          }}
        />
      ))}
    </div>
  );
}

export function ConnectProductScene({ step }: { step: number }) {
  const [run, setRun] = useState(0);
  return (
    <Walkthrough
      key={`${step}-${run}`}
      step={step}
      onReplay={() => setRun(run + 1)}
    />
  );
}

function Walkthrough({
  step,
  onReplay,
}: {
  step: number;
  onReplay: () => void;
}) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [elapsed, setElapsed] = useState(0);
  const [manual, setManual] = useState(false);
  const [selection, setSelected] = useState<boolean | null>(null);
  useEffect(() => {
    const element = sceneRef.current;
    if (!element || manual) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;
    let time = 0;
    let visible = false;
    const stop = () => {
      clearInterval(timer);
      timer = undefined;
    };
    const sync = () => {
      stop();
      if (!visible || document.hidden) return;
      if (reduced.matches) {
        setElapsed(12000);
        return;
      }
      timer = setInterval(() => {
        time = Math.min(12000, time + 80);
        setElapsed(time);
        if (time === 12000) stop();
      }, 80);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && entry.intersectionRatio >= 0.6;
        sync();
      },
      { threshold: [0, 0.6] },
    );
    observer.observe(element);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
    };
  }, [manual]);
  const selected =
    selection ??
    (step === 0
      ? elapsed >= 4800
      : step === 1
        ? elapsed >= 2800
        : step === 2
          ? elapsed >= 4000
          : step === 4
            ? elapsed < 2400
            : false);
  const message = "A little art. A new perspective.";
  const typing = step === 0 && !selected && !manual;
  const typed = message.slice(0, Math.max(0, Math.floor((elapsed - 600) / 80)));
  const joinedCount = Math.min(4, 1 + Math.floor(elapsed / 900));
  const activeSpeaker = Math.floor(Math.max(0, elapsed - 3200) / 2000) % 4;
  const instruction =
    step === 0
      ? selected
        ? "Your post is now in the feed"
        : elapsed >= 4000
          ? "Share your post"
          : "Write something worth sharing"
      : step === 1
        ? selected
          ? "You're in. Say hello!"
          : "Find your people"
        : step === 2
          ? selected
            ? "Connected. Start talking."
            : elapsed >= 1600
              ? "Calling Elena…"
              : "Choose a contact"
          : step === 3
            ? joinedCount < 4
              ? "Your team is joining…"
              : "The conversation is underway"
            : selected
              ? "Choose what to share"
              : "Everyone can follow along";
  const [liked, setLiked] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speakersPaused, setSpeakersPaused] = useState(false);
  const story = stories[step];
  return (
    <div
      ref={sceneRef}
      className={styles.scene}
      data-playing={!manual && elapsed < 12000}
      onClickCapture={() => setManual(true)}
    >
      <span className={styles.srOnly} aria-live="polite">
        {instruction}
      </span>
      <header className={styles.header}>
        <span>{story[0]}</span>
        <span className={styles.muted}>{instruction}</span>
        <Button
          variant="ghost"
          size="icon"
          className={styles.replay}
          aria-label="Replay walkthrough"
          onClick={onReplay}
        >
          <RotateCcw size={20} />
        </Button>
      </header>
      <div className={styles.visual}>
        {step === 0 && (
          <div
            className={`${styles.post} ${styles.surface}`}
            data-published={selected}
          >
            <div className={styles.identity}>
              <Avatar src="amara-avatar.jpg" />
              <div>
                <strong>Amara Okafor</strong>
                <span className={styles.muted}>
                  {selected ? "Just shared · Your feed" : "Creating a post"}
                </span>
              </div>
              <span className={styles.status}>
                {selected ? "Published" : "Draft"}
              </span>
            </div>
            <div className={styles.postImage}>
              <Image
                src="/assets/images/academy-course.jpg"
                alt="Art materials in a creative workspace"
                fill
                sizes="(max-width: 600px) 240px, 560px"
              />
            </div>
            <p>
              <span className={styles.typedText}>
                {typing ? typed || "Write a post…" : message}
              </span>
              {typing && (
                <span className={styles.caret} aria-hidden="true">
                  |
                </span>
              )}
              {selected && (
                <span className={styles.feedReply}>Elena: Love this! ✨</span>
              )}
            </p>
            <div className={styles.actions}>
              <Button
                variant="ghost"
                className={styles.secondary}
                aria-label="Like sample post"
                aria-pressed={liked}
                onClick={() => setLiked(!liked)}
              >
                <Heart size={20} fill={liked ? "currentColor" : "none"} />
                <span className={styles.likeCount}>{liked ? 129 : 128}</span>
              </Button>
              <Button
                className={styles.primary}
                data-pressing={!manual && elapsed >= 4200 && elapsed < 4800}
                onClick={() => setSelected(!selected)}
              >
                {selected ? <Check size={20} /> : <MessageCircle size={20} />}
                {selected ? "Shared" : "Share post"}
              </Button>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className={styles.community}>
            <div className={styles.clubArt} aria-hidden="true">
              <span>
                Make.
                <br />
                Share.
                <br />
                Belong.
              </span>
              <Users size={64} />
            </div>
            <div
              className={`${styles.surface} ${styles.clubDetails}`}
              data-joined={selected}
            >
              <span className={styles.eyebrow}>Your people are here</span>
              <h4>Creative club</h4>
              <p className={styles.muted}>
                {selected
                  ? "Amara: Welcome aboard! Share what you’re working on."
                  : "A place for unfinished ideas and fresh perspectives."}
              </p>
              <div className={styles.members}>
                {[
                  "amara-avatar.jpg",
                  "elena-avatar.jpg",
                  "active-meeting-1.jpg",
                ].map((src) => (
                  <Avatar key={src} src={src} />
                ))}
                <span>
                  {selected ? "Welcome to the club!" : "2.4k members"}
                </span>
              </div>
              <Button
                className={styles.primary}
                aria-pressed={selected}
                data-pressing={!manual && elapsed >= 2200 && elapsed < 2800}
                onClick={() => setSelected(!selected)}
              >
                {selected ? <Check size={20} /> : <Users size={20} />}
                {selected ? "Joined" : "Join community"}
              </Button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className={styles.call}>
            <div
              className={styles.callPortrait}
              data-ringing={!manual && elapsed >= 1600 && elapsed < 4000}
            >
              <Avatar src="elena-avatar.jpg" size={144} />
              <span className={styles.callBadge}>
                <Phone size={24} />
              </span>
            </div>
            <h4>Elena Morgan</h4>
            <span className={styles.muted}>
              {selected
                ? "Connected · voice call"
                : elapsed >= 1600
                  ? "Calling Elena…"
                  : "Ready when you are"}
            </span>
            <AudioBars
              paused={!selected || muted || (!manual && elapsed >= 12000)}
            />
            <div className={styles.actions}>
              <Button
                className={styles.secondary}
                size="icon"
                aria-label="Mute sample call"
                aria-pressed={muted}
                onClick={() => setMuted(!muted)}
              >
                {muted ? <MicOff size={24} /> : <Mic size={24} />}
              </Button>
              <Button
                className={styles.primary}
                data-pressing={!manual && elapsed >= 1200 && elapsed < 1600}
                onClick={() => setSelected(!selected)}
              >
                <Phone size={20} />
                {selected
                  ? "End call"
                  : !manual && elapsed >= 1600
                    ? "Calling…"
                    : "Connect"}
              </Button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className={styles.meeting}>
            <div className={styles.meetingHeader}>
              <div>
                <h4>Design sync</h4>
                <span className={styles.muted}>
                  4 people. One shared space.
                </span>
              </div>
              <span className={styles.live}>
                {joinedCount < 4 && !manual ? "Joining" : "Live"}
              </span>
            </div>
            <div
              className={styles.participants}
              data-paused={speakersPaused || (!manual && elapsed >= 12000)}
              data-manual={manual}
            >
              {people.map((name, i) => (
                <div
                  className={styles.participant}
                  key={name}
                  data-visible={manual || i < joinedCount}
                  data-speaking={i === activeSpeaker}
                  style={{ animationDelay: `${i * -2}s` }}
                >
                  <Image
                    src={`/assets/images/active-meeting-${i + 1}.jpg`}
                    alt={name}
                    fill
                    sizes="(max-width: 600px) 120px, 280px"
                  />
                  <span>{name}</span>
                  <Mic size={20} />
                </div>
              ))}
            </div>
            <div className={styles.dock}>
              <Video size={24} aria-hidden="true" />
              <Button
                className={styles.secondary}
                aria-pressed={speakersPaused}
                onClick={() => setSpeakersPaused(!speakersPaused)}
              >
                {speakersPaused ? "Resume activity" : "Pause activity"}
              </Button>
            </div>
          </div>
        )}
        {step === 4 && (
          <div className={styles.share}>
            <div className={styles.screenHeader}>
              <MonitorUp size={20} />
              <span>
                {selected ? "Choose your screen" : "Amara is presenting"}
              </span>
            </div>
            <div
              className={styles.sharedCanvas}
              data-sharing={!selected}
              data-revealed={manual || elapsed >= 6000}
            >
              <span className={styles.eyebrow}>The next chapter</span>
              <h4>
                Ideas worth
                <br />
                making together.
              </h4>
              <div className={styles.notes}>
                <span>Find the story</span>
                <span>Make it yours</span>
                <span>Share it out</span>
              </div>
              {!selected && elapsed < 10000 && !manual && (
                <span className={styles.cursor} aria-hidden="true">
                  ↖ Elena
                </span>
              )}
              {selected && (
                <div className={styles.shareChooser}>
                  <MonitorUp size={32} />
                  <span>Project presentation</span>
                  <span className={styles.muted}>Ready to share</span>
                </div>
              )}
            </div>
            <div className={styles.shareFooter}>
              <div className={styles.members}>
                <Avatar src="amara-avatar.jpg" />
                <Avatar src="elena-avatar.jpg" />
              </div>
              <Button
                className={styles.secondary}
                data-pressing={!manual && elapsed >= 1800 && elapsed < 2400}
                aria-pressed={selected}
                onClick={() => setSelected(!selected)}
              >
                {selected ? "Share screen" : "Stop sharing"}
              </Button>
            </div>
          </div>
        )}
      </div>
      <footer className={styles.footer}>
        <span className={styles.muted}>
          0{step + 1} / 05 · {story[2]}
        </span>
        <h3>{story[1]}</h3>
      </footer>
    </div>
  );
}
