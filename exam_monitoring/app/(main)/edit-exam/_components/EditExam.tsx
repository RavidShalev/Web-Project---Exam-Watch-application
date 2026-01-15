"use client";

import { useState } from "react";
import "../../../globals.css";
import { ExamFormData } from "../../../../types/examtypes";
import { useRouter } from "next/navigation";

type EditExamFormProps = {
  exam: ExamFormData;
  examId: string;
};

export default function EditExamForm({ exam, examId }: EditExamFormProps) {
  const [formData, setFormData] = useState<ExamFormData>(exam);
  const [rules, setRules] = useState(exam.rules);
  const router = useRouter();

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

    try {
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

      // Prepare supervisors and lecturers arrays
      const supervisorsTz = formData.supervisors
        ? formData.supervisors
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      const lecturersTz = formData.lecturers
        ? formData.lecturers
            .split(",")
            .map((l) => l.trim())
            .filter(Boolean)
        : [];

      // Send PUT request to update exam
      const res = await fetch(`/api/exams/${examId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          supervisorsTz,
          lecturersTz,
          rules,
        }),
      });

      // Handle response
      const data = await res.json();

      // case 1: conflict - room already taken
      if (res.status === 409) {
        alert(
          "לא יהיה ניתן לעדכן את המבחן למיקום ושעת מבחן אלו, כיוון שכבר קיים מבחן במיקום זה בטווח הזמנים שנבחר."
        );
        return;
      }

      // case 2: any other server error
      if (!res.ok) {
        console.error("PUT failed:", data);
        alert(
          data.message || "התרחשה שגיאה בלתי צפויה. אנא נסה שוב."
        );
        return;
      }

      alert("המבחן עודכן בהצלחה");
      router.push("/add-exam");
    } catch (err) {
      console.error("PUT crashed:", err);
      alert("שגיאת שרת");
    }
  };

  return (
    <div className="flex justify-center mt-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                   rounded-xl shadow-md p-8 space-y-5"
      >
        <h2 className="text-2xl font-semibold text-center mb-4 text-gray-900 dark:text-white">עריכת מבחן</h2>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">שם הקורס</label>
          <input
            type="text"
            name="courseName"
            value={formData.courseName}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">קוד הקורס</label>
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
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">תאריך</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">שעת התחלה</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">שעת סיום</label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              min={formData.startTime || undefined}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">כיתה</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            תעודות זהות של משגיחים (מופרדות בפסיק)
          </label>
          <input
            type="text"
            name="supervisors"
            value={formData.supervisors}
            onChange={handleChange}
            placeholder="10000001, 100000002, ..."
            className="w-full rounded-md border border-gray-300 px-3 py-2
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            תעודות זהות של מרצים (מופרדות בפסיק)
          </label>
          <input
            type="text"
            name="lecturers"
            value={formData.lecturers}
            onChange={handleChange}
            placeholder="10000001, 100000002, ..."
            className="w-full rounded-md border border-gray-300 px-3 py-2
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">חוקים לבחינה</label>

          {[
            { key: "calculator", label: "מחשבון" },
            { key: "computer", label: "מחשב" },
            { key: "headphones", label: "אוזניות" },
            { key: "openBook", label: "חומר פתוח" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-sm">
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

        <button
          type="submit"
          className="w-full bg-blue-600 dark:bg-blue-700 text-white py-2 rounded-md
                     hover:bg-blue-700 dark:hover:bg-blue-800 transition font-medium"
        >
          שמור שינויים
        </button>
      </form>
    </div>
  );
}
