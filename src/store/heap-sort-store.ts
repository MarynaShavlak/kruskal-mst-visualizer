// Стан пірамідального сортування (Zustand). Редагований об'єкт — масив цілих ≥ 0,
// без графа; спільні мутації — у arrayCore (create-array-store), тут лише пресети.

import { create } from "zustand"
import {
  heapIntroPreset,
  heapSortedPreset,
  heapReversedPreset,
  heapDuplicatesPreset,
  heapRandomPreset,
} from "@/store/heap-sort-presets"
import { arrayCore, type ArrayCore, type ArrayStoreDoc } from "@/store/create-array-store"

/** Документ редактора: масив чисел (серіалізовний). */
export type HeapSortDoc = ArrayStoreDoc

interface HeapSortState extends ArrayCore {
  loadIntro: () => void
  loadSorted: () => void
  loadReversed: () => void
  loadDuplicates: () => void
  loadRandom: (seed: number) => void
}

export const useHeapSortStore = create<HeapSortState>()((set, get) => ({
  ...arrayCore({ initial: heapIntroPreset() }, set, get),

  loadIntro: () => set(heapIntroPreset()),
  loadSorted: () => set(heapSortedPreset()),
  loadReversed: () => set(heapReversedPreset()),
  loadDuplicates: () => set(heapDuplicatesPreset()),
  loadRandom: (seed) => set(heapRandomPreset(seed)),
}))
