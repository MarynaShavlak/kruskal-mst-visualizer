// Стан KMP (Zustand). Редагований об'єкт — пара рядків: ТЕКСТ, у якому шукаємо, і ШАБЛОН
// (підрядок). Жодних передумов (рядки будь-які) і жодного графа. Спільна модель {text,
// pattern} для всіх рядкових алгоритмів серії.

import { create } from "zustand"
import {
  kmpMainPreset,
  kmpKonspectPreset,
  kmpWorstPreset,
  kmpNotFoundPreset,
  kmpRandomPreset,
} from "@/store/kmp-string-search-presets"

/** Документ редактора: текст + шаблон (серіалізовний). */
export interface KmpStringSearchDoc {
  readonly text: string
  readonly pattern: string
}

interface KmpStringSearchState {
  readonly text: string
  readonly pattern: string

  setText: (text: string) => void
  setPattern: (pattern: string) => void
  clear: () => void
  loadDoc: (doc: KmpStringSearchDoc) => void
  toDoc: () => KmpStringSearchDoc

  loadMain: () => void
  loadKonspect: () => void
  loadWorst: () => void
  loadNotFound: () => void
  loadRandom: (seed: number) => void
}

export const useKmpStringSearchStore = create<KmpStringSearchState>()((set, get) => ({
  ...kmpMainPreset(),

  setText: (text) => set({ text }),
  setPattern: (pattern) => set({ pattern }),
  clear: () => set({ text: "", pattern: "" }),

  loadDoc: (doc) => set({ text: String(doc.text), pattern: String(doc.pattern) }),
  toDoc: () => ({ text: get().text, pattern: get().pattern }),

  loadMain: () => set(kmpMainPreset()),
  loadKonspect: () => set(kmpKonspectPreset()),
  loadWorst: () => set(kmpWorstPreset()),
  loadNotFound: () => set(kmpNotFoundPreset()),
  loadRandom: (seed) => set(kmpRandomPreset(seed)),
}))
