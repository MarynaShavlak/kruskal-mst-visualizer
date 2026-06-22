// Стан пошуку Рабіна-Карпа (Zustand). Редагований об'єкт — пара рядків: ТЕКСТ, у якому
// шукаємо, і ШАБЛОН (підрядок). Жодних передумов (рядки будь-які) і жодного графа.
// Спільна модель {text, pattern} для всіх рядкових алгоритмів серії.

import { create } from "zustand"
import {
  rkMainPreset,
  rkCollisionPreset,
  rkMultiPreset,
  rkNotFoundPreset,
  rkRandomPreset,
} from "@/store/rabin-karp-string-search-presets"

/** Документ редактора: текст + шаблон (серіалізовний). */
export interface RabinKarpStringSearchDoc {
  readonly text: string
  readonly pattern: string
}

interface RabinKarpStringSearchState {
  readonly text: string
  readonly pattern: string

  setText: (text: string) => void
  setPattern: (pattern: string) => void
  clear: () => void
  loadDoc: (doc: RabinKarpStringSearchDoc) => void
  toDoc: () => RabinKarpStringSearchDoc

  loadMain: () => void
  loadCollision: () => void
  loadMulti: () => void
  loadNotFound: () => void
  loadRandom: (seed: number) => void
}

export const useRabinKarpStringSearchStore = create<RabinKarpStringSearchState>()((set, get) => ({
  ...rkMainPreset(),

  setText: (text) => set({ text }),
  setPattern: (pattern) => set({ pattern }),
  clear: () => set({ text: "", pattern: "" }),

  loadDoc: (doc) => set({ text: String(doc.text), pattern: String(doc.pattern) }),
  toDoc: () => ({ text: get().text, pattern: get().pattern }),

  loadMain: () => set(rkMainPreset()),
  loadCollision: () => set(rkCollisionPreset()),
  loadMulti: () => set(rkMultiPreset()),
  loadNotFound: () => set(rkNotFoundPreset()),
  loadRandom: (seed) => set(rkRandomPreset(seed)),
}))
