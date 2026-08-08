import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type ThemeMode = "dark" | "light";

export interface Palette {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  borderInput: string;
  text: string;
  textMuted: string;
  textMuted2: string;
  textMuted3: string;
  headerBg: string;
  accent: string;
  green: string;
  red: string;
  redSoft: string;
  sky: string;
  amber: string;
  shadow: string;
  shadowHover: string;
}

const DARK: Palette = {
  bg: "#020817",
  surface: "#0f172a",
  surfaceAlt: "#1e293b",
  border: "#1e293b",
  borderInput: "#334155",
  text: "#f1f5f9",
  textMuted: "#64748b",
  textMuted2: "#475569",
  textMuted3: "#94a3b8",
  headerBg: "rgba(15, 23, 42, 0.85)",
  accent: "#3b82f6",
  green: "#22c55e",
  red: "#ef4444",
  redSoft: "#fca5a5",
  sky: "#38bdf8",
  amber: "#f59e0b",
  shadow: "0 1px 2px rgba(2, 8, 23, 0.4)",
  shadowHover: "0 12px 28px -8px rgba(2, 8, 23, 0.6), 0 2px 8px rgba(2, 8, 23, 0.4)",
};

const LIGHT: Palette = {
  bg: "#f8fafc",
  surface: "#ffffff",
  surfaceAlt: "#f1f5f9",
  border: "#e2e8f0",
  borderInput: "#cbd5e1",
  text: "#0f172a",
  textMuted: "#64748b",
  textMuted2: "#94a3b8",
  textMuted3: "#475569",
  headerBg: "rgba(248, 250, 252, 0.85)",
  accent: "#3b82f6",
  green: "#16a34a",
  red: "#dc2626",
  redSoft: "#dc2626",
  sky: "#0284c7",
  amber: "#d97706",
  shadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
  shadowHover: "0 12px 24px -8px rgba(15, 23, 42, 0.12), 0 2px 8px rgba(15, 23, 42, 0.06)",
};

interface ThemeContextValue {
  mode: ThemeMode;
  colors: Palette;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "debt-tracker-theme";

function getInitialMode(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  return window.localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode);
    const colors = mode === "dark" ? DARK : LIGHT;
    document.documentElement.style.colorScheme = mode;
    document.body.style.background = colors.bg;
  }, [mode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      colors: mode === "dark" ? DARK : LIGHT,
      toggleTheme: () => setMode((m) => (m === "dark" ? "light" : "dark")),
    }),
    [mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
