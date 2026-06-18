// Стан сортування злиттям (Zustand). Як quick-sort-store / selection-sort-store,
// НЕ будується на graphCore: редагований об'єкт — це масив цілих чисел, без ребер,
// ваг чи координат. Редактор пише, плеєр і навчальні віджети читають. Значення
// санітизуються в діях (цілі ≥0).

import { create } from "zustand"
import {
  mergeIntroPreset,
  mergeSortedPreset,
  mergeReversedPreset,
  mergeDuplicatesPreset,
  mergeRandomPreset,
} from "@/store/merge-sort-presets"

/** Документ редактора: масив чисел (серіалізовний). */
export interface MergeSortDoc {
  readonly values: readonly number[]
}

interface MergeSortState {
  readonly values: readonly number[]

  addValue: () => void
  updateValue: (index: number, value: number) => void
  removeValue: (index: number) => void
  setValues: (values: readonly number[]) => void
  clear: () => void
  loadDoc: (doc: MergeSortDoc) => void
  toDoc: () => MergeSortDoc

  loadIntro: () => void
  loadSorted: () => void
  loadReversed: () => void
  loadDuplicates: () => void
  loadRandom: (seed: number) => void
}

/** Ціле ≥ 0 (відкидає дробову частину; нечисло → 0). */
const clampValue = (value: number): number =>
  Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0

const sanitize = (values: readonly number[]): number[] => values.map(clampValue)

export const useMergeSortStore = create<MergeSortState>()((set, get) => ({
  ...mergeIntroPreset(),

  addValue: () =>
    set((s) => ({
      // Псевдовипадкове, але детерміноване від довжини — щоб додані числа різнилися.
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

  loadIntro: () => set(mergeIntroPreset()),
  loadSorted: () => set(mergeSortedPreset()),
  loadReversed: () => set(mergeReversedPreset()),
  loadDuplicates: () => set(mergeDuplicatesPreset()),
  loadRandom: (seed) => set(mergeRandomPreset(seed)),
}))
