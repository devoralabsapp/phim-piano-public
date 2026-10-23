import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  parseLocale,
  translate,
  beatLabel,
  languageKey,
  type Locale,
  type TranslationParams,
} from "./locale";
const I18nContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (source: string, params?: TranslationParams) => string;
  beats: (count: number) => string;
  dateLocale: string;
} | null>(null);
function initialLocale(): Locale {
  try {
    return parseLocale(localStorage.getItem(languageKey));
  } catch {
    return "en";
  }
}
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = translate(locale, "Phím · Học piano mỗi ngày");
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        translate(
          locale,
          "Học piano mỗi ngày với bài luyện có hướng dẫn, máy đếm nhịp và Yamaha MIDI trên iOS.",
        ),
      );
    try {
      localStorage.setItem(languageKey, locale);
    } catch {}
  }, [locale]);
  useEffect(() => {
    const listener = (event: StorageEvent) => {
      if (event.key === languageKey) setLocale(parseLocale(event.newValue));
    };
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, []);
  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t: (source, params) => translate(locale, source, params),
        beats: (count) => beatLabel(locale, count),
        dateLocale: locale === "en" ? "en-US" : "vi-VN",
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}
export function useLanguage() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("LanguageProvider is required");
  return context;
}
