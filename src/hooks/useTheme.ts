import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

interface ThemeController {
  readonly theme: Theme;
  toggleTheme(): void;
}

const THEME_STORAGE_KEY = "archold-theme";
const DARK_THEME_QUERY = "(prefers-color-scheme: dark)";
const THEME_COLORS: Record<Theme, string> = { light: "#edf0e8", dark: "#0f1210" };

const getInitialTheme = (): Theme => {
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") return storedTheme;
  return window.matchMedia(DARK_THEME_QUERY).matches ? "dark" : "light";
};

export const useTheme = (): ThemeController => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);
  const toggleTheme = (): void => setTheme((current) => current === "light" ? "dark" : "light");
  return { theme, toggleTheme };
};
