import { Palette } from "lucide-react";
import { useLanguage } from "../lib/i18n";
import { useTheme } from "../lib/theme-context";
import { themes } from "../lib/theme";
import PreferenceMenu from "./PreferenceMenu";
export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  return (
    <PreferenceMenu
      className="theme-switch"
      label={t("Giao diện")}
      value={theme}
      onChange={setTheme}
      icon={<Palette className="language-globe" size={16} aria-hidden="true" />}
      options={themes.map((item) => ({
        value: item.id,
        label: item.label,
        description: t(item.description),
        leading: (
          <span
            className="theme-swatch"
            data-theme-preview={item.id}
            aria-hidden="true"
          >
            <i />
            <i />
            <i />
          </span>
        ),
      }))}
    />
  );
}
