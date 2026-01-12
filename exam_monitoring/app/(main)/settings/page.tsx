"use client";

import { useState, useEffect } from "react";
import { Shield, CheckCircle, XCircle, Mail } from "lucide-react";

export default function TwoFactorSettings() {
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Load user data when page loads
  useEffect(() => {
    const storedUser = sessionStorage.getItem("currentUser");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user._id);
      setUserName(user.name);
      // Note: we don't store email in sessionStorage currently
      // You might need to fetch it from an API or add it to login response
      setUserEmail(user.email || "");
      setTwoFactorEnabled(user.twoFactorEnabled || false);
    }
  }, []);

  // Function: Enable 2FA
  const handleEnable2FA = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/two-factor/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "שגיאה בהפעלת אימות דו-שלבי");
        return;
      }

      setMessage(data.message);
      setTwoFactorEnabled(true);
    } catch (err) {
      setError("שגיאת שרת");
    } finally {
      setLoading(false);
    }
  };

  // Function: Disable 2FA
  const handleDisable2FA = async () => {
    if (!confirm("האם אתה בטוח שברצונך לכבות אימות דו-שלבי?")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/two-factor/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "שגיאה בביטול אימות דו-שלבי");
        return;
      }

      setMessage(data.message);
      setTwoFactorEnabled(false);
    } catch (err) {
      setError("שגיאת שרת");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">
            אימות דו-שלבי (2FA)
          </h1>
        </div>

        <p className="text-gray-600 mb-6">
          הגן על החשבון שלך עם אימות דו-שלבי. בכל התחברות תקבל קוד בן 6 ספרות למייל שלך.
        </p>

        {/* How it works */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            איך זה עובד?
          </h3>
          <ol className="list-decimal list-inside text-blue-800 space-y-1 text-sm">
            <li>לחץ על "הפעל אימות דו-שלבי"</li>
            <li>בהתחברות הבאה - הזן תעודת זהות וסיסמה כרגיל</li>
            <li>תקבל קוד בן 6 ספרות למייל: <strong>{userEmail || "המייל שלך"}</strong></li>
            <li>הזן את הקוד והיכנס למערכת!</li>
          </ol>
        </div>

        {/* Status */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
          <span className="font-semibold text-gray-700">סטטוס נוכחי:</span>
          {twoFactorEnabled ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span>אימות דו-שלבי פעיל</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              <span>אימות דו-שלבי כבוי</span>
            </div>
          )}
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Actions */}
        {!twoFactorEnabled ? (
          <button
            onClick={handleEnable2FA}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? "מפעיל..." : "הפעל אימות דו-שלבי"}
          </button>
        ) : (
          <div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
              <p className="text-green-800">
                ✅ החשבון שלך מוגן באימות דו-שלבי. בכל התחברות תקבל קוד למייל.
              </p>
            </div>
            <button
              onClick={handleDisable2FA}
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 transition"
            >
              {loading ? "מבטל..." : "בטל אימות דו-שלבי"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
