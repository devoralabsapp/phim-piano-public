import { english } from "./locales/en";
export type Locale = "vi" | "en";
export type TranslationParams = Record<string, string | number>;
export const languageKey = "phim:language";
export function parseLocale(value: unknown): Locale {
  return value === "vi" ? "vi" : "en";
}
export function translate(
  locale: Locale,
  source: string,
  params: TranslationParams = {},
): string {
  let result = source;
  if (locale === "en") {
    if (Object.hasOwn(english, source)) result = english[source];
    else if (Object.hasOwn(english, source.trim()))
      result =
        (source.match(/^\s*/)?.[0] ?? "") +
        english[source.trim()] +
        (source.match(/\s*$/)?.[0] ?? "");
  }
  if (locale === "en" && result === source) {
    for (const prefix of [
      "Không tạo được MIDI client: ",
      "Không mở được MIDI input: ",
      "Không xuất được tiến độ: ",
    ]) {
      if (source.startsWith(prefix)) {
        result = english[prefix] + source.slice(prefix.length);
        break;
      }
    }
  }
  return result.replace(/\{(\w+)\}/g, (match, key) =>
    Object.hasOwn(params, key) ? String(params[key]) : match,
  );
}
export function beatLabel(locale: Locale, count: number) {
  const value =
    Math.abs(count - 1 / 3) < 1e-8
      ? "⅓"
      : Math.abs(count - 2 / 3) < 1e-8
        ? "⅔"
        : String(count);
  return locale === "vi"
    ? `${value} phách`
    : `${value} ${count === 1 ? "beat" : "beats"}`;
}
