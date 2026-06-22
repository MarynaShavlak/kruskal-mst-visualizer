// Стан швидкого сортування (Zustand). Редагований об'єкт — масив цілих ≥ 0, без графа;
// спільні мутації — у arrayCore (create-array-store), тут лише пресети.

import { create } from "zustand"
import {
  quickIntroPreset,
  quickSortedPreset,
  quickDuplicatesPreset,
  quickRandomPreset,
} from "@/store/quick-sort-presets"
import { arrayCore, type ArrayCore, type ArrayStoreDoc } from "@/store/create-array-store"

/** Документ редактора: масив чисел (серіалізовний). */
export type QuickSortDoc = ArrayStoreDoc

interface QuickSortState extends ArrayCore {
  loadIntro: () => void
  loadSorted: () => void
  loadDuplicates: () => void
  loadRandom: (seed: number) => void
}

export const useQuickSortStore = create<QuickSortState>()((set, get) => ({
  ...arrayCore({ initial: quickIntroPreset() }, set, get),

  loadIntro: () => set(quickIntroPreset()),
  loadSorted: () => set(quickSortedPreset()),
  loadDuplicates: () => set(quickDuplicatesPreset()),
  loadRandom: (seed) => set(quickRandomPreset(seed)),
}))
