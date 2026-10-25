import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { parseTheme, themeKey, themes, type Theme } from "./theme";
const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
} | null>(null);
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return parseTheme(localStorage.getItem(themeKey));
    } catch {
      return "sprout";
    }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        "content",
        themes.find((item) => item.id === theme)!.color,
      );
    try {
      localStorage.setItem(themeKey, theme);
    } catch {
      /* Guest practice still works without preference storage. */
    }
  }, [theme]);
  useEffect(() => {
    const update = (event: StorageEvent) => {
      if (event.key === themeKey || event.key === null)
        setTheme(parseTheme(event.newValue));
    };
    window.addEventListener("storage", update);
    return () => window.removeEventListener("storage", update);
  }, []);
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("ThemeProvider is required");
  return context;
}
