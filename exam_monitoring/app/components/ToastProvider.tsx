"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { X, Bell, AlertTriangle, CheckCircle, Info } from "lucide-react";

// סוגי הודעות אפשריים: מידע, הצלחה, אזהרה, התראה
type ToastType = "info" | "success" | "warning" | "alert";

// מבנה של הודעת Toast בודדת
type Toast = {
  id: string;        // מזהה ייחודי
  message: string;   // תוכן ההודעה
  type: ToastType;   // סוג ההודעה
  duration?: number; // משך הזמן להצגה (במילישניות)
};

// טיפוס הקונטקסט - מגדיר את הפונקציה להצגת הודעות
type ToastContextType = {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
};

// יצירת קונטקסט לשיתוף הודעות Toast בכל האפליקציה
const ToastContext = createContext<ToastContextType | null>(null);

// Hook מותאם אישית לשימוש ב-Toast מכל קומפוננטה
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// קומפוננטת Provider שעוטפת את האפליקציה ומספקת יכולת הצגת הודעות
export function ToastProvider({ children }: { children: React.ReactNode }) {
  // מערך של כל ההודעות הפעילות
  const [toasts, setToasts] = useState<Toast[]>([]);

  // פונקציה להצגת הודעה חדשה
  const showToast = useCallback((message: string, type: ToastType = "info", duration: number = 5000) => {
    // יצירת מזהה ייחודי מבוסס זמן
    const id = Date.now().toString();
    // הוספת ההודעה למערך
    setToasts(prev => [...prev, { id, message, type, duration }]);

    // השמעת צליל עבור התראות ואזהרות
    if (type === "alert" || type === "warning") {
      try {
        // יצירת צליל ביפ באמצעות Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // תדר גבוה יותר להתראות, נמוך יותר לאזהרות
        oscillator.frequency.value = type === "alert" ? 800 : 600;
        oscillator.type = "sine";
        
        // הגדרת עוצמת הצליל עם דעיכה הדרגתית
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (e) {
        // טיפול במקרה שהשמע לא נתמך או חסום
        console.log("Audio notification not available");
      }
    }

    // הסרה אוטומטית של ההודעה אחרי הזמן שנקבע
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  // פונקציה לסגירה ידנית של הודעה
  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // פונקציה שמחזירה עיצוב מותאם לפי סוג ההודעה
  const getToastStyle = (type: ToastType) => {
    switch (type) {
      case "alert": // התראה - אדום
        return {
          bg: "bg-red-500",
          icon: <AlertTriangle className="w-5 h-5" />,
          border: "border-red-600",
        };
      case "warning": // אזהרה - כתום
        return {
          bg: "bg-amber-500",
          icon: <Bell className="w-5 h-5" />,
          border: "border-amber-600",
        };
      case "success": // הצלחה - ירוק
        return {
          bg: "bg-green-500",
          icon: <CheckCircle className="w-5 h-5" />,
          border: "border-green-600",
        };
      default: // מידע - כחול (ברירת מחדל)
        return {
          bg: "bg-blue-500",
          icon: <Info className="w-5 h-5" />,
          border: "border-blue-600",
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* מיכל ההודעות - ממוקם בפינה הימנית העליונה */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-md" dir="rtl">
        {/* מעבר על כל ההודעות והצגתן */}
        {toasts.map((toast) => {
          const style = getToastStyle(toast.type);
          
          return (
            <div
              key={toast.id}
              className={`${style.bg} text-white px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 animate-slide-in border-r-4 ${style.border}`}
              style={{
                animation: "slideIn 0.3s ease-out",
              }}
            >
              {/* אייקון לפי סוג ההודעה */}
              <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
              {/* תוכן ההודעה */}
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              {/* כפתור סגירה */}
              <button
                onClick={() => dismissToast(toast.id)}
                className="flex-shrink-0 hover:bg-white/20 rounded p-1"
                aria-label="סגור הודעה"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* אנימציית כניסה להודעות */}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
