"use client";

import { use, useEffect, useState } from "react";
import { getRemainingTime, RemainingTime } from "../../../lib/TimeUtils";

type ExamTimerProps = {
    duration: number; // duration in minutes
    startTime: string;
};

export default function ExamTimer({ duration, startTime }: ExamTimerProps) {
    const [remainingTime, setRemainingTime] = useState<RemainingTime>(
        getRemainingTime(startTime, duration)
    );
    // run when component mounts and when duration or startTime changes
    useEffect(() => {
        // set interval to update remaining time every second
        const interval = setInterval(() => {
            setRemainingTime(getRemainingTime(startTime, duration));
        }, 1000); 
        return () => clearInterval(interval); // cleanup on unmount
    }, [duration, startTime]);

    // return the remaining time in HH:MM:SS format (add leading zeros if needed)
    return (
        <div>
            {`${remainingTime.hours.toString().padStart(2, '0')}:${remainingTime.minutes
                .toString()
                .padStart(2, '0')}:${remainingTime.seconds.toString().padStart(2, '0')}`}
        </div>
    );
}
