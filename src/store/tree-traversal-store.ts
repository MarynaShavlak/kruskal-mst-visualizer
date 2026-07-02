// Стан обходу дерева (Zustand). Як knapsack/hash-table-store, НЕ будується на
// graphCore: редагований об'єкт — це РІВНЕВА серіалізація двійкового дерева (значення
// зверху-вниз, зліва-направо; null — порожня дитина) плюс вибраний порядок обходу.
// Редактор пише, плеєр і навчальні віджети читають. Значення санітизуються в діях
// (цілі або null; довжина обмежена), щоб buildTree завжди отримував валідний вхід.

import { create } from "zustand"
import type { TraversalOrder } from "@/lib/treeTraversal"
import {
  treeIntroPreset,
  treeBstPreset,
  treeChainPreset,
  treeFullPreset,
  treeRandomPreset,
} from "@/store/tree-traversal-presets"

/** Документ редактора обходу дерева: рівневий список + порядок обходу. */
export interface TreeTraversalDoc {
  readonly levels: readonly (number | null)[]
  readonly order: TraversalOrder
}

interface TreeTraversalState {
  readonly levels: readonly (number | null)[]
  readonly order: TraversalOrder

  /** Замінює весь рівневий список (уже розпарсений з поля вводу). */
  setLevels: (levels: readonly (number | null)[]) => void
  /** Перемикає порядок обходу (прямий / центровий / зворотний). */
  setOrder: (order: TraversalOrder) => void
  clear: () => void
  loadDoc: (doc: TreeTraversalDoc) => void
  toDoc: () => TreeTraversalDoc

  loadIntro: () => void
  loadBst: () => void
  loadChain: () => void
  loadFull: () => void
  loadRandom: (seed: number) => void
}

/** Максимум елементів рівневого списку (запобіжник від велетенських дерев). */
export const MAX_TREE_LEVELS = 63

const ORDERS: readonly TraversalOrder[] = ["preorder", "inorder", "postorder"]

/** Дозволений порядок обходу (інакше — прямий). */
const sanitizeOrder = (order: unknown): TraversalOrder =>
  ORDERS.includes(order as TraversalOrder) ? (order as TraversalOrder) : "preorder"

/**
 * Санітизує рівневий список: обрізає до MAX_TREE_LEVELS, кожен елемент — ціле або
 * null (нечисло/нескінченність → null), прибирає хвостові null (buildTree їх однаково
 * ігнорує).
 */
function sanitizeLevels(levels: readonly (number | null)[]): (number | null)[] {
  const out = levels
    .slice(0, MAX_TREE_LEVELS)
    .map((v) => (v == null || !Number.isFinite(v) ? null : Math.trunc(v)))
  while (out.length > 0 && out[out.length - 1] === null) out.pop()
  return out
}

export const useTreeTraversalStore = create<TreeTraversalState>()((set, get) => ({
  ...treeIntroPreset(),

  setLevels: (levels) => set({ levels: sanitizeLevels(levels) }),

  setOrder: (order) => set({ order: sanitizeOrder(order) }),

  clear: () => set({ levels: [], order: "preorder" }),

  loadDoc: (doc) =>
    set({ levels: sanitizeLevels(doc.levels), order: sanitizeOrder(doc.order) }),

  toDoc: () => ({ levels: get().levels, order: get().order }),

  loadIntro: () => set(treeIntroPreset()),
  loadBst: () => set(treeBstPreset()),
  loadChain: () => set(treeChainPreset()),
  loadFull: () => set(treeFullPreset()),
  loadRandom: (seed) => set(treeRandomPreset(seed)),
}))
