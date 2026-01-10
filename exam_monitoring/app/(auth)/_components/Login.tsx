"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { Eye, EyeOff, LogIn, AlertCircle, Loader2 } from "lucide-react";

function Login() {
  const [idNumber, setIdNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  // Handler for form submission
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation : Prevent Errors
    if (!idNumber.trim() || !password.trim()) {
      setError("יש למלא את כל השדות");
      return;
    }

    if (!/^\d{9}$/.test(idNumber.trim())) {
      setError("תעודת זהות חייבת להכיל 9 ספרות");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idNumber: idNumber.trim(), password: password.trim() }),
      });

      if (!res.ok) {
        setError("תעודת הזהות או הסיסמה שגויים");
        return;
      }

      const user = await res.json();

      if (user.role === "supervisor") {
        localStorage.setItem("supervisorId", user._id);
      }

      sessionStorage.setItem("currentUser", JSON.stringify(user));
      router.push("/home");
    } catch (err) {
      setError("שגיאת התחברות. נסה שוב.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1b2430] flex items-center justify-center p-4" dir="rtl">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-[#17cf97]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#17cf97]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#17cf97] to-[#0ea97a] shadow-lg shadow-[#17cf97]/25 mb-4">
            <svg width="40" height="40" viewBox="0 0 49 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24.5 12.75C24.5 18.9632 19.4632 24 13.25 24H2V12.75C2 6.53679 7.03679 1.5 13.25 1.5C19.4632 1.5 24.5 6.53679 24.5 12.75Z" fill="white"/>
              <path d="M24.5 35.25C24.5 29.0368 29.5368 24 35.75 24H47V35.25C47 41.4632 41.9632 46.5 35.75 46.5C29.5368 46.5 24.5 41.4632 24.5 35.25Z" fill="white"/>
              <path d="M2 35.25C2 41.4632 7.03679 46.5 13.25 46.5H24.5V35.25C24.5 29.0368 19.4632 24 13.25 24C7.03679 24 2 29.0368 2 35.25Z" fill="white" fillOpacity="0.7"/>
              <path d="M47 12.75C47 6.53679 41.9632 1.5 35.75 1.5H24.5V12.75C24.5 18.9632 29.5368 24 35.75 24C41.9632 24 47 18.9632 47 12.75Z" fill="white" fillOpacity="0.7"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ExamWatch</h1>
          <p className="text-gray-400">מערכת ניהול בחינות - מכללת בראודה</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#232d3b] rounded-2xl shadow-xl p-8 border border-[#2d3a4a]">
          <h2 className="text-2xl font-bold text-[#17cf97] mb-6 text-center">
            ברוך הבא!
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* ID Number Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                תעודת זהות
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={9}
                value={idNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setIdNumber(value);
                  if (error) setError("");
                }}
                placeholder="הזן 9 ספרות"
                className="w-full px-4 py-3 bg-[#1b2430] border-2 border-[#2d3a4a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#17cf97] transition-colors"
                disabled={isLoading}
              />
              {/* Real-time validation feedback */}
              {idNumber && idNumber.length < 9 && (
                <p className="text-xs text-gray-500 mt-1">
                  {9 - idNumber.length} ספרות נוספות נדרשות
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                סיסמה
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="הזן סיסמה"
                  className="w-full px-4 py-3 bg-[#1b2430] border-2 border-[#2d3a4a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#17cf97] transition-colors pl-12"
                  disabled={isLoading}
                />
                {/* Toggle password visibility : User Control */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error Message : Feedback */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm animate-[slideUp_0.2s_ease]">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !idNumber || !password}
              className="w-full py-3.5 bg-gradient-to-r from-[#17cf97] to-[#0ea97a] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#17cf97]/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>מתחבר...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>כניסה למערכת</span>
                </>
              )}
            </button>
          </form>

          {/* Footer info */}
          <p className="text-center text-gray-500 text-xs mt-6">
            במקרה של בעיה, פנה למרכז התמיכה
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
