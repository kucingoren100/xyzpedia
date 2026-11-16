"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 1. Check localStorage first
    const saved = localStorage.getItem("xyzpedia-theme") as Theme | null;
    if (saved === "light" || saved === "dark") {
      setThemeState(saved);
      document.documentElement.classList.toggle("dark", saved === "dark");
    } else {
      // 2. Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = prefersDark ? "dark" : "light";
      setThemeState(initial);
      document.documentElement.classList.toggle("dark", initial === "dark");
    }
    setMounted(true);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("xyzpedia-theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

/**
 * Reusable Pop-Brutalist Theme Toggle Button
 */
export function ThemeToggle({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
      title={isDark ? "Mode Terang" : "Mode Gelap"}
      className={`group relative inline-flex items-center justify-center rounded-xl ink-border transition-all duration-200 cursor-pointer ${
        isDark
          ? "bg-[#242430] text-[#ffd731] hover:bg-[#2d2d3d] shadow-[2px_2px_0px_0px_#ffffff]"
          : "bg-[#f3f4f6] text-carbon hover:bg-white shadow-[2px_2px_0px_0px_#000000]"
      } active:scale-95 ${
        size === "sm"
          ? "w-8 h-8 p-1.5"
          : size === "lg"
          ? "w-11 h-11 p-2.5"
          : "w-9 h-9 p-2"
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-[#ffd731] transition-transform duration-300 group-hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-carbon transition-transform duration-300 group-hover:-rotate-12" />
      )}
    </button>
  );
}
