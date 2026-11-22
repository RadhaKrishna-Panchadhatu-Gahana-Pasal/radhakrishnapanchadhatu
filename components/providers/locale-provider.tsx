'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  LOCALE_STORAGE_KEY,
  translate,
  type Locale,
  type TranslationKey,
} from '@/lib/i18n/dictionary';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: TranslationKey) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored === 'en' || stored === 'ne') setLocaleState(stored);
    } catch {
      // storage unavailable — English stays
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === 'ne' ? 'ne' : 'en';
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'en' ? 'ne' : 'en');
  }, [locale, setLocale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t: (key: TranslationKey) => translate(locale, key),
    }),
    [locale, setLocale, toggleLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used inside LocaleProvider');
  return context;
}
