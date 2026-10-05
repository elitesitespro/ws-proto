"use client";

import { useState } from "react";
import Image from "next/image";
import { CalendarDays, Check, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlatformViewShell } from "./platform-view-shell";
import styles from "./worldspace-platform-view.module.css";

export function WorldspacePlatformView() {
  const [liked, setLiked] = useState(false);
  const [joined, setJoined] = useState(false);
  const [going, setGoing] = useState(false);
  return (
    <PlatformViewShell
      name="WorldSpace"
      title={
        <>
          Find your people.
          <br />
          <span>Share your world.</span>
        </>
      }
    >
      <div className={styles.board}>
        <section
          className={`${styles.card} ${styles.message}`}
          aria-label="Amara’s post"
        >
          <div className={styles.identity}>
            <Image
              src="/assets/images/amara-avatar.jpg"
              alt=""
              width={40}
              height={40}
            />
            <div>
              <strong>Amara</strong>
              <span className={styles.muted}>Just shared</span>
            </div>
          </div>
          <p>What are you creating this week?</p>
          <Button
            className={styles.like}
            aria-pressed={liked}
            onClick={() => setLiked(!liked)}
          >
            <Heart
              size={20}
              aria-hidden="true"
              fill={liked ? "currentColor" : "none"}
            />
            {liked ? "129" : "128"} likes
          </Button>
        </section>
        <section
          className={`${styles.card} ${styles.post}`}
          aria-label="Creative corner"
        >
          <span className={styles.detail}>Creative corner</span>
          <h4>Good ideas find good company.</h4>
          <div className={styles.people}>
            <div className={styles.avatars} aria-hidden="true">
              {[
                "amara-avatar.jpg",
                "elena-avatar.jpg",
                "active-meeting-1.jpg",
              ].map((src) => (
                <Image
                  key={src}
                  src={`/assets/images/${src}`}
                  alt=""
                  width={40}
                  height={40}
                />
              ))}
            </div>
            <span>Your kind of people.</span>
          </div>
        </section>
        <section
          className={`${styles.card} ${styles.community}`}
          aria-label="Creative club community"
        >
          <div className={styles.heading}>
            <Users size={24} aria-hidden="true" />
            <h4>Creative club</h4>
          </div>
          <p className={styles.detail}>
            Share work. Find collaborators.
          </p>
          <Button
            variant="ghost"
            className={styles.action}
            aria-pressed={joined}
            onClick={() => setJoined(!joined)}
          >
            {joined ? <Check size={20} aria-hidden="true" /> : null}
            {joined ? "Joined" : "Join club"}
          </Button>
        </section>
        <section
          className={`${styles.card} ${styles.event}`}
          aria-label="Design and chill event"
        >
          <div className={styles.heading}>
            <CalendarDays size={24} aria-hidden="true" />
            <span className={styles.detail}>Community hangout</span>
          </div>
          <h4>Design &amp; chill</h4>
          <p className={styles.detail}>
            Fresh faces. New ideas.
          </p>
          <Button
            variant="ghost"
            className={styles.action}
            aria-pressed={going}
            onClick={() => setGoing(!going)}
          >
            {going ? <Check size={20} aria-hidden="true" /> : null}
            {going ? "Interested" : "Count me in"}
          </Button>
        </section>
      </div>
    </PlatformViewShell>
  );
}
