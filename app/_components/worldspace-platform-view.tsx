import type { ReactNode } from "react";
import { WorldSpaceLogo } from "@/components/ui/worldspace-logo";
import { PlatformViewShell } from "./platform-view-shell";
import styles from "./worldspace-platform-view.module.css";

/**
 * WorldSpace, set in space, as on the hub and the app's own sign-in. Its feed
 * on the left (stories playing through people's posts, and a composer that
 * posts), a live Space Voice room on the right, orbiting the helmet. Joining
 * from either side takes you into the room. WorldSpace's cyan (the shell's
 * data-hue, set in platform-views.module.css) marks what's live and yours.
 */
export function WorldspacePlatformView({ children }: { children: ReactNode }) {
  return (
    <PlatformViewShell
      name="WorldSpace"
      glass="dark"
      eyebrow={
        <span className={styles.brand}>
          <WorldSpaceLogo size={36} className={styles.mark} />
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
      {children}
    </PlatformViewShell>
  );
}
