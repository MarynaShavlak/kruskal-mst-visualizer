// Стан лінійного пошуку (Zustand). Редагований об'єкт — масив цілих + ЦІЛЬ `target`,
// без графа; спільні мутації — у searchCore (create-search-store), тут лише пресети.
// Значення можуть бути будь-якими цілими (пошук не потребує передумов), масив не
// тримається відсортованим.

import { create } from "zustand"
import {
  lsMainPreset,
  lsDuplicatesPreset,
  lsSortedPreset,
  lsRandomPreset,
} from "@/store/linear-search-presets"
import {
  searchCore,
  type SearchCore,
  type SearchStoreDoc,
} from "@/store/create-search-store"

/** Документ редактора: масив чисел + ціль пошуку (серіалізовний). */
export type LinearSearchDoc = SearchStoreDoc

interface LinearSearchState extends SearchCore {
  loadMain: () => void
  loadDuplicates: () => void
  loadSorted: () => void
  loadRandom: (seed: number) => void
}

export const useLinearSearchStore = create<LinearSearchState>()((set, get) => ({
  ...searchCore({ initial: lsMainPreset() }, set, get),

  loadMain: () => set(lsMainPreset()),
  loadDuplicates: () => set(lsDuplicatesPreset()),
  loadSorted: () => set(lsSortedPreset()),
  loadRandom: (seed) => set(lsRandomPreset(seed)),
}))
