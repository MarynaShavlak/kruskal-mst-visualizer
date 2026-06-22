// Стан пошуку Боєра–Мура (Zustand). Редагований об'єкт — пара рядків {text, pattern},
// без графа й передумов; спільні дії — у stringCore (create-string-store), тут лише
// пресети.

import { create } from "zustand"
import {
  bmMainPreset,
  bmBigJumpsPreset,
  bmWorstPreset,
  bmMultiPreset,
  bmRandomPreset,
} from "@/store/boyer-moore-string-search-presets"
import {
  stringCore,
  type StringCore,
  type StringStoreDoc,
} from "@/store/create-string-store"

/** Документ редактора: текст + шаблон (серіалізовний). */
export type BoyerMooreStringSearchDoc = StringStoreDoc

interface BoyerMooreStringSearchState extends StringCore {
  loadMain: () => void
  loadBigJumps: () => void
  loadWorst: () => void
  loadMulti: () => void
  loadRandom: (seed: number) => void
}

export const useBoyerMooreStringSearchStore =
  create<BoyerMooreStringSearchState>()((set, get) => ({
    ...stringCore(bmMainPreset(), set, get),

    loadMain: () => set(bmMainPreset()),
    loadBigJumps: () => set(bmBigJumpsPreset()),
    loadWorst: () => set(bmWorstPreset()),
    loadMulti: () => set(bmMultiPreset()),
    loadRandom: (seed) => set(bmRandomPreset(seed)),
  }))
