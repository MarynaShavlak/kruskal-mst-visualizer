// Стан наївного пошуку в рядках (Zustand). Редагований об'єкт — пара рядків {text,
// pattern}, без графа й передумов; спільні дії — у stringCore (create-string-store),
// тут лише пресети.

import { create } from "zustand"
import {
  nssMainPreset,
  nssWorstPreset,
  nssNotFoundPreset,
  nssOverlapPreset,
  nssRandomPreset,
} from "@/store/naive-string-search-presets"
import {
  stringCore,
  type StringCore,
  type StringStoreDoc,
} from "@/store/create-string-store"

/** Документ редактора: текст + шаблон (серіалізовний). */
export type NaiveStringSearchDoc = StringStoreDoc

interface NaiveStringSearchState extends StringCore {
  loadMain: () => void
  loadWorst: () => void
  loadNotFound: () => void
  loadOverlap: () => void
  loadRandom: (seed: number) => void
}

export const useNaiveStringSearchStore = create<NaiveStringSearchState>()(
  (set, get) => ({
    ...stringCore(nssMainPreset(), set, get),

    loadMain: () => set(nssMainPreset()),
    loadWorst: () => set(nssWorstPreset()),
    loadNotFound: () => set(nssNotFoundPreset()),
    loadOverlap: () => set(nssOverlapPreset()),
    loadRandom: (seed) => set(nssRandomPreset(seed)),
  }),
)
