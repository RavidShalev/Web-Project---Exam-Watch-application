export type RemainingTime={
    hours: number;
    minutes: number;
    seconds: number;
    diffInMs: number;
}

export function getRemainingTime(examStartTime: string, examDurationMinutes: number): RemainingTime {
    const startTime = new Date(examStartTime).getTime();
    const endTime = startTime + examDurationMinutes * 60 * 1000;
    const now = Date.now();
    // use Math.max to avoid negative remaining time in the end of the exam
    const diffInMs = Math.max(0, endTime - now); 
    // change diffInMs to hours, minutes, seconds
    const hours = Math.floor(diffInMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffInMs % (1000 * 60)) / 1000);
    return { hours, minutes, seconds, diffInMs };
}