// Мова інтерфейсу та контенту: ua / en. Глобальна, зберігається в localStorage
// (дефолт — ua). Навчальна вкладка вже двомовна; решта UI перекладається
// поетапно. Патерн дзеркалить theme-store.

import { create } from "zustand"

export type Lang = "ua" | "en"

const STORAGE_KEY = "kruskal-lang"

/** Виставляє `lang` на <html> — для доступності та коректної типографіки. */
function applyLang(lang: Lang): void {
  if (typeof document !== "undefined") {
    document.documentElement.lang = lang === "ua" ? "uk" : "en"
  }
}

function readStored(): Lang {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === "ua" || v === "en") return v
  } catch {
    /* ignore */
  }
  return "ua"
}

interface LangState {
  readonly lang: Lang
  setLang: (lang: Lang) => void
  toggle: () => void
}

export const useLangStore = create<LangState>()((set, get) => {
  const initial = readStored()
  applyLang(initial)

  return {
    lang: initial,
    setLang: (lang) => {
      try {
        localStorage.setItem(STORAGE_KEY, lang)
      } catch {
        /* ignore */
      }
      applyLang(lang)
      set({ lang })
    },
    toggle: () => get().setLang(get().lang === "ua" ? "en" : "ua"),
  }
})
