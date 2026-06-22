// Стан сортування вставками (Zustand). Редагований об'єкт — масив цілих ≥ 0, без графа;
// спільні мутації — у arrayCore (create-array-store), тут лише пресети.

import { create } from "zustand"
import {
  insertionIntroPreset,
  insertionBestPreset,
  insertionWorstPreset,
  insertionRandomPreset,
} from "@/store/insertion-sort-presets"
import { arrayCore, type ArrayCore, type ArrayStoreDoc } from "@/store/create-array-store"

/** Документ редактора: масив чисел (серіалізовний). */
export type InsertionSortDoc = ArrayStoreDoc

interface InsertionSortState extends ArrayCore {
  loadIntro: () => void
  loadBest: () => void
  loadWorst: () => void
  loadRandom: (seed: number) => void
}

export const useInsertionSortStore = create<InsertionSortState>()((set, get) => ({
  ...arrayCore({ initial: insertionIntroPreset() }, set, get),

  loadIntro: () => set(insertionIntroPreset()),
  loadBest: () => set(insertionBestPreset()),
  loadWorst: () => set(insertionWorstPreset()),
  loadRandom: (seed) => set(insertionRandomPreset(seed)),
}))
