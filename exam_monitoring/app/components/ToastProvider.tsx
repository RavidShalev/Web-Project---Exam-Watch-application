"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { X, Bell, AlertTriangle, CheckCircle, Info } from "lucide-react";

type ToastType = "info" | "success" | "warning" | "alert";

type Toast = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
};

type ToastContextType = {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info", duration: number = 5000) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type, duration }]);

    // Play sound for alerts
    if (type === "alert" || type === "warning") {
      try {
        // Create a simple beep sound using Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = type === "alert" ? 800 : 600;
        oscillator.type = "sine";
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (e) {
        // Audio not supported or blocked
        console.log("Audio notification not available");
      }
    }

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getToastStyle = (type: ToastType) => {
    switch (type) {
      case "alert":
        return {
          bg: "bg-red-500",
          icon: <AlertTriangle className="w-5 h-5" />,
          border: "border-red-600",
        };
      case "warning":
        return {
          bg: "bg-amber-500",
          icon: <Bell className="w-5 h-5" />,
          border: "border-amber-600",
        };
      case "success":
        return {
          bg: "bg-green-500",
          icon: <CheckCircle className="w-5 h-5" />,
          border: "border-green-600",
        };
      default:
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
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-md" dir="rtl">
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
              <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              <button
                onClick={() => dismissToast(toast.id)}
                className="flex-shrink-0 hover:bg-white/20 rounded p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

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
