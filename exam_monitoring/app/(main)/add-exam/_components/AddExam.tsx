"use client";

import { useState } from "react";
import "../../../globals.css";

type AddExamFormProps = {
  onSuccess?: () => void;
};

export default function AddExamForm({ onSuccess }: AddExamFormProps) {
  const [formData, setFormData] = useState({
    courseName: "",
    courseCode: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    supervisors: "",
    lecturers: "",
  });

  const [rules, setRules] = useState({
    calculator: false,
    computer: false,
    headphones: false,
    openBook: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!name) return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const courseName = String(formData.courseName ?? "");
    const courseCode = String(formData.courseCode ?? "");

    if (!courseName.trim() || !courseCode.trim()) {
      alert("שם קורס וקוד קורס הם שדות חובה");
      return;
    }

    if (!Number.isInteger(Number(formData.courseCode))) {
      alert("קוד קורס חייב להיות מספר שלם");
      return;
    }

    const supervisorsTz = formData.supervisors
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const lecturersTz = formData.lecturers
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean);

    const res = await fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        supervisorsTz,
        lecturersTz,
      }),
    });

    const data = await res.json();

    if (res.status === 409) {
      alert("לא ניתן ליצור מבחן: הכיתה תפוסה בטווח הזמן שנבחר.");
      return;
    }

    if (!res.ok) {
      alert(data.message || "אירעה שגיאה. נסי שוב.");
      return;
    }

    alert("המבחן נוסף בהצלחה!");
    onSuccess?.();
  };

  return (
    <div className="mt-10 flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg space-y-5 rounded-xl border border-border bg-bg p-8 shadow-md"
      >
        <h2 className="mb-4 text-center text-2xl font-semibold text-fg">
          הוספת מבחן
        </h2>

        {/* Course Name */}
        <div>
          <label className="mb-1 block text-sm font-medium text-muted">
            שם הקורס
          </label>
          <input
            type="text"
            name="courseName"
            value={formData.courseName}
            onChange={handleChange}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-fg
                       focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Course Code */}
        <div>
          <label className="mb-1 block text-sm font-medium text-muted">
            קוד הקורס
          </label>
          <input
            type="number"
            name="courseCode"
            value={formData.courseCode}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                setFormData((prev) => ({
                  ...prev,
                  courseCode: value,
                }));
              }
            }}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-fg
                       focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Date */}
        <div>
          <label className="mb-1 block text-sm font-medium text-muted">
            תאריך
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-fg
                       focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Times */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-muted">
              שעת התחלה
            </label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-fg
                         focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-muted">
              שעת סיום
            </label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              min={formData.startTime || undefined}
              onChange={handleChange}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-fg
                         focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="mb-1 block text-sm font-medium text-muted">
            כיתה
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-fg
                       focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Supervisors */}
        <div>
          <label className="mb-1 block text-sm font-medium text-muted">
            תעודות זהות של משגיחים (מופרדות בפסיק)
          </label>
          <input
            type="text"
            name="supervisors"
            value={formData.supervisors}
            onChange={handleChange}
            placeholder="10000001, 10000002"
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-fg
                       focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Lecturers */}
        <div>
          <label className="mb-1 block text-sm font-medium text-muted">
            תעודות זהות של מרצים (מופרדות בפסיק)
          </label>
          <input
            type="text"
            name="lecturers"
            value={formData.lecturers}
            onChange={handleChange}
            placeholder="10000001, 10000002"
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-fg
                       focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Rules */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-muted">
            חוקים לבחינה
          </label>

          {[
            { key: "calculator", label: "מחשבון" },
            { key: "computer", label: "מחשב" },
            { key: "headphones", label: "אוזניות" },
            { key: "openBook", label: "חומר פתוח" },
          ].map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-2 text-sm text-fg"
            >
              <input
                type="checkbox"
                checked={rules[key as keyof typeof rules]}
                onChange={(e) =>
                  setRules((prev) => ({
                    ...prev,
                    [key]: e.target.checked,
                  }))
                }
                className="accent-accent"
              />
              {label}
            </label>
          ))}
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-accent py-2 font-medium text-white hover:opacity-90 transition"
        >
          הוספת בחינה
        </button>
      </form>
    </div>
  );
}
