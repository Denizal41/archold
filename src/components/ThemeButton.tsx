import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

export const ThemeButton = (): React.JSX.Element => {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === "light" ? "dark" : "light";
  return <button
    className="theme-button"
    onClick={toggleTheme}
    aria-label={`Switch to ${nextTheme} theme`}
    title={`Switch to ${nextTheme} theme`}
  >{theme === "light" ? <Moon size={16}/> : <Sun size={16}/>}</button>;
};
