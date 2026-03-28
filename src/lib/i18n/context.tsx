"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

type Locale = "kk" | "ru" | "en";
type Translations = Record<string, Record<string, string>>;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: "kk",
  setLocale: () => {},
  t: (key) => key,
});

export function useI18n() {
  return useContext(I18nContext);
}

function flattenObject(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, fullKey));
    } else {
      result[fullKey] = String(value);
    }
  }
  return result;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("kk");
  const [translations, setTranslations] = useState<Record<string, string>>({});

  const loadTranslations = useCallback(async (loc: Locale) => {
    try {
      const res = await fetch(`/locales/${loc}.json`);
      const data = await res.json();
      setTranslations(flattenObject(data));
    } catch {
      setTranslations({});
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved && ["kk", "ru", "en"].includes(saved)) {
      setLocaleState(saved);
      loadTranslations(saved);
    } else {
      loadTranslations("kk");
    }
  }, [loadTranslations]);

  const setLocale = useCallback((loc: Locale) => {
    setLocaleState(loc);
    localStorage.setItem("locale", loc);
    loadTranslations(loc);
  }, [loadTranslations]);

  const t = useCallback((key: string): string => {
    return translations[key] ?? key;
  }, [translations]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}
