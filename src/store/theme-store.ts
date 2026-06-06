// Тема застосунку: light / dark. Клас .dark вішається на <html>;
// shadcn-компоненти адаптуються через CSS-змінні автоматично.

import { create } from "zustand"

export type Theme = "light" | "dark"

const STORAGE_KEY = "kruskal-theme"

function systemPrefersDark(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

function applyClass(isDark: boolean): void {
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", isDark)
  }
}

/** Збережений вибір; за відсутності — одноразовий дефолт з системної теми. */
function readStored(): Theme {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === "light" || v === "dark") return v
  } catch {
    /* ignore */
  }
  return systemPrefersDark() ? "dark" : "light"
}

interface ThemeState {
  readonly theme: Theme
  readonly isDark: boolean
  setTheme: (theme: Theme) => void
  toggle: () => void
}

export const useThemeStore = create<ThemeState>()((set, get) => {
  const initial = readStored()
  applyClass(initial === "dark")

  return {
    theme: initial,
    isDark: initial === "dark",
    setTheme: (theme) => {
      try {
        localStorage.setItem(STORAGE_KEY, theme)
      } catch {
        /* ignore */
      }
      applyClass(theme === "dark")
      set({ theme, isDark: theme === "dark" })
    },
    toggle: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),
  }
})
