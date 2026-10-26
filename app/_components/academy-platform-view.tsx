import Image from "next/image";
import { PlatformViewShell } from "./platform-view-shell";
import { AcademyPath } from "./academy/academy-path";
import styles from "./academy-platform-view.module.css";

/**
 * WorldStreet Mastery Academy (academy.worldstreetgold.com), in its own
 * dark and gold: its W, its line, and its eight schools on their pedestals
 * beside the path through each.
 */
export function AcademyPlatformView() {
  return (
    <PlatformViewShell
      name="Academy"
      glass="dark"
      eyebrow={
        <span className={styles.brand}>
          <Image src="/assets/academy/mark.webp" alt="" width={36} height={21} />
          Mastery Academy
          <span className={styles.when}>Mon 07:30 · Before the open</span>
        </span>
      }
      title={
        <>
          Learn skills. Build value.
          <br />
          <span className={styles.gold}>Own your future.</span>
        </>
      }
    >
      <AcademyPath />
    </PlatformViewShell>
  );
}
