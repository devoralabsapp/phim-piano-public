import { useLanguage } from "../lib/i18n";
export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();
  return (
    <label className="language-switch">
      <span className="sr-only">{t("Ngôn ngữ")}</span>
      <select
        aria-label={t("Ngôn ngữ")}
        value={locale}
        onChange={(e) => setLocale(e.target.value === "en" ? "en" : "vi")}
      >
        <option value="vi" lang="vi">
          Tiếng Việt
        </option>
        <option value="en" lang="en">
          English
        </option>
      </select>
    </label>
  );
}
