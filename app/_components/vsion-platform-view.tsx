"use client";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlatformViewShell } from "./platform-view-shell";
import styles from "./platform-views.module.css";
import { Film } from "lucide-react";

export function VsionPlatformView() {
  const [party, setParty] = useState(false);
  return (
    <PlatformViewShell
      name="Vsion"
      title={
        <>
          Something great.
          <br />
          <span>Worth watching.</span>
        </>
      }
      controls={
        <>
          {["Film night", "Together"].map((name, i) => (
            <Button
              key={name}
              variant="ghost"
              aria-pressed={party === Boolean(i)}
              onClick={() => setParty(Boolean(i))}
            >
              {name}
            </Button>
          ))}
        </>
      }
    >
      <div className={styles.cinema}>
        <div className={`${styles.row} ${styles.cinemaTop}`}>
          <span className={styles.badge}>
            {party ? "Watch party" : "Featured film"}
          </span>
          <Film size={24} />
        </div>
        <div className={styles.cinemaCopy}>
          <strong className={styles.cinemaTitle}>DUNE</strong>
          <span>Part two · Sci-fi</span>
          <div className={styles.row}>
            <p>
              {party
                ? "Your people. Your front row."
                : "A world beyond the ordinary."}
            </p>
            {party && (
              <div className={styles.avatars}>
                {["elena-avatar.jpg", "amara-avatar.jpg"].map((src) => (
                  <Image
                    key={src}
                    src={`/assets/images/${src}`}
                    alt="Sample viewer"
                    width={32}
                    height={32}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PlatformViewShell>
  );
}
