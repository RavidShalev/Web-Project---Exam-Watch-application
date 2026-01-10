"use client";

import { useState, FormEvent } from "react";
import { UserPlus, AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from "lucide-react";

export default function RegisterUserPage() {
  const [formData, setFormData] = useState({
    idNumber: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "student",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Real-time validation : Prevent Errors
  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case "idNumber":
        if (value && !/^\d{9}$/.test(value)) {
          newErrors.idNumber = "תעודת זהות חייבת להכיל 9 ספרות";
        } else {
          delete newErrors.idNumber;
        }
        break;
      case "email":
        if (value && !/^\S+@\S+\.\S+$/.test(value)) {
          newErrors.email = "כתובת אימייל לא תקינה";
        } else {
          delete newErrors.email;
        }
        break;
      case "phone":
        if (value && !/^0\d{8,9}$/.test(value.replace(/-/g, ''))) {
          newErrors.phone = "מספר טלפון לא תקין";
        } else {
          delete newErrors.phone;
        }
        break;
      case "password":
        if (value && value.length < 6) {
          newErrors.password = "סיסמה חייבת להכיל לפחות 6 תווים";
        } else {
          delete newErrors.password;
        }
        break;
      case "name":
        if (value && value.length < 2) {
          newErrors.name = "שם חייב להכיל לפחות 2 תווים";
        } else {
          delete newErrors.name;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // For ID number - only allow digits
    if (name === "idNumber") {
      const cleanValue = value.replace(/\D/g, '').slice(0, 9);
      setFormData((prev) => ({ ...prev, [name]: cleanValue }));
      validateField(name, cleanValue);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      validateField(name, value);
    }
    
    // Clear success message on edit
    if (success) setSuccess("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccess("");
    
    // Validate all fields
    if (!formData.idNumber || !formData.name || !formData.email || !formData.password) {
      setErrors({ form: "יש למלא את כל שדות החובה" });
      return;
    }
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ form: data.message || "שגיאה ביצירת המשתמש" });
        return;
      }

      setSuccess(`המשתמש "${formData.name}" נוצר בהצלחה!`);
      setFormData({
        idNumber: "",
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "student",
      });
    } catch (err) {
      setErrors({ form: "שגיאת שרת, נסה שוב מאוחר יותר" });
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: "student", label: "סטודנט", color: "bg-blue-100 text-blue-700" },
    { value: "supervisor", label: "משגיח", color: "bg-green-100 text-green-700" },
    { value: "lecturer", label: "מרצה", color: "bg-purple-100 text-purple-700" },
    { value: "admin", label: "מנהל מערכת", color: "bg-red-100 text-red-700" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" dir="rtl">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#17cf97] to-[#0ea97a] shadow-lg shadow-[#17cf97]/25 mb-4">
            <UserPlus size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">רישום משתמש חדש</h1>
          <p className="text-gray-500 mt-1">הוספת משתמש למערכת ExamWatch</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          
          {/* Success Message : Informative Feedback */}
          {success && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 animate-[slideUp_0.3s_ease]">
              <CheckCircle size={20} />
              <span className="font-medium">{success}</span>
            </div>
          )}

          {/* Error Message */}
          {errors.form && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 animate-[slideUp_0.3s_ease]">
              <AlertCircle size={20} />
              <span>{errors.form}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ID Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                תעודת זהות <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                placeholder="123456789"
                maxLength={9}
                className={`input ${errors.idNumber ? 'input-error' : ''}`}
                disabled={loading}
              />
              {errors.idNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.idNumber}</p>
              )}
              {formData.idNumber && !errors.idNumber && formData.idNumber.length < 9 && (
                <p className="text-gray-400 text-xs mt-1">{9 - formData.idNumber.length} ספרות נוספות</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                שם מלא <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="ישראל ישראלי"
                className={`input ${errors.name ? 'input-error' : ''}`}
                disabled={loading}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                אימייל <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@braude.ac.il"
                className={`input ${errors.email ? 'input-error' : ''}`}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                טלפון
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="050-1234567"
                className={`input ${errors.phone ? 'input-error' : ''}`}
                disabled={loading}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                סיסמה <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="לפחות 6 תווים"
                  className={`input pl-12 ${errors.password ? 'input-error' : ''}`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Role - Visual Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                תפקיד <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {roleOptions.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, role: role.value }))}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      formData.role === role.value
                        ? `${role.color} border-current shadow-sm`
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                    disabled={loading}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || Object.keys(errors).filter(k => k !== 'form').length > 0}
              className="w-full btn btn-primary py-3 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>יוצר משתמש...</span>
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  <span>צור משתמש</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}