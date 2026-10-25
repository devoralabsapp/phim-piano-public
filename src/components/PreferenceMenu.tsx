import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Check, ChevronDown } from "lucide-react";
export type PreferenceOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
  lang?: string;
  leading?: ReactNode;
};

export default function PreferenceMenu<T extends string>({
  label,
  value,
  options: choices,
  onChange,
  icon,
  className = "",
}: {
  label: string;
  value: T;
  options: readonly PreferenceOption<T>[];
  onChange: (value: T) => void;
  icon: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const options = useRef<(HTMLButtonElement | null)[]>([]);
  const selected = choices.findIndex((choice) => choice.value === value);
  const menu = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const align = () => {
      const element = menu.current;
      if (!element) return;
      element.style.transform = "none";
      const box = element.getBoundingClientRect();
      const shift =
        box.left < 16
          ? 16 - box.left
          : box.right > window.innerWidth - 16
            ? window.innerWidth - 16 - box.right
            : 0;
      element.style.transform = `translateX(${shift}px)`;
    };
    align();
    window.addEventListener("resize", align);
    return () => window.removeEventListener("resize", align);
  }, [open]);

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
            (index + (event.key === "ArrowDown" ? 1 : -1) + choices.length) %
            choices.length,
        );
      }
    } else if (open && (event.key === "Home" || event.key === "End")) {
      event.preventDefault();
      setActive(event.key === "Home" ? 0 : choices.length - 1);
    }
  }

  return (
    <div
      className={`language-switch ${className}`}
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
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => {
          setActive(selected);
          setOpen((value) => !value);
        }}
      >
        {icon}
        <span>{choices[selected].label}</span>
        <ChevronDown
          className="language-chevron"
          size={14}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div
          id={id}
          ref={menu}
          className="language-menu"
          role="menu"
          aria-label={label}
        >
          <p className="language-menu-title">{label}</p>
          {choices.map((choice, index) => (
            <button
              key={choice.value}
              ref={(element) => {
                options.current[index] = element;
              }}
              type="button"
              role="menuitemradio"
              aria-label={choice.label}
              aria-checked={value === choice.value}
              tabIndex={index === active ? 0 : -1}
              lang={choice.lang}
              className="language-option"
              onClick={() => {
                onChange(choice.value);
                close();
              }}
            >
              {choice.leading}
              <span className="preference-copy">
                <span>{choice.label}</span>
                {choice.description && <small>{choice.description}</small>}
              </span>
              {value === choice.value && (
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
