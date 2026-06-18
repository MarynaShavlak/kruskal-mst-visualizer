// Стан лінійного пошуку (Zustand). Як sort-стори, НЕ будується на graphCore:
// редагований об'єкт — масив цілих + ЦІЛЬ пошуку `target`, без графа. Редактор
// пише, плеєр і навчальні віджети читають. На відміну від порозрядного, значення
// можуть бути будь-якими цілими (зокрема від'ємними) — пошук не потребує передумов.

import { create } from "zustand"
import {
  lsMainPreset,
  lsDuplicatesPreset,
  lsSortedPreset,
  lsRandomPreset,
} from "@/store/linear-search-presets"

/** Документ редактора: масив чисел + ціль пошуку (серіалізовний). */
export interface LinearSearchDoc {
  readonly values: readonly number[]
  readonly target: number
}

interface LinearSearchState {
  readonly values: readonly number[]
  readonly target: number

  addValue: () => void
  updateValue: (index: number, value: number) => void
  removeValue: (index: number) => void
  setValues: (values: readonly number[]) => void
  setTarget: (target: number) => void
  clear: () => void
  loadDoc: (doc: LinearSearchDoc) => void
  toDoc: () => LinearSearchDoc

  loadMain: () => void
  loadDuplicates: () => void
  loadSorted: () => void
  loadRandom: (seed: number) => void
}

const clampValue = (value: number): number =>
  Number.isFinite(value) ? Math.trunc(value) : 0

const sanitize = (values: readonly number[]): number[] => values.map(clampValue)

export const useLinearSearchStore = create<LinearSearchState>()((set, get) => ({
  ...lsMainPreset(),

  addValue: () =>
    set((s) => ({
      values: [...s.values, ((s.values.length * 37 + 13) % 90) + 1],
    })),

  updateValue: (index, value) =>
    set((s) => {
      if (index < 0 || index >= s.values.length) return {}
      return {
        values: s.values.map((v, i) => (i === index ? clampValue(value) : v)),
      }
    }),

  removeValue: (index) =>
    set((s) => {
      if (index < 0 || index >= s.values.length) return {}
      return { values: s.values.filter((_, i) => i !== index) }
    }),

  setValues: (values) => set({ values: sanitize(values) }),

  setTarget: (target) => set({ target: clampValue(target) }),

  clear: () => set({ values: [] }),

  loadDoc: (doc) =>
    set({ values: sanitize(doc.values), target: clampValue(doc.target) }),

  toDoc: () => ({ values: get().values, target: get().target }),

  loadMain: () => set(lsMainPreset()),
  loadDuplicates: () => set(lsDuplicatesPreset()),
  loadSorted: () => set(lsSortedPreset()),
  loadRandom: (seed) => set(lsRandomPreset(seed)),
}))
