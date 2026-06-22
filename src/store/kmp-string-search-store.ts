// Стан пошуку Кнута–Морріса–Пратта (Zustand). Редагований об'єкт — пара рядків {text,
// pattern}, без графа й передумов; спільні дії — у stringCore (create-string-store),
// тут лише пресети.

import { create } from "zustand"
import {
  kmpMainPreset,
  kmpKonspectPreset,
  kmpWorstPreset,
  kmpNotFoundPreset,
  kmpRandomPreset,
} from "@/store/kmp-string-search-presets"
import {
  stringCore,
  type StringCore,
  type StringStoreDoc,
} from "@/store/create-string-store"

/** Документ редактора: текст + шаблон (серіалізовний). */
export type KmpStringSearchDoc = StringStoreDoc

interface KmpStringSearchState extends StringCore {
  loadMain: () => void
  loadKonspect: () => void
  loadWorst: () => void
  loadNotFound: () => void
  loadRandom: (seed: number) => void
}

export const useKmpStringSearchStore = create<KmpStringSearchState>()(
  (set, get) => ({
    ...stringCore(kmpMainPreset(), set, get),

    loadMain: () => set(kmpMainPreset()),
    loadKonspect: () => set(kmpKonspectPreset()),
    loadWorst: () => set(kmpWorstPreset()),
    loadNotFound: () => set(kmpNotFoundPreset()),
    loadRandom: (seed) => set(kmpRandomPreset(seed)),
  }),
)
