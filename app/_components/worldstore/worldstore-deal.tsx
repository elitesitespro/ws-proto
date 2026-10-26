"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/icon";
import styles from "./worldstore-deal.module.css";

type Listing = {
  id: string;
  title: string;
  price: number;
  was?: number;
  where: string;
  seller: string;
  rating: number;
  image: string;
  /** A photo fills the frame; a cut-out sits on the spotlight */
  photo?: boolean;
  /** Vehicles and property have no escrow on WorldStore */
  escrow: boolean;
  tag?: "new";
};
type Step = "browse" | "offered" | "agreed" | "requested" | "held" | "dispatched" | "transit" | "delivered" | "released" | "viewing";

// Illustrative listings from sellers near you (the tote and the Camry are
// worldstreetgold.com's own)
const LISTINGS: readonly Listing[] = [
  { id: "tote", title: "Leather tote", price: 45000, was: 56250, where: "Lekki, Lagos", seller: "Ada's Leather", rating: 4.8, image: "/assets/worldstore/tote.webp", photo: true, escrow: true },
  { id: "perfume", title: "Amber perfume", price: 28000, where: "Ikeja, Lagos", seller: "Scent House", rating: 4.6, image: "/assets/worldstore/perfume.webp", escrow: true },
  { id: "vase", title: "Clay vase", price: 12500, where: "Wuse, Abuja", seller: "Kiln & Co", rating: 4.9, image: "/assets/worldstore/vase.webp", escrow: true },
  { id: "camry", title: "Toyota Camry 2015", price: 9800000, where: "Ikeja, Lagos", seller: "Tayo Motors", rating: 4.5, image: "/assets/worldstore/camry.webp", photo: true, escrow: false, tag: "new" },
];
// WorldStore's quick offers: 90, 85 or 80% of the asking price
const OFFERS = [90, 85, 80];
// Once paid, the order moves on by itself until it's at your door
const SHIPPING: readonly Step[] = ["held", "dispatched", "transit", "delivered"];
const TRACK: readonly [Step, string][] = [
  ["held", "Held"],
  ["dispatched", "Dispatched"],
  ["transit", "On its way"],
  ["delivered", "Delivered"],
];

const naira = (n: number) =>
  n >= 1_000_000 ? `₦${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M` : `₦${n.toLocaleString("en-NG")}`;
// Offers land on round numbers, as people make them
const round = (n: number) => Math.round(n / (n >= 1_000_000 ? 50_000 : 500)) * (n >= 1_000_000 ? 50_000 : 500);

/**
 * A WorldStore deal, start to finish. No cart: pick a listing, make an offer
 * in chat, and the seller sends a payment request. Pay it through WorldStore
 * and the money is held while the item comes to you; confirm it arrived and
 * the seller is paid. Vehicles have no escrow, so for the Camry you book a
 * viewing instead.
 */
export function WorldstoreDeal() {
  const [listing, setListing] = useState(LISTINGS[0]);
  const [step, setStep] = useState<Step>("browse");
  const [offer, setOffer] = useState(0);
  const [saved, setSaved] = useState<string[]>([]);

  const agreed = offer >= 85 ? round((listing.price * offer) / 100) : round((listing.price * 85) / 100);

  // The seller answers, then the deal moves along by itself where it would
  useEffect(() => {
    const after: Partial<Record<Step, [Step, number]>> = {
      offered: ["agreed", 1300],
      agreed: [listing.escrow ? "requested" : "agreed", 900],
      held: ["dispatched", 1300],
      dispatched: ["transit", 1300],
      transit: ["delivered", 1400],
    };
    const next = after[step];
    if (!next || next[0] === step) return;
    const timer = setTimeout(() => setStep(next[0]), next[1]);
    return () => clearTimeout(timer);
  }, [step, listing]);

  const pick = (next: Listing) => {
    setListing(next);
    setStep("browse");
    setOffer(0);
  };
  const isSaved = saved.includes(listing.id);
  const reached = (s: Step) => SHIPPING.indexOf(step) >= SHIPPING.indexOf(s) || step === "released";

  return (
    <div className={styles.stage}>
      <section className={styles.listing} aria-label={listing.title}>
        <div className={styles.shot} data-photo={listing.photo || undefined}>
          <Image
            key={listing.id}
            src={listing.image}
            alt={listing.title}
            fill
            sizes="(max-width: 1023px) 90vw, 400px"
            className={styles.picture}
          />
          {listing.was && (
            <span className={styles.off}>−{Math.round((1 - listing.price / listing.was) * 100)}%</span>
          )}
          {listing.tag === "new" && <span className={styles.new}>New in</span>}
          <button
            type="button"
            className={styles.save}
            aria-pressed={isSaved}
            aria-label={isSaved ? `Saved ${listing.title}` : `Save ${listing.title}`}
            onClick={() => setSaved(isSaved ? saved.filter((id) => id !== listing.id) : [...saved, listing.id])}
          >
            <Icon name="heart" size={16} tone="current" />
          </button>
        </div>
        <div className={styles.facts}>
          <span>
            <strong>{listing.title}</strong>
            <small>
              <Icon name="map-pin" size={12} tone="current" /> {listing.where}
            </small>
          </span>
          <span className={styles.price}>
            {listing.was && <s>{naira(listing.was)}</s>}
            <b className="tabular-nums">{naira(listing.price)}</b>
          </span>
        </div>
        <div className={styles.thumbs} role="group" aria-label="Near you">
          {LISTINGS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={item.id === listing.id}
              aria-label={`${item.title}, ${naira(item.price)}`}
              data-photo={item.photo || undefined}
              onClick={() => pick(item)}
            >
              <Image src={item.image} alt="" fill sizes="64px" />
            </button>
          ))}
        </div>
      </section>

      {/* The deal, in chat with the seller */}
      <section className={styles.deal} aria-label={`Deal with ${listing.seller}`}>
        <header className={styles.seller}>
          <span className={styles.initials} aria-hidden="true">
            {listing.seller
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)}
          </span>
          <span>
            <strong>{listing.seller}</strong>
            <small>
              <Icon name="star" size={12} tone="current" /> {listing.rating} · {listing.where.split(",")[0]}
            </small>
          </span>
        </header>

        <ol key={listing.id} className={styles.chat} aria-live="polite">
          <li className={styles.note}>
            <Icon name="shield-check" size={12} tone="current" />
            Keep the chat and the payment on WorldStore
          </li>
          <li data-from="you">Hi, is the {listing.title.toLowerCase()} still available?</li>
          <li data-from="seller">Hi! It’s still available.</li>
          {step !== "browse" && (
            <li data-from="you">Would you take {naira(round((listing.price * offer) / 100))}?</li>
          )}
          {step !== "browse" && step !== "offered" && (
            <li data-from="seller">
              {offer >= 85 ? "Deal." : `I can do ${naira(agreed)}.`}{" "}
              {listing.escrow ? "Sending you a payment request." : "Come and see it first."}
            </li>
          )}
          {step === "offered" && (
            <li data-from="seller" className={styles.typing} aria-label={`${listing.seller} is typing`}>
              <i />
              <i />
              <i />
            </li>
          )}
        </ol>

        {/* What you can do next */}
        <div className={styles.next}>
          {step === "browse" && (
            <>
              <span className={styles.label}>Make an offer</span>
              <div className={styles.offers}>
                {OFFERS.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      setOffer(pct);
                      setStep("offered");
                    }}
                  >
                    <b className="tabular-nums">{naira(round((listing.price * pct) / 100))}</b>
                    <small>{pct}%</small>
                  </button>
                ))}
              </div>
            </>
          )}
          {step === "offered" && <span className={styles.label}>Offer sent. Waiting for {listing.seller}…</span>}

          {listing.escrow && step === "requested" && (
            <div className={styles.request}>
              <span>
                <small>Payment request</small>
                <b className="tabular-nums">{naira(agreed)}</b>
              </span>
              <button type="button" className={styles.primary} onClick={() => setStep("held")}>
                <Icon name="lock" size={16} tone="current" />
                Pay into escrow
              </button>
            </div>
          )}

          {listing.escrow && SHIPPING.concat("released").includes(step) && (
            <div className={styles.escrow}>
              <p className={styles.held} data-released={step === "released" || undefined}>
                <span>
                  <Icon name={step === "released" ? "check" : "lock"} size={16} tone="current" />
                </span>
                {step === "released"
                  ? `${naira(agreed)} released to ${listing.seller}`
                  : `${naira(agreed)} held until you confirm it arrived`}
              </p>
              <ol className={styles.track}>
                {TRACK.map(([s, label]) => (
                  <li key={s} data-done={reached(s) || undefined}>
                    {label}
                  </li>
                ))}
              </ol>
              {step === "delivered" && (
                <button type="button" className={styles.primary} onClick={() => setStep("released")}>
                  <Icon name="check-circle" size={16} tone="current" />
                  It arrived as described
                </button>
              )}
              {step === "released" && (
                <button type="button" className={styles.quiet} onClick={() => pick(listing)}>
                  Start another deal
                </button>
              )}
            </div>
          )}

          {!listing.escrow && step === "agreed" && (
            <div className={styles.inPerson}>
              <p>No escrow for vehicles. Inspect it in person before you pay, and never pay a deposit to hold a viewing.</p>
              <button type="button" className={styles.primary} onClick={() => setStep("viewing")}>
                <Icon name="calendar" size={16} tone="current" />
                Book a viewing
              </button>
            </div>
          )}
          {step === "viewing" && (
            <p className={styles.booked}>
              <Icon name="calendar-check" size={16} tone="current" />
              Viewing booked: Saturday, 11:00, {listing.where.split(",")[0]}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
