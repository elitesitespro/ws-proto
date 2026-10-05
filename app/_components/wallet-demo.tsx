"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDownLeft,
  ArrowRight,
  Check,
  Headphones,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Wallet,
  BriefcaseBusiness,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import s from "./wallet-demo.module.css";

type Kind = "Pay" | "Receive" | "Track" | "Move";
const captions: Record<Kind, string[]> = {
  Pay: ["Review your purchase", "Confirm with your wallet", "Payment complete"],
  Receive: [
    "Your earnings are on the way",
    "Payment received",
    "Balance updated",
  ],
  Track: [
    "Your activity, together",
    "New transactions appear",
    "See where your money goes",
  ],
  Move: [
    "Choose a supported service",
    "Moving $50 to Xtream",
    "Ready to use in Xtream",
  ],
};

export function WalletDemo({ kind }: { kind: Kind }) {
  const [run, setRun] = useState(0);
  return <Demo key={run} kind={kind} replay={() => setRun((v) => v + 1)} />;
}

function Demo({ kind, replay }: { kind: Kind; replay: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const elapsed = useRef(0);
  const [time, setTime] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    const stop = () => clearInterval(timer);
    const sync = () => {
      stop();
      if (!visible || document.hidden) return;
      if (motion.matches) {
        elapsed.current = 7000;
        setTime(7000);
        return;
      }
      if (paused || elapsed.current >= 7000) return;
      timer = setInterval(() => {
        elapsed.current = Math.min(7000, elapsed.current + 100);
        setTime(elapsed.current);
        if (elapsed.current === 7000) stop();
      }, 100);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.intersectionRatio >= 0.5;
        sync();
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
    };
  }, [paused]);
  const stage = time < 2200 ? 0 : time < 4400 ? 1 : 2;
  const done = time === 7000;
  const amount = Math.round(
    1200 + 250 * Math.min(1, Math.max(0, (time - 2200) / 2200)),
  );
  const move = Math.min(1, Math.max(0, (time - 2200) / 2200));
  return (
    <div
      ref={root}
      className={s.demo}
      data-kind={kind}
      data-wallet-stage={stage}
      data-paused={paused}
    >
      <header className={s.header}>
        <span>
          <Wallet /> Demo
        </span>
        <div>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`${paused ? "Play" : "Pause"} ${kind} demo`}
            disabled={done}
            onClick={() => setPaused((v) => !v)}
          >
            {paused ? <Play /> : <Pause />}
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Replay ${kind} demo`}
            onClick={replay}
          >
            <RotateCcw />
          </Button>
        </div>
      </header>
      <div className={s.body}>
        {kind === "Pay" && (
          <div className={s.checkout}>
            <div className={s.product}>
              <Headphones aria-hidden="true" />
              <span>WorldStreet shop</span>
            </div>
            <div className={s.row}>
              <span>Studio headphones</span>
              <strong>$129</strong>
            </div>
            <div className={s.balance}>
              <Wallet />
              <span>
                Wallet balance
                <strong>${stage === 2 ? "1,071" : "1,200"}.00</strong>
              </span>
            </div>
            <Button
              className={s.action}
              data-pressed={stage === 1}
              onClick={() => {
                elapsed.current = 4400;
                setTime(4400);
              }}
            >
              {stage === 2 ? (
                <>
                  <Check /> Paid
                </>
              ) : (
                <>
                  Pay $129 <ArrowRight />
                </>
              )}
            </Button>
          </div>
        )}
        {kind === "Receive" && (
          <div className={s.receive}>
            <div className={s.signal}>
              <ArrowDownLeft />
            </div>
            <span>Available balance</span>
            <strong className={s.total}>
              ${amount.toLocaleString("en-US")}
            </strong>
            <div className={s.receipt} data-visible={stage > 0}>
              <BriefcaseBusiness />
              <div>
                Project payment<strong>+$250.00</strong>
                <span>From WorkWorld</span>
              </div>
              <Check />
            </div>
          </div>
        )}
        {kind === "Track" && (
          <div className={s.track}>
            <div className={s.row}>
              <span>This week</span>
              <strong>Activity</strong>
            </div>
            <div className={s.bars} aria-label="Demo weekly spending chart">
              {[32, 56, 40, 80, 48, 64, 96].map((height, i) => (
                <i
                  key={i}
                  style={{ height: `${stage === 2 ? height : 16}%` }}
                />
              ))}
            </div>
            <div className={s.transaction}>
              <BriefcaseBusiness />
              <span>
                WorkWorld<small>Project earnings</small>
              </span>
              <strong>+$250</strong>
            </div>
            <div className={s.transaction} data-visible={stage > 0}>
              <Headphones />
              <span>
                Shop<small>Headphones</small>
              </span>
              <strong>−$129</strong>
            </div>
            <div className={s.transaction} data-visible={stage === 2}>
              <Radio />
              <span>
                Xtream<small>Balance transfer</small>
              </span>
              <strong>−$50</strong>
            </div>
          </div>
        )}
        {kind === "Move" && (
          <div className={s.move}>
            <div className={s.account}>
              <Wallet />
              <span>
                Universal wallet
                <strong>
                  ${Math.round(1200 - move * 50).toLocaleString("en-US")}
                </strong>
              </span>
            </div>
            <div className={s.route}>
              <span
                className={s.packet}
                style={{ transform: `translateY(${move * 64}px)` }}
              >
                $50 <ArrowDownLeft />
              </span>
            </div>
            <div className={s.account}>
              <Radio />
              <span>
                Xtream<strong>${Math.round(move * 50)}.00</strong>
              </span>
              {stage === 2 && <Check />}
            </div>
            <span className={s.note}>
              {stage === 2
                ? "Transfer complete"
                : "One wallet. Connected services."}
            </span>
          </div>
        )}
      </div>
      <footer className={s.footer}>
        <div className={s.progress}>
          <i style={{ transform: `scaleX(${time / 7000})` }} />
        </div>
        <p aria-live="polite">{captions[kind][stage]}</p>
      </footer>
    </div>
  );
}
