"use client";

import { useEffect, useState } from "react";
import { getRemainingTime, RemainingTime } from "../../../lib/TimeUtils";

type ExamTimerProps = {
  duration: number;
  startTime: string;
};

export default function ExamTimer({ duration, startTime }: ExamTimerProps) {
  const [remainingTime, setRemainingTime] = useState<RemainingTime>(
    getRemainingTime(startTime, duration)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime(getRemainingTime(startTime, duration));
    }, 1000);
    return () => clearInterval(interval);
  }, [duration, startTime]);

  return (
    <div
      className="
        flex items-center justify-center
        font-extrabold tracking-widest text-center
        text-white bg-[var(--accent)]
        rounded-3xl border border-[var(--border)] shadow-lg

        text-4xl px-5 py-4
        sm:text-5xl sm:px-8 sm:py-5
        md:text-6xl md:px-10 md:py-6
        lg:text-7xl
      "
    >
      {`${remainingTime.hours.toString().padStart(2, "0")}:${remainingTime.minutes
        .toString()
        .padStart(2, "0")}:${remainingTime.seconds
        .toString()
        .padStart(2, "0")}`}
    </div>
  );
}
