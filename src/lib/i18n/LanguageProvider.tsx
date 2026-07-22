"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { DEFAULT_LANG, LANG_STORAGE_KEY, isLang, t, type CopyKey, type Lang } from "./index";

/*
 * Module-level language store (F-004 contract, consumed by the landing page):
 * localStorage 'mobeeli-lang' is the source of truth, with an in-memory
 * fallback when storage is unavailable. Exposed through useSyncExternalStore
 * so SSR hydrates with the default language and the persisted choice applies
 * right after mount — every subscribed string switches instantly.
 */

let memoryLang: Lang = DEFAULT_LANG;
const listeners = new Set<() => void>();

function getLangSnapshot(): Lang {
  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (isLang(stored)) return stored;
  } catch {
    /* storage unavailable — fall back to the in-memory choice */
  }
  return memoryLang;
}

function getServerLangSnapshot(): Lang {
  return DEFAULT_LANG;
}

function subscribeLang(callback: () => void): () => void {
  listeners.add(callback);
  // Cross-tab sync: another tab persisting a language change notifies us too.
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function storeLang(next: Lang): void {
  memoryLang = next;
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, next);
  } catch {
    /* storage unavailable — choice lives for the session only */
  }
  for (const listener of listeners) listener();
}

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: DEFAULT_LANG,
  setLang: storeLang,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribeLang, getLangSnapshot, getServerLangSnapshot);

  // Keep the <html lang> attribute in sync with the active language.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang: storeLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): LanguageContextValue {
  return useContext(LanguageContext);
}

/** Translate against the active language. */
export function useT(): (key: CopyKey) => string {
  const { lang } = useContext(LanguageContext);
  return useCallback((key: CopyKey) => t(lang, key), [lang]);
}
