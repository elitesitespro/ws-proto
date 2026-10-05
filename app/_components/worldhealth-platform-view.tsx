"use client";

import { useState } from "react";
import Image from "next/image";
import { Video, Phone, MessageCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlatformViewShell } from "./platform-view-shell";
import styles from "./worldhealth-platform-view.module.css";

const modes = [
  {
    name: "Video",
    Icon: Video,
    title: "Face to face.",
    detail: "From your space.",
  },
  {
    name: "Audio",
    Icon: Phone,
    title: "Time to talk.",
    detail: "Connect by voice.",
  },
  {
    name: "Chat",
    Icon: MessageCircle,
    title: "Start with a hello.",
    detail: "Put your questions into words.",
  },
];

export function WorldhealthPlatformView() {
  const [mode, setMode] = useState(0);
  const selected = modes[mode];
  return (
    <PlatformViewShell
      name="WorldHealth"
      title={
        <>
          Care that fits
          <br />
          <span>your world.</span>
        </>
      }
      controls={modes.map(({ name, Icon }, i) => (
        <Button
          key={name}
          variant="ghost"
          aria-pressed={mode === i}
          onClick={() => setMode(i)}
        >
          <Icon size={20} aria-hidden="true" />
          {name}
        </Button>
      ))}
    >
      <div className={styles.board}>
        <div className={styles.portrait}>
          <Image
            src="/assets/images/active-meeting-2.jpg"
            alt="Person in a sample consultation"
            fill
            sizes="(max-width: 600px) 144px, 320px"
          />
          <span>
            <Heart size={20} aria-hidden="true" /> A human connection
          </span>
        </div>
        <div className={styles.summary}>
          <span className={styles.eyebrow}>Your care, your way</span>
          <div className={styles.modeIcon}>
            <selected.Icon size={32} aria-hidden="true" />
          </div>
          <div className={styles.message} aria-live="polite">
            <h4>{selected.title}</h4>
            <p>{selected.detail}</p>
          </div>
          <div className={styles.note}>
            <span />
            Choose how you connect.
          </div>
        </div>
      </div>
    </PlatformViewShell>
  );
}
