// Стан задачі комівояжера (Zustand) для Хелда–Карпа. На відміну від graph-store /
// directed-graph-store, тут НЕМАЄ ребер: повний граф неявний, а матриця відстаней
// ПОХІДНА від координат міст. Тож редагований об'єкт — це самі міста (точки) плюс
// індекс старту, без окремої мапи позицій (позиція міста і є дані). Саме тому стор
// не будується на graphCore (те ядро навколо ребер). Редактор пише, плеєр читає.

import { create } from "zustand"
import { nextVertexName } from "@/lib/graph"
import type { TspCity } from "@/lib/tsp"
import { tspExamplePreset, tspRandomPreset } from "@/store/tsp-presets"

/** Документ редактора TSP: міста + індекс стартового міста (серіалізовний). */
export interface TspDoc {
  readonly cities: readonly TspCity[]
  readonly start: number
}

interface TspState {
  readonly cities: readonly TspCity[]
  readonly start: number

  /** Додає місто в точку (x, y) з першим вільним канонічним ім'ям; повертає ім'я. */
  addCityAt: (x: number, y: number) => string
  /** Пересуває місто за індексом — змінює його координати, отже й відстані. */
  moveCity: (index: number, x: number, y: number) => void
  /** Видаляє місто за індексом; коригує start під зсув індексів. */
  removeCity: (index: number) => void
  /** Призначає стартове місто; індекс поза межами — ігнорує. */
  setStart: (index: number) => void
  clear: () => void
  loadDoc: (doc: TspDoc) => void
  toDoc: () => TspDoc

  loadExample: () => void
  loadRandom: (seed: number) => void
}

/** Затискає індекс старту в [0, count-1]; для порожнього списку — 0. */
const clampStart = (start: number, count: number): number =>
  count === 0 ? 0 : Math.min(Math.max(0, start), count - 1)

export const useTspStore = create<TspState>()((set, get) => ({
  ...tspExamplePreset(),

  addCityAt: (x, y) => {
    const name = nextVertexName(get().cities.map((c) => c.name))
    set((s) => ({ cities: [...s.cities, { name, x, y }] }))
    return name
  },

  moveCity: (index, x, y) =>
    set((s) => ({
      cities: s.cities.map((c, i) => (i === index ? { ...c, x, y } : c)),
    })),

  removeCity: (index) =>
    set((s) => {
      if (index < 0 || index >= s.cities.length) return {}
      const cities = s.cities.filter((_, i) => i !== index)
      // Старт «їде» за своїм містом; якщо видалили сам старт — відкат на перше.
      let start = s.start
      if (index === s.start) start = 0
      else if (index < s.start) start = s.start - 1
      return { cities, start: clampStart(start, cities.length) }
    }),

  setStart: (index) =>
    set((s) => (index >= 0 && index < s.cities.length ? { start: index } : {})),

  clear: () => set({ cities: [], start: 0 }),

  loadDoc: (doc) =>
    set({
      cities: doc.cities.map((c) => ({ ...c })),
      start: clampStart(doc.start, doc.cities.length),
    }),

  toDoc: () => ({ cities: get().cities, start: get().start }),

  loadExample: () => set(tspExamplePreset()),

  loadRandom: (seed) => set(tspRandomPreset(seed)),
}))
