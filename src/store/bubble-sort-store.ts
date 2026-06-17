// Стан бульбашкового сортування (Zustand). Як tsp-store / knapsack-store, НЕ
// будується на graphCore (те ядро навколо ребер): тут редагований об'єкт — це
// просто масив цілих чисел, без ребер, ваг чи координат. Редактор пише, плеєр і
// навчальні віджети читають. Значення санітизуються в діях (цілі ≥0), щоб панель
// стовпчиків і ядро лишалися коректними.

import { create } from "zustand"
import {
  bubbleIntroPreset,
  bubbleBestPreset,
  bubbleWorstPreset,
  bubbleRandomPreset,
} from "@/store/bubble-sort-presets"

/** Документ редактора: масив чисел (серіалізовний). */
export interface BubbleSortDoc {
  readonly values: readonly number[]
}

interface BubbleSortState {
  readonly values: readonly number[]

  /** Додає число (дефолт — варіативне ціле, щоб масив одразу був «цікавим»). */
  addValue: () => void
  /** Оновлює значення за індексом (ціле ≥ 0). */
  updateValue: (index: number, value: number) => void
  removeValue: (index: number) => void
  /** Замінює весь масив (значення санітизуються). */
  setValues: (values: readonly number[]) => void
  clear: () => void
  loadDoc: (doc: BubbleSortDoc) => void
  toDoc: () => BubbleSortDoc

  loadIntro: () => void
  loadBest: () => void
  loadWorst: () => void
  loadRandom: (seed: number) => void
}

/** Ціле ≥ 0 (відкидає дробову частину; нечисло → 0). */
const clampValue = (value: number): number =>
  Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0

const sanitize = (values: readonly number[]): number[] => values.map(clampValue)

export const useBubbleSortStore = create<BubbleSortState>()((set, get) => ({
  ...bubbleIntroPreset(),

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

  loadIntro: () => set(bubbleIntroPreset()),
  loadBest: () => set(bubbleBestPreset()),
  loadWorst: () => set(bubbleWorstPreset()),
  loadRandom: (seed) => set(bubbleRandomPreset(seed)),
}))
