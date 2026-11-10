"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { Language } from "../../lib/i18n/translations";
import { Globe, ChevronDown } from "lucide-react";

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentCode = (language || "uzl").replace("uz-Latn", "uzl").replace("uz-Cyrl", "uzc").toUpperCase();

  const options: { code: Language; label: string; flag: string }[] = [
    { code: "uzl", label: "O'zbekcha (Lotin)", flag: "🇺🇿" },
    { code: "uzc", label: "Ўзбекча (Кирилл)", flag: "🇺🇿" },
    { code: "ru", label: "Русский", flag: "🇷🇺" },
    { code: "en", label: "English (US)", flag: "🇬🇧" },
  ];

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
        aria-label="Select language"
      >
        <Globe className="w-3.5 h-3.5 text-slate-400" />
        <span className="uppercase">{currentCode}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
          {options.map((opt) => {
            const active =
              language === opt.code ||
              (opt.code === "uzl" && language === "uz-Latn") ||
              (opt.code === "uzc" && language === "uz-Cyrl");
            return (
              <button
                key={opt.code}
                onClick={() => {
                  setLanguage(opt.code);
                  setOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition ${
                  active
                    ? "font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <span>{opt.flag} {opt.label}</span>
                {active && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
