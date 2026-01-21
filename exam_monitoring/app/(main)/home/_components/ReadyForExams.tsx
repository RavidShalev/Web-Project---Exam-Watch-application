"use client";

import { useState, useEffect } from "react";
import {
  Calculator,
  Book,
  Smartphone,
  Headphones,
  MapPin,
  CheckCircle,
  Circle,
} from "lucide-react";
import { Exam, IconType } from "@/types/examtypes";

const iconMap: Record<IconType, any> = {
  calculator: Calculator,
  book: Book,
  phone: Smartphone,
  headphones: Headphones,
};

type ReadyForExamsProps = {
  exam: Exam;
  onStartExam?: () => Promise<void> | void;
};

export default function ReadyForExams({
  exam,
  onStartExam,
}: ReadyForExamsProps) {
  const [checklist, setChecklist] = useState(exam.checklist);
  const [now, setNow] = useState(Date.now());
  const [starting, setStarting] = useState(false);

  // real-time time check (opens button automatically)
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const FIVE_MINUTES = 5 * 60 * 1000;

  // build exam start time from "HH:mm"
  const [hours, minutes] = exam.startTime.split(":").map(Number);
  const examDate = new Date();
  examDate.setHours(hours, minutes, 0, 0);
  const examStartTime = examDate.getTime();

  const canStartByTime = now >= examStartTime - FIVE_MINUTES;

  // checklist logic
  const toggleItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isDone: !item.isDone } : item
      )
    );
  };

  const allDone = checklist.every((item) => item.isDone);
  const canStartExam = allDone && canStartByTime && !starting;

  return (
    <div className="flex flex-col gap-6 p-4 w-full bg-[var(--bg)] min-h-screen">
      <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--border)]">
        <h1 className="text-2xl font-bold mb-4 text-center text-[var(--fg)]">
          איזור מוכנות לקראת המבחן הקרב
        </h1>
        <span className="flex justify-center items-center gap-2 mb-6 text-[var(--muted)]">
          ({exam.courseCode}) {exam.courseName}
        </span>
      </div>

      <div className="flex bg-[var(--accent)/10] p-3 rounded-full text-[var(--accent)] items-center justify-center gap-2">
        <MapPin size={32} />
        <span>{exam.location}</span>
      </div>

      {/* rules */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-[var(--fg)]">
          כללי המבחן:
        </h3>

        <div className="flex gap-4 overflow-x-auto pb-2 justify-center">
          {exam.rules.map((rule) => {
            const IconComponent = iconMap[rule.icon];
            return (
              <div
                key={rule.id}
                className={`flex flex-col items-center justify-center min-w-[80px] h-20 rounded-xl border-2 ${
                  rule.allowed
                    ? "bg-green-500/10 border-green-500/30 text-green-600"
                    : "bg-red-500/10 border-red-500/30 text-red-600"
                }`}
              >
                <IconComponent size={24} />
                <span className="text-xs mt-1">{rule.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* checklist */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-[var(--fg)]">
          צ'ק ליסט:
        </h3>

        <div className="flex flex-col gap-3">
          {checklist.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`flex items-center justify-center p-3 rounded-xl border-2 transition ${
                item.isDone
                  ? "bg-green-500/10 border-green-500/30 text-green-600"
                  : "bg-[var(--surface)] border-[var(--border)] text-[var(--fg)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              {item.isDone ? <CheckCircle size={24} /> : <Circle size={24} />}
              <span className="ml-2">{item.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* info message */}
      {!canStartByTime && (
        <p className="text-sm text-center text-[var(--muted)]">
          ניתן להתחיל את המבחן החל מ־5 דקות לפני שעת ההתחלה
        </p>
      )}

      {/* start exam */}
      <button
        disabled={!canStartExam}
        onClick={async () => {
          if (starting) return;
          setStarting(true);
          await onStartExam?.();
        }}
        className={`mt-6 w-full py-3 rounded-xl font-semibold text-white transition ${
          canStartExam
            ? "bg-[var(--accent)] hover:opacity-90"
            : "bg-[var(--border)] cursor-not-allowed"
        }`}
      >
        {starting ? "מתחיל מבחן..." : "התחל מבחן"}
      </button>
    </div>
  );
}
