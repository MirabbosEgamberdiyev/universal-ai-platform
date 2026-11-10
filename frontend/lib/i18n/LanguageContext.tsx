"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Language, translations, Translations } from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "uzl",
  setLanguage: () => {},
  t: translations.uzl,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("uzl");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("omniagent_lang") as Language;
      if (saved) {
        if (saved === "uz-Latn" || saved === "uzl") setLanguageState("uzl");
        else if (saved === "uz-Cyrl" || saved === "uzc") setLanguageState("uzc");
        else if (saved === "ru") setLanguageState("ru");
        else if (saved === "en") setLanguageState("en");
      }
    } catch {
      // localStorage may not be available in SSR
    }
  }, []);

  const setLanguage = (lang: Language) => {
    let normalized: Language = lang;
    if (lang === "uz-Latn") normalized = "uzl";
    if (lang === "uz-Cyrl") normalized = "uzc";
    setLanguageState(normalized);
    try {
      localStorage.setItem("omniagent_lang", normalized);
    } catch {
      // ignore
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] || translations.uzl }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
