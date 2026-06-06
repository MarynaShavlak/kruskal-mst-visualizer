// Тема застосунку: light / dark / system. Клас .dark вішається на <html>;
// shadcn-компоненти адаптуються через CSS-змінні автоматично.

import { create } from "zustand"

export type Theme = "light" | "dark" | "system"

const STORAGE_KEY = "kruskal-theme"

function darkMql(): MediaQueryList | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return null
  }
  return window.matchMedia("(prefers-color-scheme: dark)")
}

function systemPrefersDark(): boolean {
  return darkMql()?.matches ?? false
}

function resolveIsDark(theme: Theme): boolean {
  return theme === "dark" || (theme === "system" && systemPrefersDark())
}

function applyClass(isDark: boolean): void {
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", isDark)
  }
}

function readStored(): Theme {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === "light" || v === "dark" || v === "system") return v
  } catch {
    /* ignore */
  }
  return "system"
}

interface ThemeState {
  readonly theme: Theme
  readonly isDark: boolean
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>()((set, get) => {
  const initial = readStored()
  applyClass(resolveIsDark(initial))

  darkMql()?.addEventListener("change", () => {
    if (get().theme !== "system") return
    const isDark = systemPrefersDark()
    applyClass(isDark)
    set({ isDark })
  })

  return {
    theme: initial,
    isDark: resolveIsDark(initial),
    setTheme: (theme) => {
      try {
        localStorage.setItem(STORAGE_KEY, theme)
      } catch {
        /* ignore */
      }
      const isDark = resolveIsDark(theme)
      applyClass(isDark)
      set({ theme, isDark })
    },
  }
})
