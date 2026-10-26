"use client";

import { useState } from "react";
import Image from "next/image";
import { PlatformViewShell } from "./platform-view-shell";
import { WorldspaceFeed } from "./worldspace/worldspace-feed";
import { WorldspaceRoom } from "./worldspace/worldspace-room";
import styles from "./worldspace-platform-view.module.css";

/**
 * WorldSpace, set in space, as on the hub and the app's own sign-in. Its feed
 * on the left (stories playing through people's posts, and a composer that
 * posts), a live Space Voice room on the right, orbiting the helmet. Joining
 * from either side takes you into the room. WorldSpace's cyan (the shell's
 * data-hue, set in platform-views.module.css) marks what's live and yours.
 */
export function WorldspacePlatformView() {
  const [joined, setJoined] = useState(false);
  const join = () => setJoined(!joined);

  return (
    <PlatformViewShell
      name="WorldSpace"
      glass="dark"
      eyebrow={
        <span className={styles.brand}>
          <Image src="/assets/worldspace/mark.webp" alt="" width={40} height={25} className={styles.mark} />
          WorldSpace
        </span>
      }
      title={
        <>
          Find your people.
          <br />
          <span>Share your </span>
          <span className={styles.marked}>
            world.
            {/* A hand-drawn W under the word, drawing itself in */}
            <svg aria-hidden="true" viewBox="0 0 120 24" preserveAspectRatio="none" className={styles.stroke}>
              <path d="M3 7 L31 19 L59 6 L88 19 L117 6" pathLength={1} />
            </svg>
          </span>
        </>
      }
    >
      <div className={styles.space}>
        <WorldspaceFeed joined={joined} onJoin={join} />
        <WorldspaceRoom joined={joined} onJoin={join} />
      </div>
    </PlatformViewShell>
  );
}
