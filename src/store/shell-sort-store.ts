// Стан сортування Шелла (Zustand). Редагований об'єкт — масив цілих ≥ 0, без графа;
// спільні мутації — у arrayCore (create-array-store), тут лише пресети.

import { create } from "zustand"
import {
  shellIntroPreset,
  shellSortedPreset,
  shellReversedPreset,
  shellDuplicatesPreset,
  shellRandomPreset,
} from "@/store/shell-sort-presets"
import { arrayCore, type ArrayCore, type ArrayStoreDoc } from "@/store/create-array-store"

/** Документ редактора: масив чисел (серіалізовний). */
export type ShellSortDoc = ArrayStoreDoc

interface ShellSortState extends ArrayCore {
  loadIntro: () => void
  loadSorted: () => void
  loadReversed: () => void
  loadDuplicates: () => void
  loadRandom: (seed: number) => void
}

export const useShellSortStore = create<ShellSortState>()((set, get) => ({
  ...arrayCore({ initial: shellIntroPreset() }, set, get),

  loadIntro: () => set(shellIntroPreset()),
  loadSorted: () => set(shellSortedPreset()),
  loadReversed: () => set(shellReversedPreset()),
  loadDuplicates: () => set(shellDuplicatesPreset()),
  loadRandom: (seed) => set(shellRandomPreset(seed)),
}))
