"use client";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlatformViewShell } from "./platform-view-shell";
import styles from "./platform-views.module.css";
import { MapPin, Wrench } from "lucide-react";

export function WorkworldPlatformView() {
  const [service, setService] = useState(0);
  return (
    <PlatformViewShell
      name="WorkWorld"
      title={
        <>
          Good people.
          <br />
          <span>Great work.</span>
        </>
      }
      controls={
        <>
          {["Repairs", "Design", "Install"].map((n, i) => (
            <Button
              key={n}
              variant="ghost"
              aria-pressed={service === i}
              onClick={() => setService(i)}
            >
              {n}
            </Button>
          ))}
        </>
      }
    >
      <div className={styles.map}>
        <span className={styles.mapLabel}>Your neighbourhood</span>
        <div className={styles.nearbyPin}>
          <Wrench size={20} />
          <span>Local skills</span>
        </div>
        <div className={styles.pin}>
          <MapPin size={24} />
        </div>
        <div className={`${styles.panel} ${styles.provider}`}>
          <div className={styles.row}>
            <div className={styles.identity}>
              <Image
                src="/assets/images/amara-avatar.jpg"
                alt="Sample service provider"
                width={40}
                height={40}
              />
              <div>
                <strong>
                  {
                    ["Home repairs", "Interior design", "Electrical setup"][
                      service
                    ]
                  }
                </strong>
                <p className={styles.muted}>Find the right person</p>
              </div>
            </div>
            <Wrench size={24} />
          </div>
          <p className={styles.compactHide}>
            Local skills. Real possibilities.
          </p>
        </div>
      </div>
    </PlatformViewShell>
  );
}
