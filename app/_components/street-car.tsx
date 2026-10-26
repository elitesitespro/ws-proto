"use client";

import { useId } from "react";
import { motion, useScroll, useTransform, useVelocity, type MotionStyle } from "motion/react";
import styles from "./street.module.css";

// The WorldStreet mark (public/assets/logos/ws-logo-icon.svg), for the roof
const MARK = "M40.94 25.25L27.6 49L4 7h26.71zM77.9 7L54.3 49L40.94 25.25L51.21 7z";

/**
 * The WorldStreet car: gold, seen from above with its nose down the street
 * and the W on its roof, its headlights thrown on the road ahead. Its lights
 * follow the page: brake lights while it's still, reversing lights while it
 * scrolls back up. Place it with `style` (left, top, rotate, opacity).
 */
export function StreetCar({ className = "", style }: { className?: string; style?: MotionStyle }) {
  const id = useId();
  const { scrollY } = useScroll();
  const speed = useVelocity(scrollY);
  const brake = useTransform(speed, [-40, -8, 8, 40], [0, 1, 1, 0]);
  const reverse = useTransform(speed, [-160, -40], [1, 0]);

  return (
    <motion.div aria-hidden="true" className={`${styles.car} ${className}`} style={style}>
      <span className={styles.beam} />
      <svg viewBox="0 0 24 48">
        <defs>
          <linearGradient id={`${id}paint`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#8a5d03" />
            <stop offset="0.2" stopColor="#dca407" />
            <stop offset="0.5" stopColor="#fcd34d" />
            <stop offset="0.8" stopColor="#dca407" />
            <stop offset="1" stopColor="#8a5d03" />
          </linearGradient>
          <linearGradient id={`${id}glass`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#3a3431" />
            <stop offset="1" stopColor="#0c0a09" />
          </linearGradient>
        </defs>
        {/* The tyres, just showing at its sides */}
        <g fill="#0c0a09">
          <rect x="0.6" y="7" width="3" height="8" rx="1.2" />
          <rect x="20.4" y="7" width="3" height="8" rx="1.2" />
          <rect x="0.6" y="33" width="3" height="8" rx="1.2" />
          <rect x="20.4" y="33" width="3" height="8" rx="1.2" />
        </g>
        <path d="M2 10C2 3.5 5 1 12 1s10 2.5 10 9v28c0 6.5-3 9-10 9S2 44.5 2 38Z" fill={`url(#${id}paint)`} />
        <g fill="#b98305">
          <ellipse cx="1.6" cy="28.5" rx="1.6" ry="1" />
          <ellipse cx="22.4" cy="28.5" rx="1.6" ry="1" />
        </g>
        {/* The rear window, the roof with the W, and the windscreen */}
        <path d="M5.5 10.5Q12 8.6 18.5 10.5L17.6 15.5Q12 14.6 6.4 15.5Z" fill={`url(#${id}glass)`} />
        <rect x="6.2" y="16" width="11.6" height="11.6" rx="3" fill="#facc15" />
        <path d={MARK} transform="translate(7.49 18.72) scale(0.11)" fill="#0c0a09" />
        <path d="M6.4 28.2Q12 27.2 17.6 28.2L18.8 35.4Q12 33.8 5.2 35.4Z" fill={`url(#${id}glass)`} />
        <path d="M8 30.6L10.6 29.7" stroke="#fff" strokeOpacity="0.35" strokeWidth="0.8" strokeLinecap="round" />
        {/* Headlights at the nose; tail lights at the back */}
        <g fill="none" stroke="#fffbeb" strokeWidth="1.4" strokeLinecap="round">
          <path d="M4.2 42.6Q5 45.6 8.4 46.2" />
          <path d="M19.8 42.6Q19 45.6 15.6 46.2" />
        </g>
        <g fill="#7f1d1d">
          <rect x="3.6" y="1.7" width="4.6" height="1.5" rx="0.75" />
          <rect x="15.8" y="1.7" width="4.6" height="1.5" rx="0.75" />
        </g>
        <motion.g className={styles.brake} style={{ opacity: brake }}>
          <rect x="3.6" y="1.7" width="4.6" height="1.5" rx="0.75" />
          <rect x="15.8" y="1.7" width="4.6" height="1.5" rx="0.75" />
        </motion.g>
        <motion.g className={styles.reverse} style={{ opacity: reverse }}>
          <rect x="9" y="1.4" width="2.4" height="1.4" rx="0.7" />
          <rect x="12.6" y="1.4" width="2.4" height="1.4" rx="0.7" />
        </motion.g>
      </svg>
    </motion.div>
  );
}
