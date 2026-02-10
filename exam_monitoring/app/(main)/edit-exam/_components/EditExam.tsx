"use client";

import { useState } from "react";
import "../../../globals.css";
import { ExamFormData } from "../../../../types/examtypes";
import { useRouter } from "next/navigation";

type EditExamFormProps = {
  exam: ExamFormData;
  examId: string;
};

/**
 * EditExamForm
 * Form component used to edit an existing exam.
 *
 * Responsibilities:
 * - Initialize the form with existing exam data
 * - Allow updating exam details such as course info, date, time, and location
 * - Manage and update exam rules (calculator, computer, headphones, open book)
 * - Validate required fields and input formats before submission
 * - Submit updated exam data to the server
 * - Handle scheduling conflicts and server-side errors
 * - Redirect the user after a successful update
 */
export default function EditExamForm({ exam, examId }: EditExamFormProps) {
  const [formData, setFormData] = useState<ExamFormData>(exam);
  
  // Convert rules array to object format { calculator: true/false, ... }
  const initialRules = Array.isArray(exam.rules)
    ? exam.rules.reduce((acc: Record<string, boolean>, rule: any) => {
        acc[rule.id] = rule.allowed;
        return acc;
      }, {})
    : { calculator: false, computer: false, headphones: false, openBook: false };
  
  const [rules, setRules] = useState<Record<string, boolean>>(initialRules);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!name) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const courseName = String(formData.courseName ?? "");
    const courseCode = String(formData.courseCode ?? "");

    if (!courseName.trim() || !courseCode.trim()) {
      alert("שם קורס וקוד קורס הם שדות חובה");
      return;
    }

    if (!Number.isInteger(Number(courseCode))) {
      alert("קוד קורס חייב להיות מספר שלם");
      return;
    }

    const supervisorsTz = formData.supervisors
      ? formData.supervisors.split(",").map(s => s.trim()).filter(Boolean)
      : [];

    const lecturersTz = formData.lecturers
      ? formData.lecturers.split(",").map(l => l.trim()).filter(Boolean)
      : [];

    const res = await fetch(`/api/exams/${examId}`, {
      method: "PUT",
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
      alert("קיים כבר מבחן במיקום ובטווח זמנים אלו");
      return;
    }

    if (!res.ok) {
      alert(data.message || "שגיאה");
      return;
    }

    alert("המבחן עודכן בהצלחה");
    router.push("/add-exam");
  };

  return (
    <div className="min-h-screen bg-[var(--surface)] flex justify-center px-4 py-8 sm:py-12">
      <form
        onSubmit={handleSubmit}
        className="
          w-full max-w-3xl
          rounded-3xl
          bg-[var(--bg)]
          border border-[var(--border)]
          shadow-sm
          p-6 sm:p-10
          space-y-10
        "
      >
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-[var(--fg)]">
          עריכת מבחן
        </h2>

        <div className="grid gap-6">
          <Field label="שם הקורס" htmlFor="course-name">
            <input
              id="course-name"
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              className="input-field"
            />
          </Field>

          <Field label="קוד הקורס" htmlFor="course-code">
            <input
              id="course-code"
              type="number"
              name="courseCode"
              value={formData.courseCode}
              onChange={e => {
                if (/^\d*$/.test(e.target.value)) {
                  setFormData(prev => ({
                    ...prev,
                    courseCode: e.target.value,
                  }));
                }
              }}
              className="input-field"
            />
          </Field>

          <Field label="תאריך" htmlFor="exam-date">
            <input
              id="exam-date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="input-field"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="שעת התחלה" htmlFor="start-time">
              <input
                id="start-time"
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="input-field"
              />
            </Field>

            <Field label="שעת סיום" htmlFor="end-time">
              <input
                id="end-time"
                type="time"
                name="endTime"
                min={formData.startTime || undefined}
                value={formData.endTime}
                onChange={handleChange}
                className="input-field"
              />
            </Field>
          </div>

          <Field label="כיתה" htmlFor="exam-location">
            <input
              id="exam-location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="input-field"
            />
          </Field>

          <Field label="תעודות זהות של משגיחים" htmlFor="supervisors">
            <input
              id="supervisors"
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
                    onChange={e =>
                      setRules(prev => ({
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
          שמור שינויים
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
