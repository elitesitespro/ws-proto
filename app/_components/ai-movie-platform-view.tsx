"use client";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlatformViewShell } from "./platform-view-shell";
import styles from "./platform-views.module.css";
import { Clapperboard } from "lucide-react";

export function AiMoviePlatformView() {
  const [scene, setScene] = useState(0);
  return (
    <PlatformViewShell
      name="AI Movie"
      title={
        <>
          From a spark.
          <br />
          <span>To the big screen.</span>
        </>
      }
      controls={
        <>
          {["Scene 01", "Scene 02"].map((name, i) => (
            <Button
              key={name}
              variant="ghost"
              aria-pressed={scene === i}
              onClick={() => setScene(i)}
            >
              {name}
            </Button>
          ))}
        </>
      }
    >
      <div className={styles.panel}>
        <div className={styles.row}>
          <strong>The next frontier</strong>
          <Clapperboard size={24} />
        </div>
        <div className={styles.studio}>
          <div className={styles.script}>
            <strong>{scene ? "Int. Studio" : "Ext. Desert"}</strong>
            <p>
              {scene
                ? "Light enters the room. A new story begins."
                : "A traveller follows the light across the sand."}
            </p>
            <span className={`${styles.muted} ${styles.secondaryDetail}`}>
              Script → characters → scene
            </span>
          </div>
          <div className={styles.storyboard}>
            <Image
              key={scene}
              src={`/assets/images/${scene ? "academy-course.jpg" : "dune-0.jpg"}`}
              alt="Illustrative storyboard frame"
              fill
              sizes="300px"
              className={styles.cover}
            />
            <span>Storyboard preview</span>
          </div>
        </div>
        <div
          className={styles.timeline}
          aria-label="Illustrative editing timeline"
        >
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} />
          ))}
        </div>
      </div>
    </PlatformViewShell>
  );
}
