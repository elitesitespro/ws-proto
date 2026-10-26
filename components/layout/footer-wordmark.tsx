"use client";

import { useRef, type PointerEvent } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import styles from "./footer-wordmark.module.css";

/**
 * The name, the width of the page, in the gold dots the world above it is
 * made of. It rises the last of the way as the page ends, and the dots under
 * your pointer light up (or your finger, for a moment after it lifts).
 */
export function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["40%", "0%"]);

  const lifted = useRef(0);
  const light = (event: PointerEvent<HTMLDivElement>) => {
    const mark = ref.current;
    if (!mark) return;
    window.clearTimeout(lifted.current);
    const box = mark.getBoundingClientRect();
    mark.style.setProperty("--mx", `${event.clientX - box.left}px`);
    mark.style.setProperty("--my", `${event.clientY - box.top}px`);
    mark.dataset.lit = "";
  };
  const dim = () => ref.current?.removeAttribute("data-lit");
  const lift = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") lifted.current = window.setTimeout(dim, 900);
  };

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={styles.mark}
      onPointerDown={light}
      onPointerMove={light}
      onPointerUp={lift}
      onPointerCancel={lift}
      onPointerLeave={(event) => event.pointerType !== "touch" && dim()}
    >
      <motion.div className={styles.word} style={{ y: reduce ? 0 : y }}>
        <span className={styles.dots}>WorldStreet</span>
        <span className={styles.lit}>WorldStreet</span>
      </motion.div>
    </div>
  );
}
