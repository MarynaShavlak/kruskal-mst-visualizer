// Стан бульбашкового сортування (Zustand). Редагований об'єкт — масив цілих ≥ 0, без
// графа; спільні мутації — у arrayCore (create-array-store), тут лише пресети. Редактор
// пише, плеєр і навчальні віджети читають.

import { create } from "zustand"
import {
  bubbleIntroPreset,
  bubbleBestPreset,
  bubbleWorstPreset,
  bubbleRandomPreset,
} from "@/store/bubble-sort-presets"
import { arrayCore, type ArrayCore, type ArrayStoreDoc } from "@/store/create-array-store"

/** Документ редактора: масив чисел (серіалізовний). */
export type BubbleSortDoc = ArrayStoreDoc

interface BubbleSortState extends ArrayCore {
  loadIntro: () => void
  loadBest: () => void
  loadWorst: () => void
  loadRandom: (seed: number) => void
}

export const useBubbleSortStore = create<BubbleSortState>()((set, get) => ({
  ...arrayCore({ initial: bubbleIntroPreset() }, set, get),

  loadIntro: () => set(bubbleIntroPreset()),
  loadBest: () => set(bubbleBestPreset()),
  loadWorst: () => set(bubbleWorstPreset()),
  loadRandom: (seed) => set(bubbleRandomPreset(seed)),
}))
