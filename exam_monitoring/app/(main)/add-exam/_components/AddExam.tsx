"use client";

import { useState } from "react";
import { FileText, Calendar, Clock, MapPin, Users, BookOpen, Loader2, CheckCircle, AlertCircle, Calculator, Monitor, Headphones, Book } from "lucide-react";

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

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!name) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const courseName = String(formData.courseName ?? "");
    const courseCode = String(formData.courseCode ?? "");

    if (!courseName.trim() || !courseCode.trim()) {
      setError("שם קורס וקוד קורס הם שדות חובה");
      return;
    }

    if (!Number.isInteger(Number(formData.courseCode))) {
      setError("קוד קורס חייב להיות מספר שלם");
      return;
    }

    setLoading(true);

    const supervisorsTz = formData.supervisors
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const lecturersTz = formData.lecturers
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          rules,
          supervisorsTz,
          lecturersTz,
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        setError("כבר קיימת בחינה במיקום זה בטווח הזמנים שנבחר");
        return;
      }

      if (!res.ok) {
        setError(data.message || "שגיאה ביצירת הבחינה");
        return;
      }

      setSuccess(`הבחינה "${formData.courseName}" נוספה בהצלחה!`);
      
      // Reset form
      setFormData({
        courseName: "",
        courseCode: "",
        date: "",
        startTime: "",
        endTime: "",
        location: "",
        supervisors: "",
        lecturers: "",
      });
      setRules({
        calculator: false,
        computer: false,
        headphones: false,
        openBook: false,
      });
      
      onSuccess?.();
    } catch (err) {
      setError("שגיאת שרת, נסה שוב מאוחר יותר");
    } finally {
      setLoading(false);
    }
  };

  const ruleOptions = [
    { key: "calculator", label: "מחשבון", icon: Calculator },
    { key: "computer", label: "מחשב", icon: Monitor },
    { key: "headphones", label: "אוזניות", icon: Headphones },
    { key: "openBook", label: "חומר פתוח", icon: Book },
  ];

  // Get today's date for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#17cf97] to-[#0ea97a] shadow-lg shadow-[#17cf97]/25 mb-4">
            <FileText size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">הוספת בחינה חדשה</h1>
          <p className="text-gray-500 mt-1">מלא את הפרטים להוספת בחינה למערכת</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          
          {/* Success Message */}
          {success && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 animate-[slideUp_0.3s_ease]">
              <CheckCircle size={20} />
              <span className="font-medium">{success}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 animate-[slideUp_0.3s_ease]">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Course Info Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                <BookOpen size={16} />
                פרטי הקורס
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    שם הקורס <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="courseName"
                    value={formData.courseName}
                    onChange={handleChange}
                    placeholder="לדוגמה: מבוא למדעי המחשב"
                    className="input"
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    קוד הקורס <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="courseCode"
                    value={formData.courseCode}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        setFormData((prev) => ({ ...prev, courseCode: value }));
                      }
                    }}
                    placeholder="12345"
                    className="input"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Date & Time Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                <Calendar size={16} />
                תאריך ושעה
              </h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">תאריך</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  min={today}
                  onChange={handleChange}
                  className="input"
                  disabled={loading}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock size={14} className="inline ml-1" />
                    שעת התחלה
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="input"
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock size={14} className="inline ml-1" />
                    שעת סיום
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    min={formData.startTime || undefined}
                    onChange={handleChange}
                    className="input"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                <MapPin size={16} />
                מיקום
              </h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">כיתה / אולם</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="לדוגמה: אולם 300"
                  className="input"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Staff Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                <Users size={16} />
                צוות
              </h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ת.ז. משגיחים (מופרדות בפסיק)
                </label>
                <input
                  type="text"
                  name="supervisors"
                  value={formData.supervisors}
                  onChange={handleChange}
                  placeholder="123456789, 987654321"
                  className="input"
                  disabled={loading}
                />
                <p className="text-xs text-gray-400 mt-1">הזן תעודות זהות של משגיחים, מופרדות בפסיק</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ת.ז. מרצים (מופרדות בפסיק)
                </label>
                <input
                  type="text"
                  name="lecturers"
                  value={formData.lecturers}
                  onChange={handleChange}
                  placeholder="123456789, 987654321"
                  className="input"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Rules Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                ציוד מותר בבחינה
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ruleOptions.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setRules((prev) => ({ ...prev, [key]: !prev[key as keyof typeof rules] }))}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      rules[key as keyof typeof rules]
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                    disabled={loading}
                  >
                    <Icon size={24} />
                    <span className="text-sm font-medium">{label}</span>
                    {rules[key as keyof typeof rules] && (
                      <span className="text-xs">מותר ✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-3 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>מוסיף בחינה...</span>
                </>
              ) : (
                <>
                  <FileText size={20} />
                  <span>הוסף בחינה</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
