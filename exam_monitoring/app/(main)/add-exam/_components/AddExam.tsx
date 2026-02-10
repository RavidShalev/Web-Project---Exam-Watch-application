"use client";

import { useState } from "react";
import "../../../globals.css";

type AddExamFormProps = {
  onSuccess?: () => void;
};


/**
 * AddExamForm
 * Form component used to create and submit a new exam.
 *
 * Responsibilities:
 * - Collect exam details such as course name, course code...
 * - Collect supervisors and lecturers ID numbers
 * - Validate required fields and input formats before submission
 * - Prevent exam creation if there is a time and location conflict
 * - Submit exam data
 * - Notify parent component on successful exam creation
 */
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
        rules,
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
    <div className="mt-10 flex justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="
          w-full max-w-2xl
          rounded-3xl
          bg-[var(--bg)]
          border border-[var(--border)]
          shadow-sm
          p-6 sm:p-10
          space-y-8
        "
      >
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-[var(--fg)]">
          הוספת מבחן
        </h2>

        <div className="grid gap-5">
          <Field label="שם הקורס" htmlFor="courseName">
            <input
              id="courseName"
              type="text"
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              className="input-field"
            />
          </Field>

          <Field label="קוד הקורס" htmlFor="courseCode">
            <input
              id="courseCode"
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
              className="input-field"
            />
          </Field>

          <Field label="תאריך" htmlFor="date">
            <input
              id="date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="input-field"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="שעת התחלה" htmlFor="startTime">
              <input
                id="startTime"
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="input-field"
              />
            </Field>

            <Field label="שעת סיום" htmlFor="endTime">
              <input
                id="endTime"
                type="time"
                name="endTime"
                min={formData.startTime || undefined}
                value={formData.endTime}
                onChange={handleChange}
                className="input-field"
              />
            </Field>
          </div>

          <Field label="כיתה" htmlFor="location">
            <input
              id="location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="input-field"
            />
          </Field>

          <Field label="תעודות זהות של משגיחים" htmlFor="supervisors">
            <input
              id="supervisors"
              type="text"
              name="supervisors"
              value={formData.supervisors}
              onChange={handleChange}
              placeholder="10000001, 10000002"
              className="input-field"
            />
          </Field>

          <Field label="תעודות זהות של מרצים" htmlFor="lecturers">
            <input
              id="lecturers"
              type="text"
              name="lecturers"
              value={formData.lecturers}
              onChange={handleChange}
              placeholder="10000001, 10000002"
              className="input-field"
            />
          </Field>

          <div className="space-y-3">
            <label className="text-sm font-medium text-[var(--muted)]">
              חוקים לבחינה
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: "calculator", label: "מחשבון" },
                { key: "computer", label: "מחשב" },
                { key: "headphones", label: "אוזניות" },
                { key: "openBook", label: "חומר פתוח" },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="
                    flex items-center gap-2
                    rounded-xl
                    border border-[var(--border)]
                    bg-[var(--surface)]
                    px-3 py-2
                    text-sm
                    cursor-pointer
                    hover:bg-[var(--surface-hover)]
                    transition
                  "
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
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="
            w-full
            rounded-2xl
            bg-[var(--accent)]
            py-3
            font-semibold
            text-white
            hover:brightness-110
            active:scale-[0.99]
            transition
          "
        >
          הוספת בחינה
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
  htmlFor,
}: {
  label: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-[var(--muted)]">
        {label}
      </label>
      {children}
    </div>
  );
}
