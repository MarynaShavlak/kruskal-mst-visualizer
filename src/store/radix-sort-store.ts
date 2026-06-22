// Стан порозрядного сортування (Zustand). Редагований об'єкт — масив НЕВІД'ЄМНИХ цілих,
// без графа; спільні мутації — у arrayCore (create-array-store), тут лише пресети.

import { create } from "zustand"
import {
  radixIntroPreset,
  radixEqualPreset,
  radixDuplicatesPreset,
  radixBigPreset,
  radixRandomPreset,
} from "@/store/radix-sort-presets"
import { arrayCore, type ArrayCore, type ArrayStoreDoc } from "@/store/create-array-store"

/** Документ редактора: масив чисел (серіалізовний). */
export type RadixSortDoc = ArrayStoreDoc

interface RadixSortState extends ArrayCore {
  loadIntro: () => void
  loadEqual: () => void
  loadDuplicates: () => void
  loadBig: () => void
  loadRandom: (seed: number) => void
}

export const useRadixSortStore = create<RadixSortState>()((set, get) => ({
  ...arrayCore({ initial: radixIntroPreset() }, set, get),

  loadIntro: () => set(radixIntroPreset()),
  loadEqual: () => set(radixEqualPreset()),
  loadDuplicates: () => set(radixDuplicatesPreset()),
  loadBig: () => set(radixBigPreset()),
  loadRandom: (seed) => set(radixRandomPreset(seed)),
}))
