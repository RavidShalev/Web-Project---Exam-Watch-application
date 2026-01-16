"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

// wait until the component loads to prevent errors
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      console.log("ThemeToggle mounted — theme:", theme, "resolved:", resolvedTheme);
    }
  }, [mounted, theme, resolvedTheme]);

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  return (
    <button
      onClick={() => {
        const next = resolvedTheme === "dark" ? "light" : "dark";
        console.log("ThemeToggle click — switching to:", next);
        setTheme(next);
      }}
      className="p-2 rounded-full transition-colors duration-200
                 bg-gray-200 hover:bg-gray-300 text-gray-800
                 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-yellow-300"
      aria-label="החלף מצב תצוגה"
    >
      {resolvedTheme === "dark" ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}