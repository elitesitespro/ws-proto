"use client";
import {
  BriefcaseBusiness,
  Check,
  Headphones,
  Heart,
  MapPin,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { Photo, Status, Walkthrough } from "./walkthrough";
import s from "./walkthrough.module.css";
const captions = [
  [
    "A little discovery for your day.",
    "Find the details that matter.",
    "Choose the finish you love.",
    "Saved to your bag.",
  ],
  [
    "Your bag, ready to go.",
    "Check delivery and payment.",
    "Confirm your demo purchase.",
    "You're all set. Order received.",
  ],
  [
    "Find work that fits your skills.",
    "Take a closer look at the role.",
    "Share your profile.",
    "Your application is on its way.",
  ],
  [
    "Pick something you want to learn.",
    "Join the course.",
    "Start your first lesson.",
    "One step closer to your next skill.",
  ],
  [
    "Make a little room for yourself.",
    "Choose today's routine.",
    "Follow a gentle breathing session.",
    "A small step. A better day.",
  ],
] as const;
const actions = [
  ["View product", "Choose finish", "Add to bag", "Replay"],
  ["Checkout", "Review order", "Confirm demo", "Replay"],
  ["View role", "Use profile", "Apply in demo", "Replay"],
  ["View course", "Join course", "Start lesson", "Replay"],
  ["Choose routine", "Start session", "Complete session", "Replay"],
] as const;
export function LifestyleScene({ step }: { step: number }) {
  return (
    <Walkthrough
      brand={
        [
          "WorldStore",
          "WorldStore checkout",
          "WorkWorld",
          "Academy",
          "WorldHealth",
        ][step]
      }
      captions={captions[step]}
      actions={actions[step]}
      tone="lifestyle"
    >
      {({ stage, progress }) => (
        <>
          {step === 0 && (
            <div className={s.product}>
              <div className={s.productArt} data-finish={stage >= 2}>
                <Headphones size={160} strokeWidth={1} />
                <span>Everyday sound.</span>
              </div>
              <div className={s.productCopy}>
                <span className={s.muted}>The everyday collection</span>
                <h3>Studio headphones</h3>
                <strong className={s.price}>$129</strong>
                <div className={s.swatches}>
                  <i data-selected={stage < 2} />
                  <i data-selected={stage >= 2} />
                  <span>{stage >= 2 ? "Sage" : "Midnight"}</span>
                </div>
                {stage === 3 ? (
                  <Status>Added to your bag</Status>
                ) : (
                  <p className={s.detail}>
                    Wireless comfort, wherever the day takes you.
                  </p>
                )}
              </div>
            </div>
          )}
          {step === 1 && (
            <div className={s.receipt}>
              <div className={s.receiptIcon}>
                {stage === 3 ? <Check size={40} /> : <ShoppingBag size={40} />}
              </div>
              <h3>{stage === 3 ? "It's in the bag." : "Your order"}</h3>
              <div className={s.row}>
                <span>Studio headphones</span>
                <span>$129</span>
              </div>
              <div className={s.row}>
                <span>Delivery</span>
                <span>Included</span>
              </div>
              <div className={s.row}>
                <strong>Total</strong>
                <strong>$129</strong>
              </div>
              <div className={s.receiptNote}>
                {stage === 0
                  ? "1 item · Sage finish"
                  : stage === 1
                    ? "Home delivery · Demo wallet"
                    : stage === 2
                      ? "Reviewing your order…"
                      : "Order WS-2048 · Confirmed"}
              </div>
              <span className={s.muted}>Demo only · No payment taken</span>
            </div>
          )}
          {step === 2 && (
            <div className={s.work}>
              <div className={s.map} aria-hidden="true">
                <i />
                <i />
                <i />
                <MapPin size={48} />
                <span>Remote, together.</span>
              </div>
              <div className={s.job}>
                <span className={s.status}>
                  <BriefcaseBusiness size={20} />
                  Design · Remote
                </span>
                <h3>Product designer</h3>
                <span>Studio North</span>
                <p className={s.detail}>
                  Build thoughtful digital experiences with a small, curious
                  team.
                </p>
                <div className={s.row}>
                  <span>
                    {stage < 2 ? "Your experience" : "Profile attached"}
                  </span>
                  <Check size={20} />
                </div>
                {stage === 3 && <Status>Application sent</Status>}
              </div>
            </div>
          )}
          {step === 3 && (
            <div className={s.course}>
              <Photo
                src="academy-course.jpg"
                alt="Art tools for a visual storytelling course"
              />
              <div className={s.courseCopy}>
                <span className={s.status}>Design · 12 lessons</span>
                <h3>The art of visual stories</h3>
                <span>
                  {stage === 0
                    ? "Make your ideas seen."
                    : stage === 1
                      ? "You're enrolled"
                      : stage === 2
                        ? "Lesson 1 · Finding your story"
                        : "Lesson 1 complete"}
                </span>
                <div className={s.progress}>
                  <i
                    style={{
                      width: `${stage < 2 ? 0 : Math.min(100, (progress - 0.44) * 180)}%`,
                    }}
                  />
                </div>
                <span className={s.muted}>
                  {stage === 3
                    ? "Next up: Shape and composition"
                    : "Learn at your own pace"}
                </span>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className={s.wellness}>
              <div
                className={s.breathe}
                style={{
                  transform: `scale(${stage === 2 ? 1 + Math.sin((progress - 0.44) * Math.PI * 7) * 0.06 : 1})`,
                }}
              >
                <Heart size={32} />
                <strong>
                  {stage < 2
                    ? "A moment for you"
                    : stage === 2
                      ? progress < 0.58
                        ? "Breathe in"
                        : "Breathe out"
                      : "Well done"}
                </strong>
              </div>
              <div className={s.routine}>
                <span>
                  <Sparkles size={20} />
                  Mindful minute
                </span>
                <div className={s.row}>
                  <span>Today’s routine</span>
                  <span>{stage === 3 ? "Complete" : "1 minute"}</span>
                </div>
                <div className={s.days}>
                  {["M", "T", "W", "T", "F"].map((d, i) => (
                    <span key={i} data-done={i < 2 || (i === 2 && stage === 3)}>
                      {i < 2 || (i === 2 && stage === 3) ? (
                        <Check size={20} />
                      ) : (
                        d
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Walkthrough>
  );
}
