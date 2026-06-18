// Стан двійкового пошуку (Zustand). Як linear-search-store, НЕ будується на
// graphCore: редагований об'єкт — масив цілих + ЦІЛЬ пошуку `target`, без графа.
// ПЕРЕДУМОВА двійкового пошуку — масив відсортований; стор не примушує цього
// автоматично (щоб показати, що буває на невпорядкованих даних), але має дію
// `sortValues` і пресети завжди завантажують відсортовані масиви.

import { create } from "zustand"
import {
  bsIntroPreset,
  bsDuplicatesPreset,
  bsAbsentPreset,
  bsRandomPreset,
} from "@/store/binary-search-presets"

/** Документ редактора: масив чисел + ціль пошуку (серіалізовний). */
export interface BinarySearchDoc {
  readonly values: readonly number[]
  readonly target: number
}

interface BinarySearchState {
  readonly values: readonly number[]
  readonly target: number

  addValue: () => void
  updateValue: (index: number, value: number) => void
  removeValue: (index: number) => void
  setValues: (values: readonly number[]) => void
  setTarget: (target: number) => void
  sortValues: () => void
  clear: () => void
  loadDoc: (doc: BinarySearchDoc) => void
  toDoc: () => BinarySearchDoc

  loadIntro: () => void
  loadDuplicates: () => void
  loadAbsent: () => void
  loadRandom: (seed: number) => void
}

const clampValue = (value: number): number =>
  Number.isFinite(value) ? Math.trunc(value) : 0

const sanitize = (values: readonly number[]): number[] => values.map(clampValue)

export const useBinarySearchStore = create<BinarySearchState>()((set, get) => ({
  ...bsIntroPreset(),

  // Нове число вставляємо так, щоб масив лишився відсортованим (передумова).
  addValue: () =>
    set((s) => {
      const next = ((s.values.length * 37 + 13) % 90) + 1
      const out = [...s.values, next].sort((a, b) => a - b)
      return { values: out }
    }),

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

  sortValues: () => set((s) => ({ values: [...s.values].sort((a, b) => a - b) })),

  clear: () => set({ values: [] }),

  loadDoc: (doc) =>
    set({ values: sanitize(doc.values), target: clampValue(doc.target) }),

  toDoc: () => ({ values: get().values, target: get().target }),

  loadIntro: () => set(bsIntroPreset()),
  loadDuplicates: () => set(bsDuplicatesPreset()),
  loadAbsent: () => set(bsAbsentPreset()),
  loadRandom: (seed) => set(bsRandomPreset(seed)),
}))
