// Стан індексно-послідовного пошуку (Zustand). Редагований об'єкт — масив цілих + ЦІЛЬ
// `target` + КРОК індексу `step` (розрідженість таблиці; головний параметр методу). На
// відміну від решти пошуків, документ несе ще й крок, тож ядро будуємо на спільному
// `arrayValueActions` (create-array-store) напряму, а target/step/sortValues/doc — тонко
// поверх. ПЕРЕДУМОВА — масив відсортований: `addValue` тримає порядок (keepSorted), є
// `sortValues`, пресети завантажують відсортовані масиви.

import { create } from "zustand"
import {
  issIntroPreset,
  issInIndexPreset,
  issAbsentPreset,
  issRandomPreset,
} from "@/store/indexed-sequential-search-presets"
import {
  arrayValueActions,
  intClamp,
  type ArrayValueActions,
} from "@/store/create-array-store"

/** Документ редактора: масив + ціль + крок індексу (серіалізовний). */
export interface IndexedSequentialSearchDoc {
  readonly values: readonly number[]
  readonly target: number
  readonly step: number
}

interface IndexedSequentialSearchState extends ArrayValueActions {
  readonly values: readonly number[]
  readonly target: number
  readonly step: number

  setTarget: (target: number) => void
  setStep: (step: number) => void
  sortValues: () => void
  loadDoc: (doc: IndexedSequentialSearchDoc) => void
  toDoc: () => IndexedSequentialSearchDoc

  loadIntro: () => void
  loadInIndex: () => void
  loadAbsent: () => void
  loadRandom: (seed: number) => void
}

/** Крок індексної таблиці — ціле ≥ 1 (нечисло → 1). */
const clampStep = (step: number): number =>
  Number.isFinite(step) ? Math.max(1, Math.trunc(step)) : 1

export const useIndexedSequentialSearchStore =
  create<IndexedSequentialSearchState>()((set, get) => {
    const init = issIntroPreset()
    return {
      values: init.values,
      target: init.target,
      step: init.step,
      ...arrayValueActions(set, intClamp, true),

      setTarget: (target) => set({ target: intClamp(target) }),
      setStep: (step) => set({ step: clampStep(step) }),
      sortValues: () =>
        set((s) => ({ values: [...s.values].sort((a, b) => a - b) })),

      loadDoc: (doc) =>
        set({
          values: doc.values.map(intClamp),
          target: intClamp(doc.target),
          step: clampStep(doc.step),
        }),
      toDoc: () => ({ values: get().values, target: get().target, step: get().step }),

      loadIntro: () => set(issIntroPreset()),
      loadInIndex: () => set(issInIndexPreset()),
      loadAbsent: () => set(issAbsentPreset()),
      loadRandom: (seed) => set(issRandomPreset(seed)),
    }
  })
