"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlatformViewShell, MiniStat, Portrait } from "./platform-view-shell";
import styles from "./platform-views.module.css";
import { useReducedMotion } from "motion/react";
import { Mic, MicOff } from "lucide-react";

export function WorldmeetPlatformView() {
  const [speaker, setSpeaker] = useState(0);
  const [muted, setMuted] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setSpeaker((s) => (s + 1) % 4), 3000);
    return () => clearInterval(id);
  }, [reduced]);
  return (
    <PlatformViewShell
      name="WorldMeet"
      title={
        <>
          Great minds.
          <br />
          <span>One room.</span>
        </>
      }
      extra={
        <>
          <MiniStat value="Meet" label="Bring everyone together" />
          <MiniStat value="Share a link" label="Start the conversation" />
        </>
      }
    >
      <div className={`${styles.panel} ${styles.meeting}`}>
        <div className={styles.row}>
          <strong>Design sync</strong>
          <span className={styles.badge}>
            <i />
            Live demo
          </span>
        </div>
        <div className={styles.people}>
          {["Elena", "Amara", "Josh", "Alex"].map((name, i) => (
            <Portrait
              key={name}
              src={`active-meeting-${i + 1}.jpg`}
              name={name}
              className={speaker === i ? styles.speaker : ""}
            />
          ))}
        </div>
        <div className={styles.row}>
          <span>4 participants</span>
          <div className={styles.tools}>
            <Button
              size="icon"
              aria-label={
                muted ? "Unmute your microphone" : "Mute your microphone"
              }
              aria-pressed={muted}
              onClick={() => setMuted(!muted)}
            >
              {muted ? <MicOff size={20} /> : <Mic size={20} />}
            </Button>
          </div>
        </div>
      </div>
    </PlatformViewShell>
  );
}
