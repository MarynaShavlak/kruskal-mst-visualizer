// Стан наївного пошуку в рядках (Zustand). Редагований об'єкт — пара рядків:
// ТЕКСТ, у якому шукаємо, і ШАБЛОН (підрядок). Жодних передумов (рядки будь-які) і
// жодного графа. Спільна модель {text, pattern} для всіх рядкових алгоритмів серії.

import { create } from "zustand"
import {
  nssMainPreset,
  nssWorstPreset,
  nssNotFoundPreset,
  nssOverlapPreset,
  nssRandomPreset,
} from "@/store/naive-string-search-presets"

/** Документ редактора: текст + шаблон (серіалізовний). */
export interface NaiveStringSearchDoc {
  readonly text: string
  readonly pattern: string
}

interface NaiveStringSearchState {
  readonly text: string
  readonly pattern: string

  setText: (text: string) => void
  setPattern: (pattern: string) => void
  clear: () => void
  loadDoc: (doc: NaiveStringSearchDoc) => void
  toDoc: () => NaiveStringSearchDoc

  loadMain: () => void
  loadWorst: () => void
  loadNotFound: () => void
  loadOverlap: () => void
  loadRandom: (seed: number) => void
}

export const useNaiveStringSearchStore = create<NaiveStringSearchState>()((set, get) => ({
  ...nssMainPreset(),

  setText: (text) => set({ text }),
  setPattern: (pattern) => set({ pattern }),
  clear: () => set({ text: "", pattern: "" }),

  loadDoc: (doc) => set({ text: String(doc.text), pattern: String(doc.pattern) }),
  toDoc: () => ({ text: get().text, pattern: get().pattern }),

  loadMain: () => set(nssMainPreset()),
  loadWorst: () => set(nssWorstPreset()),
  loadNotFound: () => set(nssNotFoundPreset()),
  loadOverlap: () => set(nssOverlapPreset()),
  loadRandom: (seed) => set(nssRandomPreset(seed)),
}))
