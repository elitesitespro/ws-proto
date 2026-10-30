"use client";

import Image from "next/image";
import { useState } from "react";
import { Icon, type IconName } from "@/components/icon";
import styles from "./embassy-trip.module.css";

// Four trips from Lagos, each at its own point (illustrative: the names,
// times and weather are made up). `done`: how many of the steps are behind it.
const TRIPS = [
  {
    id: "lisbon",
    city: "Lisbon",
    code: "LIS",
    photo: "/assets/embassy/lisbon.webp",
    weather: { temp: 22, sky: "Clear skies", icon: "sun" },
    visa: "Schengen visa",
    stay: "four nights in Alfama",
    done: 4,
  },
  {
    id: "london",
    city: "London",
    code: "LHR",
    photo: "/assets/embassy/london.webp",
    weather: { temp: 14, sky: "Light cloud", icon: "cloud" },
    visa: "UK visitor visa",
    stay: "a week in Shoreditch",
    done: 2,
  },
  {
    id: "dubai",
    city: "Dubai",
    code: "DXB",
    photo: "/assets/embassy/dubai.webp",
    weather: { temp: 31, sky: "Warm evening", icon: "sun" },
    visa: "UAE tourist visa",
    stay: "five nights by the Marina",
    done: 3,
  },
  {
    id: "toronto",
    city: "Toronto",
    code: "YYZ",
    photo: "/assets/embassy/toronto.webp",
    weather: { temp: 9, sky: "Breezy", icon: "cloud" },
    visa: "Canada visitor visa",
    stay: "ten days with family",
    done: 1,
  },
] as const satisfies readonly {
  id: string;
  city: string;
  code: string;
  photo: string;
  weather: { temp: number; sky: string; icon: IconName };
  visa: string;
  stay: string;
  done: number;
}[];
type Trip = (typeof TRIPS)[number];

function stepsOf(trip: Trip) {
  return [
    { title: "Trip opened", detail: "Amaka is your consultant from here on" },
    { title: "Passport renewal booked", detail: "Biometrics on Thursday, 10:00" },
    { title: `${trip.visa} filed`, detail: "Every form checked before it goes in" },
    { title: "Flight and hotel held", detail: `LOS → ${trip.code} · ${trip.stay}` },
  ];
}

/**
 * E-Embassy: where you're going, and every step there with one consultant.
 * Pick a trip: its city at blue hour in an arch, the weather there now, and
 * the steps (the passport, the visa, the flight and the hotel), the ones
 * behind it ticked, the one it's on lit. The trip that's all done has its
 * visa approved.
 */
export function EmbassyTrip() {
  const [shown, setShown] = useState<Trip["id"]>("lisbon");
  const trip = TRIPS.find((t) => t.id === shown) ?? TRIPS[0];
  const steps = stepsOf(trip);
  const approved = trip.done >= steps.length;

  return (
    <div className={styles.desk}>
      <figure className={styles.arch}>
        {TRIPS.map((t) => (
          <Image
            key={t.id}
            src={t.photo}
            alt={t.id === shown ? `${t.city} at blue hour` : ""}
            fill
            sizes="(min-width: 760px) 360px, 100vw"
            className={styles.photo}
            data-shown={t.id === shown || undefined}
          />
        ))}
        <figcaption className={styles.weather}>
          <span className={styles.where}>{trip.city.toUpperCase()} · NOW</span>
          <span className={styles.temp}>
            <Icon name={trip.weather.icon} size={18} tone="current" />
            {trip.weather.temp}°
          </span>
          <span className={styles.sky}>{trip.weather.sky}</span>
        </figcaption>
        {approved && (
          <p className={styles.approved}>
            <Icon name="check-circle" size={18} tone="current" />
            <span>
              <b>Visa approved</b>
              <small>Amaka, your consultant · Fri 11:20</small>
            </span>
          </p>
        )}
      </figure>

      <div className={styles.card}>
        <div className={styles.whereTo} role="group" aria-label="Where to?">
          <span className={styles.label}>Where to?</span>
          <div className={styles.chips}>
            {TRIPS.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={t.id === shown}
                className={styles.chip}
                onClick={() => setShown(t.id)}
              >
                {t.city}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.route}>
          <span className={styles.leg}>
            <b>LOS</b>
            <small>Lagos</small>
          </span>
          <span className={styles.flight} aria-hidden="true">
            <i />
            <Icon name="navigation" size={16} tone="current" />
            <i />
          </span>
          <span className={styles.leg}>
            <b>{trip.code}</b>
            <small>{trip.city}</small>
          </span>
        </div>

        <ol className={styles.steps} aria-label={`Your trip to ${trip.city}`}>
          {steps.map((step, i) => {
            const state = i < trip.done ? "done" : i === trip.done ? "now" : "next";
            return (
              <li key={step.title} className={styles.step} data-state={state}>
                <span className={styles.stepDot} aria-hidden="true">
                  {state === "done" ? <Icon name="check" size={12} tone="current" /> : null}
                </span>
                <span className={styles.stepText}>
                  <b>{step.title}</b>
                  <small>{step.detail}</small>
                </span>
                <span className={styles.stepState}>
                  {state === "done" ? "Done" : state === "now" ? "In progress" : "Next"}
                </span>
              </li>
            );
          })}
        </ol>

        <p className={styles.consultant}>
          <span className={styles.avatar} aria-hidden="true">
            A
          </span>
          <span>
            <b>Amaka</b> handles your whole trip. Ask before nine, hear back the same day.
          </span>
        </p>
      </div>
    </div>
  );
}
