"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlatformViewShell, MiniStat } from "./platform-view-shell";
import styles from "./platform-views.module.css";
import { Mic, MicOff } from "lucide-react";

export function WorldcallPlatformView() {
  const [muted, setMuted] = useState(false);
  const [seconds, setSeconds] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <PlatformViewShell
      name="WorldCall"
      title={
        <>
          A familiar voice.
          <br />
          <span>A little closer.</span>
        </>
      }
      extra={
        <>
          <MiniStat value="Voice" label="Make time to catch up" />
          <MiniStat value="One account" label="Stay connected" />
        </>
      }
    >
      <div
        className={`${styles.panel} ${styles.call} ${muted ? styles.paused : ""}`}
      >
        <div className={styles.caller}>
          <Image
            src="/assets/images/elena-avatar.jpg"
            alt="Elena"
            fill
            sizes="160px"
            className={styles.cover}
          />
        </div>
        <div className={styles.callInfo}>
          <span className={styles.accent}>Demo call</span>
          <strong className={styles.large}>Elena</strong>
          <span className="tabular-nums">
            {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
          </span>
          <div className={styles.wave} aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} style={{ animationDelay: `${i * 0.13}s` }} />
            ))}
          </div>
          <div className={styles.tools}>
            <Button
              size="icon"
              aria-label={muted ? "Unmute microphone" : "Mute microphone"}
              aria-pressed={muted}
              onClick={() => setMuted(!muted)}
            >
              {muted ? <MicOff size={20} /> : <Mic size={20} />}
            </Button>
            <span>{muted ? "Muted" : "Voice on"}</span>
          </div>
        </div>
      </div>
    </PlatformViewShell>
  );
}
