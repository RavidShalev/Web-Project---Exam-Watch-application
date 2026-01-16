"use client";

import { useState, FormEvent } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Shield, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Info,
  CreditCard
} from "lucide-react";

interface FieldErrors {
  idNumber?: string;
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
}

export default function RegisterUserPage() {
  const [formData, setFormData] = useState({
    idNumber: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "student",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Calculate password strength
  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    if (!password) return { strength: 0, label: "", color: "" };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    if (strength <= 2) return { strength, label: "חלשה", color: "var(--danger)" };
    if (strength <= 3) return { strength, label: "בינונית", color: "var(--warning)" };
    return { strength, label: "חזקה", color: "var(--success)" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Real-time validation
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "idNumber":
        if (!value.trim()) return "תעודת זהות היא שדה חובה";
        if (!/^\d{9}$/.test(value)) return "תעודת זהות חייבת להכיל 9 ספרות";
        break;
      case "name":
        if (!value.trim()) return "שם מלא הוא שדה חובה";
        if (value.trim().length < 2) return "שם חייב להכיל לפחות 2 תווים";
        break;
      case "email":
        if (!value.trim()) return "אימייל הוא שדה חובה";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "אימייל לא תקין";
        break;
      case "phone":
        if (value && !/^0\d{1,2}-?\d{7}$/.test(value.replace(/-/g, ""))) {
          return "מספר טלפון לא תקין (לדוגמה: 050-1234567)";
        }
        break;
      case "password":
        if (!value) return "סיסמה היא שדה חובה";
        if (value.length < 8) return "סיסמה חייבת להכיל לפחות 8 תווים";
        break;
    }
    return undefined;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Format phone number
    if (name === "phone") {
      const digits = value.replace(/\D/g, "");
      let formatted = digits;
      if (digits.length > 0) {
        formatted = digits.length <= 3 ? digits : 
                   digits.length <= 9 ? `${digits.slice(0, 3)}-${digits.slice(3)}` :
                   `${digits.slice(0, 3)}-${digits.slice(3, 10)}`;
      }
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else if (name === "idNumber") {
      // Only allow digits and limit to 9
      const digits = value.replace(/\D/g, "").slice(0, 9);
      setFormData((prev) => ({ ...prev, [name]: digits }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name as keyof FieldErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setGeneralError("");

    // Validate in real-time if field was touched
    if (touched[name]) {
      const error = validateField(name, name === "phone" ? (value.replace(/\D/g, "")) : value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name: string, value: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, name === "phone" ? (value.replace(/\D/g, "")) : value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setSuccess("");

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    // Validate all fields
    const newErrors: FieldErrors = {};
    Object.keys(formData).forEach((key) => {
      const value = formData[key as keyof typeof formData];
      if (key === "phone") {
        const error = validateField(key, (value as string).replace(/\D/g, ""));
        if (error) newErrors[key as keyof FieldErrors] = error;
      } else if (key !== "role") {
        const error = validateField(key, value as string);
        if (error) newErrors[key as keyof FieldErrors] = error;
      }
    });

    setErrors(newErrors);

    // Check if there are any errors
    if (Object.keys(newErrors).length > 0) {
      setGeneralError("אנא תקן את השגיאות בטופס");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          phone: formData.phone.replace(/\D/g, ""), // Remove formatting before sending
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGeneralError(data.message || "שגיאה ביצירת המשתמש");
        return;
      }

      setSuccess("המשתמש נוצר בהצלחה! 🎉");
      setFormData({
        idNumber: "",
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "student",
      });
      setTouched({});
      setErrors({});
      setShowPassword(false);
    } catch {
      setGeneralError("שגיאת שרת, נסה שוב מאוחר יותר");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface)] flex justify-center px-4 py-10" dir="rtl">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--fg)] mb-2">
            רישום משתמש חדש
          </h1>
          <p className="text-sm text-[var(--muted)]">
            מלא את הפרטים הבאים כדי ליצור משתמש חדש במערכת
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="
            w-full
            rounded-3xl
            bg-[var(--bg)]
            border border-[var(--border)]
            shadow-lg
            p-6 sm:p-8
            space-y-6
          "
        >
          {/* General Error */}
          {generalError && (
            <div className="rounded-xl border border-[var(--danger)] bg-[var(--danger-bg)] px-4 py-3 flex items-start gap-2">
              <AlertCircle className="flex-shrink-0 mt-0.5" size={18} style={{ color: "var(--danger)" }} />
              <p className="text-sm text-[var(--danger)] flex-1">{generalError}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="rounded-xl border border-[var(--success)] bg-[var(--success-bg)] px-4 py-3 flex items-start gap-2">
              <CheckCircle2 className="flex-shrink-0 mt-0.5" size={18} style={{ color: "var(--success)" }} />
              <p className="text-sm text-[var(--success)] flex-1">{success}</p>
            </div>
          )}

          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--fg)] flex items-center gap-2 pb-2 border-b border-[var(--border)]">
              <User size={20} />
              פרטים אישיים
            </h3>

            <Field 
              label="תעודת זהות" 
              required 
              error={errors.idNumber}
              icon={<CreditCard size={18} />}
              helpText="9 ספרות בלבד"
            >
              <input
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                onBlur={(e) => handleBlur("idNumber", e.target.value)}
                placeholder="123456789"
                className={`input-field ${errors.idNumber ? "error" : ""}`}
                maxLength={9}
                inputMode="numeric"
              />
            </Field>

            <Field 
              label="שם מלא" 
              required 
              error={errors.name}
              icon={<User size={18} />}
            >
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={(e) => handleBlur("name", e.target.value)}
                placeholder="ישראל ישראלי"
                className={`input-field ${errors.name ? "error" : ""}`}
              />
            </Field>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--fg)] flex items-center gap-2 pb-2 border-b border-[var(--border)]">
              <Mail size={20} />
              פרטי התקשרות
            </h3>

            <Field 
              label="אימייל" 
              required 
              error={errors.email}
              icon={<Mail size={18} />}
              helpText="כתובת אימייל תקינה"
            >
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={(e) => handleBlur("email", e.target.value)}
                placeholder="example@email.com"
                className={`input-field ${errors.email ? "error" : ""}`}
                autoComplete="email"
              />
            </Field>

            <Field 
              label="טלפון" 
              error={errors.phone}
              icon={<Phone size={18} />}
              helpText="אופציונלי - לדוגמה: 050-1234567"
            >
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={(e) => handleBlur("phone", e.target.value)}
                placeholder="050-1234567"
                className={`input-field ${errors.phone ? "error" : ""}`}
                maxLength={12}
                inputMode="tel"
                autoComplete="tel"
              />
            </Field>
          </div>

          {/* Security Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--fg)] flex items-center gap-2 pb-2 border-b border-[var(--border)]">
              <Shield size={20} />
              אבטחה וגישה
            </h3>

            <Field 
              label="סיסמה" 
              required 
              error={errors.password}
              icon={<Lock size={18} />}
              helpText="מינימום 8 תווים, מומלץ: אותיות גדולות וקטנות, מספרים וסימנים"
            >
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={(e) => handleBlur("password", e.target.value)}
                  placeholder="הכנס סיסמה חזקה"
                  className={`input-field pr-10 ${errors.password ? "error" : ""}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
                  aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--muted)]">חוזק סיסמה:</span>
                    <span style={{ color: passwordStrength.color }} className="font-medium">
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-[var(--surface-hover)] rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${(passwordStrength.strength / 5) * 100}%`,
                        backgroundColor: passwordStrength.color,
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-5 gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-1 rounded-full transition-colors"
                        style={{
                          backgroundColor: i <= passwordStrength.strength 
                            ? passwordStrength.color 
                            : "var(--surface-hover)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </Field>

            <Field 
              label="תפקיד" 
              required 
              icon={<Shield size={18} />}
              helpText="בחר את תפקיד המשתמש במערכת"
            >
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input-field"
              >
                <option value="student">סטודנט</option>
                <option value="supervisor">משגיח</option>
                <option value="lecturer">מרצה</option>
                <option value="admin">מנהל מערכת</option>
              </select>
            </Field>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`
                w-full
                rounded-2xl
                py-3.5
                font-semibold
                text-white
                transition-all
                shadow-md
                flex items-center justify-center gap-2
                ${
                  loading
                    ? "bg-[var(--border)] cursor-not-allowed opacity-60"
                    : "bg-[var(--accent)] hover:brightness-110 hover:shadow-lg active:scale-[0.98]"
                }
              `}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  יוצר משתמש...
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  צור משתמש
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  required,
  error,
  icon,
  helpText,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
  icon?: React.ReactNode;
  helpText?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-[var(--fg)] flex items-center gap-2">
        {icon && <span className="text-[var(--muted)]">{icon}</span>}
        <span>{label}</span>
        {required && <span className="text-[var(--danger)]" aria-label="שדה חובה">*</span>}
      </label>
      {children}
      {helpText && !error && (
        <p className="text-xs text-[var(--muted)] flex items-center gap-1">
          <Info size={12} />
          {helpText}
        </p>
      )}
      {error && (
        <p className="text-xs text-[var(--danger)] flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}
