// Стан пошуку Боєра-Мура (Zustand). Редагований об'єкт — пара рядків: ТЕКСТ, у якому
// шукаємо, і ШАБЛОН (підрядок). Жодних передумов (рядки будь-які) і жодного графа.
// Спільна модель {text, pattern} для всіх рядкових алгоритмів серії.

import { create } from "zustand"
import {
  bmMainPreset,
  bmBigJumpsPreset,
  bmWorstPreset,
  bmMultiPreset,
  bmRandomPreset,
} from "@/store/boyer-moore-string-search-presets"

/** Документ редактора: текст + шаблон (серіалізовний). */
export interface BoyerMooreStringSearchDoc {
  readonly text: string
  readonly pattern: string
}

interface BoyerMooreStringSearchState {
  readonly text: string
  readonly pattern: string

  setText: (text: string) => void
  setPattern: (pattern: string) => void
  clear: () => void
  loadDoc: (doc: BoyerMooreStringSearchDoc) => void
  toDoc: () => BoyerMooreStringSearchDoc

  loadMain: () => void
  loadBigJumps: () => void
  loadWorst: () => void
  loadMulti: () => void
  loadRandom: (seed: number) => void
}

export const useBoyerMooreStringSearchStore = create<BoyerMooreStringSearchState>()((set, get) => ({
  ...bmMainPreset(),

  setText: (text) => set({ text }),
  setPattern: (pattern) => set({ pattern }),
  clear: () => set({ text: "", pattern: "" }),

  loadDoc: (doc) => set({ text: String(doc.text), pattern: String(doc.pattern) }),
  toDoc: () => ({ text: get().text, pattern: get().pattern }),

  loadMain: () => set(bmMainPreset()),
  loadBigJumps: () => set(bmBigJumpsPreset()),
  loadWorst: () => set(bmWorstPreset()),
  loadMulti: () => set(bmMultiPreset()),
  loadRandom: (seed) => set(bmRandomPreset(seed)),
}))
