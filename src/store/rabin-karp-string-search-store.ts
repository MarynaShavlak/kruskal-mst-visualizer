// Стан пошуку Рабіна–Карпа (Zustand). Редагований об'єкт — пара рядків {text, pattern},
// без графа й передумов; спільні дії — у stringCore (create-string-store), тут лише
// пресети.

import { create } from "zustand"
import {
  rkMainPreset,
  rkCollisionPreset,
  rkMultiPreset,
  rkNotFoundPreset,
  rkRandomPreset,
} from "@/store/rabin-karp-string-search-presets"
import {
  stringCore,
  type StringCore,
  type StringStoreDoc,
} from "@/store/create-string-store"

/** Документ редактора: текст + шаблон (серіалізовний). */
export type RabinKarpStringSearchDoc = StringStoreDoc

interface RabinKarpStringSearchState extends StringCore {
  loadMain: () => void
  loadCollision: () => void
  loadMulti: () => void
  loadNotFound: () => void
  loadRandom: (seed: number) => void
}

export const useRabinKarpStringSearchStore =
  create<RabinKarpStringSearchState>()((set, get) => ({
    ...stringCore(rkMainPreset(), set, get),

    loadMain: () => set(rkMainPreset()),
    loadCollision: () => set(rkCollisionPreset()),
    loadMulti: () => set(rkMultiPreset()),
    loadNotFound: () => set(rkNotFoundPreset()),
    loadRandom: (seed) => set(rkRandomPreset(seed)),
  }))
