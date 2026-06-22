// Стан інтерполяційного пошуку (Zustand). Редагований об'єкт — масив цілих + ЦІЛЬ
// `target`, без графа; спільні мутації — у searchCore (create-search-store), тут —
// пресети та `sortValues`. ПЕРЕДУМОВА методу — масив відсортований; стор не примушує
// цього (щоб показати деградацію на «поганих» даних), але `addValue` тримає порядок
// (keepSorted), є дія `sortValues`, а пресети завантажують відсортовані масиви.

import { create } from "zustand"
import {
  ipDemo1Preset,
  ipDemo2Preset,
  ipClusteredPreset,
  ipRandomPreset,
} from "@/store/interpolation-search-presets"
import {
  searchCore,
  type SearchCore,
  type SearchStoreDoc,
} from "@/store/create-search-store"

/** Документ редактора: масив чисел + ціль пошуку (серіалізовний). */
export type InterpolationSearchDoc = SearchStoreDoc

interface InterpolationSearchState extends SearchCore {
  sortValues: () => void
  loadDemo1: () => void
  loadDemo2: () => void
  loadClustered: () => void
  loadRandom: (seed: number) => void
}

export const useInterpolationSearchStore = create<InterpolationSearchState>()(
  (set, get) => ({
    ...searchCore({ initial: ipDemo1Preset(), keepSorted: true }, set, get),

    sortValues: () => set((s) => ({ values: [...s.values].sort((a, b) => a - b) })),

    loadDemo1: () => set(ipDemo1Preset()),
    loadDemo2: () => set(ipDemo2Preset()),
    loadClustered: () => set(ipClusteredPreset()),
    loadRandom: (seed) => set(ipRandomPreset(seed)),
  }),
)
