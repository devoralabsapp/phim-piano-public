import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown, Globe2 } from "lucide-react";
import { useLanguage } from "../lib/i18n";
import type { Locale } from "../lib/locale";

const languages: { value: Locale; label: string; code: string }[] = [
  { value: "en", label: "English", code: "EN" },
  { value: "vi", label: "Tiếng Việt", code: "VI" },
];

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const options = useRef<(HTMLButtonElement | null)[]>([]);
  const selected = languages.findIndex((language) => language.value === locale);

  useEffect(() => {
    if (!open) return;
    options.current[active]?.focus();
  }, [open, active]);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  function close() {
    setOpen(false);
    trigger.current?.focus();
  }

  function navigate(event: KeyboardEvent) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      close();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();
      if (!open) {
        setActive(selected);
        setOpen(true);
      } else {
        setActive(
          (index) =>
            (index + (event.key === "ArrowDown" ? 1 : -1) + languages.length) %
            languages.length,
        );
      }
    } else if (open && (event.key === "Home" || event.key === "End")) {
      event.preventDefault();
      setActive(event.key === "Home" ? 0 : languages.length - 1);
    }
  }

  return (
    <div
      className="language-switch"
      ref={root}
      onKeyDown={navigate}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        className="language-trigger"
        aria-label={t("Ngôn ngữ")}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => {
          setActive(selected);
          setOpen((value) => !value);
        }}
      >
        <Globe2 className="language-globe" size={16} aria-hidden="true" />
        <span>{languages[selected].label}</span>
        <ChevronDown
          className="language-chevron"
          size={14}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div
          id={id}
          className="language-menu"
          role="menu"
          aria-label={t("Ngôn ngữ")}
        >
          <p className="language-menu-title">{t("Ngôn ngữ")}</p>
          {languages.map((language, index) => (
            <button
              key={language.value}
              ref={(element) => {
                options.current[index] = element;
              }}
              type="button"
              role="menuitemradio"
              aria-checked={locale === language.value}
              tabIndex={index === active ? 0 : -1}
              lang={language.value}
              className="language-option"
              onClick={() => {
                setLocale(language.value);
                close();
              }}
            >
              <span className="language-code" aria-hidden="true">
                {language.code}
              </span>
              <span>{language.label}</span>
              {locale === language.value && (
                <Check
                  className="language-check"
                  size={16}
                  aria-hidden="true"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
