"use client";

import { useState, FormEvent } from "react";

export default function RegisterUserPage() {
  const [formData, setFormData] = useState({
    idNumber: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (
      !formData.idNumber ||
      !formData.name ||
      !formData.email ||
      !formData.password
    ) {
      setError("יש למלא את כל שדות החובה");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "שגיאה ביצירת המשתמש");
        return;
      }

      setSuccess("המשתמש נוצר בהצלחה!");
      setFormData({
        idNumber: "",
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "student",
      });
    } catch {
      setError("שגיאת שרת, נסה שוב מאוחר יותר");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface)] flex justify-center px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="
          w-full max-w-xl
          rounded-3xl
          bg-[var(--bg)]
          border border-[var(--border)]
          shadow-sm
          p-6 sm:p-8
          space-y-6
        "
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-[var(--fg)]">
          רישום משתמש חדש
        </h2>

        {error && (
          <div className="rounded-xl border border-[var(--danger)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger)]">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-[var(--success)] bg-[var(--success-bg)] px-4 py-3 text-sm text-[var(--success)]">
            {success}
          </div>
        )}

        <Field label="תעודת זהות *">
          <input
            name="idNumber"
            value={formData.idNumber}
            onChange={handleChange}
            placeholder="הכנס תעודת זהות"
            className="input"
          />
        </Field>

        <Field label="שם מלא *">
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="הכנס שם מלא"
            className="input"
          />
        </Field>

        <Field label="אימייל *">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@email.com"
            className="input"
          />
        </Field>

        <Field label="טלפון">
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="050-0000000"
            className="input"
          />
        </Field>

        <Field label="סיסמה *">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="הכנס סיסמה"
            className="input"
          />
        </Field>

        <Field label="תפקיד *">
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="input"
          >
            <option value="student">סטודנט</option>
            <option value="supervisor">משגיח</option>
            <option value="lecturer">מרצה</option>
            <option value="admin">מנהל מערכת</option>
          </select>
        </Field>

        <button
          type="submit"
          disabled={loading}
          className={`
            w-full
            rounded-2xl
            py-3
            font-semibold
            text-white
            transition
            ${
              loading
                ? "bg-[var(--border)] cursor-not-allowed"
                : "bg-[var(--accent)] hover:brightness-110"
            }
          `}
        >
          {loading ? "יוצר משתמש..." : "צור משתמש"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-[var(--muted)]">
        {label}
      </label>
      {children}
    </div>
  );
}
