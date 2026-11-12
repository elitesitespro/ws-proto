"use client";

import { useState } from "react";
import { WorldspaceFeed } from "./worldspace-feed";
import { WorldspaceRoom } from "./worldspace-room";
import styles from "../worldspace-platform-view.module.css";

/**
 * WorldSpace's demo: its feed on the left (stories playing through people's
 * posts, and a composer that posts), a live Space Voice room on the right,
 * orbiting the helmet. Joining from either side takes you into the room.
 */
export function WorldspaceSpace() {
  const [joined, setJoined] = useState(false);
  const join = () => setJoined(!joined);
  return (
    <div className={styles.space}>
      <WorldspaceFeed joined={joined} onJoin={join} />
      <WorldspaceRoom joined={joined} onJoin={join} />
    </div>
  );
}
