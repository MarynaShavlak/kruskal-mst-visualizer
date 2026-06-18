// Стан індексно-послідовного пошуку (Zustand). Як binary-search-store, НЕ будується
// на graphCore: редагований об'єкт — масив цілих + ЦІЛЬ `target` + КРОК індексу
// `step` (розрідженість таблиці; головний параметр методу). ПЕРЕДУМОВА — масив
// відсортований; стор не примушує цього автоматично, але має `sortValues`, а пресети
// завжди завантажують відсортовані масиви. Новий елемент вставляється зі збереженням
// порядку.

import { create } from "zustand"
import {
  issIntroPreset,
  issInIndexPreset,
  issAbsentPreset,
  issRandomPreset,
} from "@/store/indexed-sequential-search-presets"

/** Документ редактора: масив + ціль + крок індексу (серіалізовний). */
export interface IndexedSequentialSearchDoc {
  readonly values: readonly number[]
  readonly target: number
  readonly step: number
}

interface IndexedSequentialSearchState {
  readonly values: readonly number[]
  readonly target: number
  readonly step: number

  addValue: () => void
  updateValue: (index: number, value: number) => void
  removeValue: (index: number) => void
  setValues: (values: readonly number[]) => void
  setTarget: (target: number) => void
  setStep: (step: number) => void
  sortValues: () => void
  clear: () => void
  loadDoc: (doc: IndexedSequentialSearchDoc) => void
  toDoc: () => IndexedSequentialSearchDoc

  loadIntro: () => void
  loadInIndex: () => void
  loadAbsent: () => void
  loadRandom: (seed: number) => void
}

const clampValue = (value: number): number =>
  Number.isFinite(value) ? Math.trunc(value) : 0

const clampStep = (step: number): number =>
  Number.isFinite(step) ? Math.max(1, Math.trunc(step)) : 1

const sanitize = (values: readonly number[]): number[] => values.map(clampValue)

export const useIndexedSequentialSearchStore = create<IndexedSequentialSearchState>()((set, get) => ({
  ...issIntroPreset(),

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

  setStep: (step) => set({ step: clampStep(step) }),

  sortValues: () => set((s) => ({ values: [...s.values].sort((a, b) => a - b) })),

  clear: () => set({ values: [] }),

  loadDoc: (doc) =>
    set({
      values: sanitize(doc.values),
      target: clampValue(doc.target),
      step: clampStep(doc.step),
    }),

  toDoc: () => ({ values: get().values, target: get().target, step: get().step }),

  loadIntro: () => set(issIntroPreset()),
  loadInIndex: () => set(issInIndexPreset()),
  loadAbsent: () => set(issAbsentPreset()),
  loadRandom: (seed) => set(issRandomPreset(seed)),
}))
