// Глобальний тумблер режиму «Вгадай рішення» (predict-before-reveal). Як lang/
// theme — один прапорець, persist у localStorage, дефолт OFF (щоб не заважати
// тим, хто просто дивиться плеєр). Стан тумблера ЖИВЕ ПОЗА sig плеєра, тож
// перемикання не скидає курсор trace. Патерн дзеркалить lang-store.

import { create } from "zustand"

const STORAGE_KEY = "kruskal-predict"

function readStored(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

interface PredictState {
  readonly enabled: boolean
  setEnabled: (enabled: boolean) => void
  toggle: () => void
}

export const usePredictStore = create<PredictState>()((set, get) => ({
  enabled: readStored(),
  setEnabled: (enabled) => {
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0")
    } catch {
      /* ignore */
    }
    set({ enabled })
  },
  toggle: () => get().setEnabled(!get().enabled),
}))
