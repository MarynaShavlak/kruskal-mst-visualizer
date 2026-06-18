// Стан сортування Шелла (Zustand). Як merge-sort-store / quick-sort-store, НЕ
// будується на graphCore: редагований об'єкт — масив цілих чисел, без графа.
// Редактор пише, плеєр і навчальні віджети читають. Значення санітизуються (≥0).

import { create } from "zustand"
import {
  shellIntroPreset,
  shellSortedPreset,
  shellReversedPreset,
  shellDuplicatesPreset,
  shellRandomPreset,
} from "@/store/shell-sort-presets"

/** Документ редактора: масив чисел (серіалізовний). */
export interface ShellSortDoc {
  readonly values: readonly number[]
}

interface ShellSortState {
  readonly values: readonly number[]

  addValue: () => void
  updateValue: (index: number, value: number) => void
  removeValue: (index: number) => void
  setValues: (values: readonly number[]) => void
  clear: () => void
  loadDoc: (doc: ShellSortDoc) => void
  toDoc: () => ShellSortDoc

  loadIntro: () => void
  loadSorted: () => void
  loadReversed: () => void
  loadDuplicates: () => void
  loadRandom: (seed: number) => void
}

const clampValue = (value: number): number =>
  Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0

const sanitize = (values: readonly number[]): number[] => values.map(clampValue)

export const useShellSortStore = create<ShellSortState>()((set, get) => ({
  ...shellIntroPreset(),

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

  loadIntro: () => set(shellIntroPreset()),
  loadSorted: () => set(shellSortedPreset()),
  loadReversed: () => set(shellReversedPreset()),
  loadDuplicates: () => set(shellDuplicatesPreset()),
  loadRandom: (seed) => set(shellRandomPreset(seed)),
}))
