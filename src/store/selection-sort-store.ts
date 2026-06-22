// Стан сортування прямим вибором (Zustand). Редагований об'єкт — масив цілих ≥ 0, без
// графа; спільні мутації — у arrayCore (create-array-store), тут лише пресети.

import { create } from "zustand"
import {
  selectionIntroPreset,
  selectionBestPreset,
  selectionWorstPreset,
  selectionRandomPreset,
} from "@/store/selection-sort-presets"
import { arrayCore, type ArrayCore, type ArrayStoreDoc } from "@/store/create-array-store"

/** Документ редактора: масив чисел (серіалізовний). */
export type SelectionSortDoc = ArrayStoreDoc

interface SelectionSortState extends ArrayCore {
  loadIntro: () => void
  loadBest: () => void
  loadWorst: () => void
  loadRandom: (seed: number) => void
}

export const useSelectionSortStore = create<SelectionSortState>()((set, get) => ({
  ...arrayCore({ initial: selectionIntroPreset() }, set, get),

  loadIntro: () => set(selectionIntroPreset()),
  loadBest: () => set(selectionBestPreset()),
  loadWorst: () => set(selectionWorstPreset()),
  loadRandom: (seed) => set(selectionRandomPreset(seed)),
}))
