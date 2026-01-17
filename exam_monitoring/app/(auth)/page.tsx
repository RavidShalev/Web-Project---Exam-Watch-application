"use client";

import Login from "./_components/Login";
import ThemeToggle from "../components/ThemeToggle";

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      {/* Theme toggle button */}
      <div className="absolute top-4 left-4 z-10">
        <ThemeToggle />
      </div>

      {/* Login */}
      <Login />
    </div>
  );
}
