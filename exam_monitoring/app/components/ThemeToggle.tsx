"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * ThemeToggle – Light / Dark Mode
 * This component is responsible for switching between Light Mode and Dark Mode
 * in the application.
 * 
 * How it works in general:
 * - The project uses the `next-themes` library to manage the application theme
 * - The selected theme (light / dark) is automatically stored in the browser's localStorage (managed by `next-themes`)
 * - When the app loads, `next-themes`:
 *   1. Checks if a theme is stored in localStorage and applies it
 *   2. If no theme is stored, it checks the user's system preference and applies that
 *   3. If no system preference is found, it defaults to light mode
 * 
 * Global styling approach:
 * - Colors are NOT defined directly in the components
 * - Instead, the project defines CSS variables in `globals.css`
 * - Light Mode variables are defined under `:root`
 * - Dark Mode variables are defined under `.dark`
 * Components use these variables via Tailwind, so switching the theme updates the entire UI automatically.
 * 
 * Rendering note:
 * - The toggle button is rendered only after the component is mounted on the client
 * - This prevents hydration mismatch issues caused by Server-Side Rendering (SSR)
 */
export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

// wait until the component loads to prevent errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // Saving a place for the button
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