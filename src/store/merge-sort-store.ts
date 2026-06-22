// Стан сортування злиттям (Zustand). Редагований об'єкт — масив цілих ≥ 0, без графа;
// спільні мутації — у arrayCore (create-array-store), тут лише пресети.

import { create } from "zustand"
import {
  mergeIntroPreset,
  mergeSortedPreset,
  mergeReversedPreset,
  mergeDuplicatesPreset,
  mergeRandomPreset,
} from "@/store/merge-sort-presets"
import { arrayCore, type ArrayCore, type ArrayStoreDoc } from "@/store/create-array-store"

/** Документ редактора: масив чисел (серіалізовний). */
export type MergeSortDoc = ArrayStoreDoc

interface MergeSortState extends ArrayCore {
  loadIntro: () => void
  loadSorted: () => void
  loadReversed: () => void
  loadDuplicates: () => void
  loadRandom: (seed: number) => void
}

export const useMergeSortStore = create<MergeSortState>()((set, get) => ({
  ...arrayCore({ initial: mergeIntroPreset() }, set, get),

  loadIntro: () => set(mergeIntroPreset()),
  loadSorted: () => set(mergeSortedPreset()),
  loadReversed: () => set(mergeReversedPreset()),
  loadDuplicates: () => set(mergeDuplicatesPreset()),
  loadRandom: (seed) => set(mergeRandomPreset(seed)),
}))
