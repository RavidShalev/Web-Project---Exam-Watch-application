"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { X, Bell, AlertTriangle, CheckCircle, Info } from "lucide-react";

// Possible toast message types: info, success, warning, alert
type ToastType = "info" | "success" | "warning" | "alert";

// Structure of a single Toast message
type Toast = {
  id: string;        // Unique identifier
  message: string;   // Message content
  type: ToastType;   // Message type
  duration?: number; // Display duration (in milliseconds)
};

// Toast context type - exposes a function to show toasts
type ToastContextType = {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
};

// Create context to share Toast functionality across the app
const ToastContext = createContext<ToastContextType | null>(null);

// Custom hook to use Toast from any component
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// Provider component that wraps the app and enables Toast messages
export function ToastProvider({ children }: { children: React.ReactNode }) {
  // List of active toast messages
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Function to show a new toast message
  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration: number = 5000) => {
      // Generate a unique ID based on timestamp
      const id = Date.now().toString();

      // Add the toast to the list
      setToasts(prev => [...prev, { id, message, type, duration }]);

      // Play sound for alerts and warnings
      if (type === "alert" || type === "warning") {
        try {
          // Create a beep sound using the Web Audio API
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          // Higher frequency for alerts, lower for warnings
          oscillator.frequency.value = type === "alert" ? 800 : 600;
          oscillator.type = "sine";

          // Set volume with a gradual fade-out
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
          // Handle cases where audio is not supported or blocked
          console.log("Audio notification not available");
        }
      }

      // Automatically remove the toast after the given duration
      if (duration > 0) {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
      }
    },
    []
  );

  // Manually dismiss a toast
  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Return styling configuration based on toast type
  const getToastStyle = (type: ToastType) => {
    switch (type) {
      case "alert": // Alert - red
        return {
          bg: "bg-red-500",
          icon: <AlertTriangle className="w-5 h-5" />,
          border: "border-red-600",
        };
      case "warning": // Warning - orange
        return {
          bg: "bg-amber-500",
          icon: <Bell className="w-5 h-5" />,
          border: "border-amber-600",
        };
      case "success": // Success - green
        return {
          bg: "bg-green-500",
          icon: <CheckCircle className="w-5 h-5" />,
          border: "border-green-600",
        };
      default: // Info - blue (default)
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

      {/* Toast container - positioned at the top-right corner */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-md" dir="rtl">
        {/* Render all active toast messages */}
        {toasts.map((toast) => {
          const style = getToastStyle(toast.type);

          return (
            <div
              key={toast.id}
              className={`${style.bg} text-white px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 animate-slide-in border-r-4 ${style.border}`}
              style={{ animation: "slideIn 0.3s ease-out" }}
            >
              {/* Icon based on toast type */}
              <div className="flex-shrink-0 mt-0.5">{style.icon}</div>

              {/* Toast message content */}
              <p className="flex-1 text-sm font-medium">{toast.message}</p>

              {/* Close button */}
              <button
                onClick={() => dismissToast(toast.id)}
                className="flex-shrink-0 hover:bg-white/20 rounded p-1"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Toast entry animation */}
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