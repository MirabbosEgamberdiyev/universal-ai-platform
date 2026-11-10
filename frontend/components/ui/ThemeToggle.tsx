"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../lib/theme/ThemeContext";

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={resolvedTheme === "dark" ? "Kunduzgi rejimga o'tish (Light mode)" : "Tungi rejimga o'tish (Dark mode)"}
      aria-label="Toggle theme"
      className={`p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${className}`}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-slate-600" />
      )}
    </button>
  );
};
