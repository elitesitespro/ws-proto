"use client";
import { ArrowDownUp, Bitcoin, Check, Globe2, TrendingUp } from "lucide-react";
import { Chart, Status, Walkthrough } from "./walkthrough";
import s from "./walkthrough.module.css";
const captions = [
  [
    "Choose a market to follow.",
    "Watch the price movement.",
    "Set a demo price alert.",
    "Your alert is ready.",
  ],
  [
    "Your orders at a glance.",
    "Open an order to see the details.",
    "Review the demo status.",
    "A clear record of your activity.",
  ],
  [
    "Explore digital assets.",
    "Open Bitcoin's market view.",
    "Compare its recent movement.",
    "Added to your watchlist.",
  ],
  [
    "See the wider market picture.",
    "Open the economic calendar.",
    "Read the event details.",
    "Save it for later.",
  ],
  [
    "Find an event to explore.",
    "Compare the possible outcomes.",
    "See how the market has moved.",
    "Follow the event for updates.",
  ],
] as const;
const actions = [
  ["Open chart", "Set alert", "Save alert", "Replay"],
  ["View order", "Check status", "View activity", "Replay"],
  ["Open Bitcoin", "View movement", "Watch asset", "Replay"],
  ["Open calendar", "View event", "Save event", "Replay"],
  ["View event", "Compare outcomes", "Follow event", "Replay"],
] as const;
export function MarketsScene({ step }: { step: number }) {
  return (
    <Walkthrough
      brand={
        ["Forex", "Market orders", "Crypto", "Market calendar", "Prediction"][
          step
        ]
      }
      captions={captions[step]}
      actions={actions[step]}
      tone="markets"
    >
      {({ stage, progress }) => (
        <>
          {step === 0 && (
            <div className={s.market}>
              <div className={s.row}>
                <span className={s.status}>
                  <Globe2 size={20} />
                  EUR / USD
                </span>
                <span>24h</span>
              </div>
              <strong className={s.quote}>
                {(1.0842 + Math.min(progress, 0.7) * 0.002).toFixed(4)}
              </strong>
              <span className={s.accent}>+0.18% · Illustrative</span>
              <Chart progress={Math.min(1, progress * 2)} />
              <div className={s.marketFoot}>
                {stage < 2 ? (
                  "Price movement"
                ) : stage === 2 ? (
                  "Alert when price reaches 1.0900"
                ) : (
                  <Status>Price alert saved · 1.0900</Status>
                )}
              </div>
            </div>
          )}
          {step === 1 && (
            <div className={s.orders}>
              <h3>Your order book</h3>
              <div className={s.orderRow} data-active={stage >= 1}>
                <ArrowDownUp size={24} />
                <div>
                  <strong>EUR / USD</strong>
                  <span className={s.muted}>Limit · Buy · Demo</span>
                </div>
                <span>{stage >= 2 ? "Filled" : "Open"}</span>
              </div>
              <div className={`${s.orderRow} ${s.detail}`}>
                <Bitcoin size={24} />
                <div>
                  <strong>BTC / USD</strong>
                  <span className={s.muted}>Limit · Demo</span>
                </div>
                <span>Open</span>
              </div>
              <div className={s.orderDetail} data-show={stage >= 1}>
                <div className={s.row}>
                  <span>Price</span>
                  <strong>1.0850</strong>
                </div>
                <div className={s.row}>
                  <span>Units</span>
                  <strong>100</strong>
                </div>
                <div className={s.orderSteps}>
                  {["Placed", "Processing", "Recorded"].map((label, i) => (
                    <span key={label} data-done={stage >= i + 1}>
                      <Check size={20} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className={s.crypto}>
              <div className={s.assetRail}>
                {["Bitcoin", "Ethereum", "Solana"].map((label, i) => (
                  <span key={label} data-active={i === 0 && stage >= 1}>
                    {label}
                  </span>
                ))}
              </div>
              <div className={s.assetDetail}>
                <Bitcoin size={40} />
                <h3>Bitcoin</h3>
                <strong className={s.quote}>
                  $
                  {Math.round(
                    67240 + Math.min(progress, 0.7) * 210,
                  ).toLocaleString("en-US")}
                </strong>
                <span className={s.accent}>+2.8% today</span>
                <Chart progress={Math.min(1, progress * 2)} />
                {stage === 3 ? (
                  <Status>On your watchlist</Status>
                ) : (
                  <span className={s.muted}>BTC / USD · Demo prices</span>
                )}
              </div>
            </div>
          )}
          {step === 3 && (
            <div className={s.calendar}>
              <div className={s.calendarDate}>
                <Globe2 size={32} />
                <span>Economic calendar</span>
                <strong>24</strong>
                <span>October · Sample event</span>
              </div>
              <div className={s.calendarInfo}>
                <span className={s.status}>USD · Economic data</span>
                <h3>Inflation report</h3>
                <div className={s.row}>
                  <span>Previous</span>
                  <strong>2.9%</strong>
                </div>
                <div className={s.row}>
                  <span>Forecast</span>
                  <strong>2.8%</strong>
                </div>
                <p className={s.detail} data-show={stage >= 2}>
                  A snapshot of changes in consumer prices.
                </p>
                {stage === 3 && <Status>Saved to your calendar</Status>}
              </div>
            </div>
          )}
          {step === 4 && (
            <div className={s.prediction}>
              <span className={s.status}>
                <TrendingUp size={20} />
                Crypto · Sample event
              </span>
              <h3>Will Bitcoin reach $100k this year?</h3>
              <div className={s.odds}>
                <div>
                  <strong>{stage >= 2 ? "64" : "62"}%</strong>
                  <span>Yes</span>
                </div>
                <div>
                  <strong>{stage >= 2 ? "36" : "38"}%</strong>
                  <span>No</span>
                </div>
              </div>
              <div className={s.oddsBar}>
                <i style={{ width: stage >= 2 ? "64%" : "62%" }} />
              </div>
              <div className={s.row}>
                <span>Market sentiment</span>
                <span>Demo data</span>
              </div>
              {stage === 3 && <Status>Following this event</Status>}
            </div>
          )}
        </>
      )}
    </Walkthrough>
  );
}
