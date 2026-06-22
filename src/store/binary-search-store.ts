// Стан двійкового пошуку (Zustand). Редагований об'єкт — масив цілих + ЦІЛЬ `target`,
// без графа; спільні мутації — у searchCore (create-search-store), тут — пресети та
// `sortValues`. ПЕРЕДУМОВА методу — масив відсортований; стор не примушує цього
// автоматично, але `addValue` вставляє зі збереженням порядку (keepSorted), є дія
// `sortValues`, а пресети завжди завантажують відсортовані масиви.

import { create } from "zustand"
import {
  bsIntroPreset,
  bsDuplicatesPreset,
  bsAbsentPreset,
  bsRandomPreset,
} from "@/store/binary-search-presets"
import {
  searchCore,
  type SearchCore,
  type SearchStoreDoc,
} from "@/store/create-search-store"

/** Документ редактора: масив чисел + ціль пошуку (серіалізовний). */
export type BinarySearchDoc = SearchStoreDoc

interface BinarySearchState extends SearchCore {
  sortValues: () => void
  loadIntro: () => void
  loadDuplicates: () => void
  loadAbsent: () => void
  loadRandom: (seed: number) => void
}

export const useBinarySearchStore = create<BinarySearchState>()((set, get) => ({
  ...searchCore({ initial: bsIntroPreset(), keepSorted: true }, set, get),

  sortValues: () => set((s) => ({ values: [...s.values].sort((a, b) => a - b) })),

  loadIntro: () => set(bsIntroPreset()),
  loadDuplicates: () => set(bsDuplicatesPreset()),
  loadAbsent: () => set(bsAbsentPreset()),
  loadRandom: (seed) => set(bsRandomPreset(seed)),
}))
