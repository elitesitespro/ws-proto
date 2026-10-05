"use client";
import {
  Camera,
  Clapperboard,
  Gamepad2,
  Heart,
  Radio,
  WandSparkles,
} from "lucide-react";
import { Photo, Status, Walkthrough } from "./walkthrough";
import s from "./walkthrough.module.css";

const captions = [
  [
    "Find a room that catches your eye.",
    "You're watching Amara live.",
    "Send some love to the host.",
    "A conversation worth staying for.",
  ],
  [
    "Give your room a name.",
    "Check your camera and sound.",
    "Your room is going live.",
    "Your first viewers are here.",
  ],
  [
    "Find your next watch.",
    "Open the film details.",
    "Pick up where you left off.",
    "Your watch progress is saved.",
  ],
  [
    "Start with a simple idea.",
    "Turn the idea into a storyboard.",
    "Arrange your scenes.",
    "Your short film is ready to preview.",
  ],
  [
    "Choose a quick challenge.",
    "Meet your opponent.",
    "Make your move.",
    "Round complete. Nicely played.",
  ],
] as const;
const actions = [
  ["Enter room", "React", "Join chat", "Replay"],
  ["Check setup", "Go live", "Welcome viewers", "Replay"],
  ["View film", "Play preview", "Save progress", "Replay"],
  ["Build scenes", "Arrange clips", "Preview film", "Replay"],
  ["Start game", "Play round", "See score", "Replay"],
] as const;
export function EntertainmentScene({ step }: { step: number }) {
  return (
    <Walkthrough
      brand={["Xtream", "Xtream studio", "Vsion", "AI Movie", "Arcade"][step]}
      captions={captions[step]}
      actions={actions[step]}
      tone="entertainment"
    >
      {({ stage, progress }) => (
        <>
          {step === 0 && (
            <div className={s.broadcast}>
              <Photo src="xtream-live.webp" alt="Creator hosting a live room" />
              <div className={s.broadcastTop}>
                <span className={s.redPill}>
                  <Radio size={20} />
                  {stage ? "Live" : "For you"}
                </span>
                <span>{stage > 1 ? "2.4k watching" : "Creator spotlight"}</span>
              </div>
              <div className={s.broadcastBottom}>
                <h3>Inside the creative process.</h3>
                <span>@amara · Art & conversation</span>
                <div className={s.chat} data-show={stage >= 1}>
                  Jay: How did you get started?
                </div>
                <div className={s.chat} data-show={stage >= 2}>
                  <Heart size={20} />
                  You sent some love
                </div>
                <div className={s.chat} data-show={stage >= 3}>
                  Amara: Thanks for being here!
                </div>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className={s.studio}>
              <div className={s.camera}>
                <Photo src="active-meeting-1.jpg" alt="Host camera preview" />
                <span className={s.redPill}>
                  <Camera size={20} />
                  {stage >= 2 ? "On air" : "Preview"}
                </span>
                {stage === 2 && (
                  <strong className={s.countdown}>
                    {Math.max(1, Math.ceil((6500 - progress * 9000) / 850))}
                  </strong>
                )}
              </div>
              <div className={s.panel}>
                <span className={s.muted}>Room title</span>
                <h3>
                  {stage === 0
                    ? "Designing a better".slice(
                        0,
                        Math.max(1, Math.floor(progress * 90)),
                      )
                    : "Designing a better day"}
                  <span className={s.accent}>.</span>
                </h3>
                <div className={s.row}>
                  <span>Camera</span>
                  <span className={s.accent}>
                    {stage ? "Ready" : "Checking"}
                  </span>
                </div>
                <div className={s.row}>
                  <span>Microphone</span>
                  <span className={s.accent}>
                    {stage ? "Ready" : "Checking"}
                  </span>
                </div>
                {stage === 3 && <Status>12 viewers joined</Status>}
              </div>
            </div>
          )}
          {step === 2 && (
            <div className={s.cinema}>
              <Photo src="dune-0.jpg" alt="Dune: Part Two film artwork" />
              <div className={s.cinemaCopy}>
                <span>Tonight’s pick</span>
                <h3>Dune: Part Two</h3>
                <p className={s.detail}>A journey beyond the familiar.</p>
                {stage >= 1 && (
                  <span className={s.status}>
                    <Clapperboard size={20} />
                    Sci-fi · Adventure
                  </span>
                )}
                <div className={s.progress}>
                  <i
                    style={{
                      width: `${stage < 2 ? 0 : Math.min(100, (progress - 0.44) * 180)}%`,
                    }}
                  />
                </div>
                <span>
                  {stage >= 3
                    ? "Added to continue watching"
                    : stage === 2
                      ? "Preview playing"
                      : "Ready when you are"}
                </span>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className={s.filmEditor}>
              <div className={s.prompt}>
                <WandSparkles size={24} />
                <p>
                  {stage === 0
                    ? "A quiet city wakes up in golden light.".slice(
                        0,
                        Math.max(1, Math.floor(progress * 160)),
                      )
                    : "A quiet city wakes up in golden light."}
                </p>
              </div>
              <div className={s.storyboard}>
                {["The city", "First light", "A new day"].map((label, i) => (
                  <div key={label} data-show={stage >= 1}>
                    <div className={`${s.storyArt} ${s[`art${i}`]}`}>
                      <span>0{i + 1}</span>
                    </div>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <div className={s.editTrack} data-show={stage >= 2}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <i key={i} />
                ))}
                <b
                  style={{
                    left: `${Math.min(96, Math.max(0, (progress - 0.44) * 172))}%`,
                  }}
                />
              </div>
              {stage === 3 && <Status>Sequence ready · 00:12</Status>}
            </div>
          )}
          {step === 4 && (
            <div className={s.game}>
              <div className={s.gameScore}>
                <Gamepad2 size={28} />
                <span>
                  You <b>{stage === 3 ? "120" : "0"}</b>
                </span>
                <span>
                  Jay <b>80</b>
                </span>
              </div>
              <h3>
                {stage === 3 ? "You found the match." : "Find your match."}
              </h3>
              <div className={s.gameBoard}>
                {["✦", "○", "△", "△", "✦", "○"].map((symbol, i) => (
                  <div
                    key={i}
                    data-flipped={stage >= 2 && (i === 0 || i === 4)}
                  >
                    {stage >= 2 && (i === 0 || i === 4) ? symbol : "?"}
                  </div>
                ))}
              </div>
              <span className={s.muted}>
                {stage === 0
                  ? "Memory match · Quick play"
                  : stage === 1
                    ? "Jay is ready. Your turn."
                    : stage === 2
                      ? "Two stars. One match."
                      : "+40 points this round"}
              </span>
            </div>
          )}
        </>
      )}
    </Walkthrough>
  );
}
