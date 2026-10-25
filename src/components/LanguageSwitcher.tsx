import { Globe2 } from "lucide-react";
import { useLanguage } from "../lib/i18n";
import PreferenceMenu from "./PreferenceMenu";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();
  return (
    <PreferenceMenu
      label={t("Ngôn ngữ")}
      value={locale}
      onChange={setLocale}
      icon={<Globe2 className="language-globe" size={16} aria-hidden="true" />}
      options={[
        {
          value: "en",
          label: "English",
          lang: "en",
          leading: (
            <span className="language-code" aria-hidden="true">
              EN
            </span>
          ),
        },
        {
          value: "vi",
          label: "Tiếng Việt",
          lang: "vi",
          leading: (
            <span className="language-code" aria-hidden="true">
              VI
            </span>
          ),
        },
      ]}
    />
  );
}
