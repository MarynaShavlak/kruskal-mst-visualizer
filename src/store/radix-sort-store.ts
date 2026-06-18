// Стан порозрядного сортування (Zustand). Як shell-sort-store / merge-sort-store,
// НЕ будується на graphCore: редагований об'єкт — масив НЕВІД'ЄМНИХ цілих, без графа.
// Редактор пише, плеєр і навчальні віджети читають. Значення санітизуються (≥0).

import { create } from "zustand"
import {
  radixIntroPreset,
  radixEqualPreset,
  radixDuplicatesPreset,
  radixBigPreset,
  radixRandomPreset,
} from "@/store/radix-sort-presets"

/** Документ редактора: масив чисел (серіалізовний). */
export interface RadixSortDoc {
  readonly values: readonly number[]
}

interface RadixSortState {
  readonly values: readonly number[]

  addValue: () => void
  updateValue: (index: number, value: number) => void
  removeValue: (index: number) => void
  setValues: (values: readonly number[]) => void
  clear: () => void
  loadDoc: (doc: RadixSortDoc) => void
  toDoc: () => RadixSortDoc

  loadIntro: () => void
  loadEqual: () => void
  loadDuplicates: () => void
  loadBig: () => void
  loadRandom: (seed: number) => void
}

const clampValue = (value: number): number =>
  Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0

const sanitize = (values: readonly number[]): number[] => values.map(clampValue)

export const useRadixSortStore = create<RadixSortState>()((set, get) => ({
  ...radixIntroPreset(),

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

  clear: () => set({ values: [] }),

  loadDoc: (doc) => set({ values: sanitize(doc.values) }),

  toDoc: () => ({ values: get().values }),

  loadIntro: () => set(radixIntroPreset()),
  loadEqual: () => set(radixEqualPreset()),
  loadDuplicates: () => set(radixDuplicatesPreset()),
  loadBig: () => set(radixBigPreset()),
  loadRandom: (seed) => set(radixRandomPreset(seed)),
}))
