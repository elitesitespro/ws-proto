"use client";

import { useEffect, useState } from "react";

export function MeetingTimer() {
  const [seconds, setSeconds] = useState(1);

  useEffect(() => {
    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      setSeconds(1 + Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = String(seconds % 60).padStart(2, "0");

  return (
    <span role="timer" aria-label="Meeting duration" aria-live="off" className="tabular-nums">
      {minutes}:{remainingSeconds}
    </span>
  );
}
