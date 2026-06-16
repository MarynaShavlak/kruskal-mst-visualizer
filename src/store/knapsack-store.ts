// Стан задачі про рюкзак (Zustand). Як і tsp-store, НЕ будується на graphCore (те
// ядро навколо ребер): тут редагований об'єкт — це список предметів (назва, вага,
// вартість) плюс місткість W, без жодних ребер чи координат. Редактор пише, плеєр
// і навчальні віджети читають. Числа санітизуються в діях (ваги — цілі ≥1,
// вартості — цілі ≥0, місткість — ціле ≥0), щоб інваріант ядра не порушувався.

import { create } from "zustand"
import type { KnapsackItem } from "@/lib/knapsack"
import {
  knapsackClassicPreset,
  knapsackRandomPreset,
  knapsackSmallPreset,
} from "@/store/knapsack-presets"

/** Документ редактора рюкзака: предмети + місткість (серіалізовний). */
export interface KnapsackDoc {
  readonly items: readonly KnapsackItem[]
  readonly capacity: number
}

interface KnapsackState {
  readonly items: readonly KnapsackItem[]
  readonly capacity: number

  /** Додає предмет із дефолтними вагою/вартістю та канонічним ім'ям. */
  addItem: () => void
  /** Оновлює поле предмета за індексом; числові поля санітизуються. */
  updateItem: (index: number, patch: Partial<KnapsackItem>) => void
  removeItem: (index: number) => void
  /** Встановлює місткість рюкзака (ціле ≥ 0). */
  setCapacity: (capacity: number) => void
  clear: () => void
  loadDoc: (doc: KnapsackDoc) => void
  toDoc: () => KnapsackDoc

  loadClassic: () => void
  loadSmall: () => void
  loadRandom: (seed: number) => void
}

/** Ціле ≥ min (відкидає дробову частину; нечисло → min). */
const clampInt = (value: number, min: number): number =>
  Number.isFinite(value) ? Math.max(min, Math.trunc(value)) : min

/** Санітизує предмет: вага ціле ≥1, вартість ціле ≥0, ім'я — рядок. */
function sanitizeItem(item: KnapsackItem): KnapsackItem {
  return {
    name: item.name,
    weight: clampInt(item.weight, 1),
    value: clampInt(item.value, 0),
  }
}

export const useKnapsackStore = create<KnapsackState>()((set, get) => ({
  ...knapsackClassicPreset(),

  addItem: () =>
    set((s) => ({
      items: [
        ...s.items,
        { name: `П${s.items.length + 1}`, weight: 5, value: 10 },
      ],
    })),

  updateItem: (index, patch) =>
    set((s) => {
      if (index < 0 || index >= s.items.length) return {}
      return {
        items: s.items.map((it, i) =>
          i === index ? sanitizeItem({ ...it, ...patch }) : it,
        ),
      }
    }),

  removeItem: (index) =>
    set((s) => {
      if (index < 0 || index >= s.items.length) return {}
      return { items: s.items.filter((_, i) => i !== index) }
    }),

  setCapacity: (capacity) => set({ capacity: clampInt(capacity, 0) }),

  clear: () => set({ items: [], capacity: 0 }),

  loadDoc: (doc) =>
    set({
      items: doc.items.map(sanitizeItem),
      capacity: clampInt(doc.capacity, 0),
    }),

  toDoc: () => ({ items: get().items, capacity: get().capacity }),

  loadClassic: () => set(knapsackClassicPreset()),
  loadSmall: () => set(knapsackSmallPreset()),
  loadRandom: (seed) => set(knapsackRandomPreset(seed)),
}))
