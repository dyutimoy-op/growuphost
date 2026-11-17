import { useEffect, useState, useCallback } from "react";

export type Theme = "dark" | "light";

export const STORAGE_KEY = "growuphost_theme_v2";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark") return "dark";
    if (saved === "light") return "light";
  } catch {
    // Ignore localStorage access errors in private/sandboxed modes
  }

  return "light";
}

export function applyThemeToDOM(theme: Theme): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
  } else {
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
  }

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute("content", theme === "dark" ? "#020617" : "#2563eb");
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const initial = getInitialTheme();
    setThemeState(initial);
    applyThemeToDOM(initial);

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && (event.newValue === "light" || event.newValue === "dark")) {
        setThemeState(event.newValue);
        applyThemeToDOM(event.newValue);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyThemeToDOM(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore localStorage access errors
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      applyThemeToDOM(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Ignore localStorage access errors
      }
      return next;
    });
  }, []);

  return {
    theme,
    isDark: theme === "dark",
    isLight: theme === "light",
    setTheme,
    toggleTheme,
  };
}
