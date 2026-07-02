// Стан двійкового дерева пошуку (Zustand). Як hash-table-store, редагований об'єкт —
// це СКРИПТ ОПЕРАЦІЙ (insert/search/delete) над деревом, що починається порожнім.
// Редактор пише, плеєр і навчальні віджети читають. Значення санітизуються в діях
// (kind із трьох дозволених, key — ціле), щоб інваріанти ядра не порушувалися.

import { create } from "zustand"
import type { BstOp, BstOpKind } from "@/lib/binarySearchTree"
import {
  bstIntroPreset,
  bstDegeneratePreset,
  bstBalancedPreset,
  bstDeleteCasesPreset,
  bstRandomPreset,
} from "@/store/bst-presets"

/** Документ редактора ДДП: скрипт операцій. */
export interface BstDoc {
  readonly ops: readonly BstOp[]
}

interface BstState {
  readonly ops: readonly BstOp[]

  /** Додає операцію (за замовч. insert з новим ключем). */
  addOp: (kind?: BstOpKind) => void
  /** Оновлює поле операції за індексом; поля санітизуються. */
  updateOp: (index: number, patch: Partial<BstOp>) => void
  removeOp: (index: number) => void
  clear: () => void
  loadDoc: (doc: BstDoc) => void
  toDoc: () => BstDoc

  loadIntro: () => void
  loadDegenerate: () => void
  loadBalanced: () => void
  loadDeleteCases: () => void
  loadRandom: (seed: number) => void
}

const OP_KINDS: readonly BstOpKind[] = ["insert", "search", "delete"]

/** Дозволений вид операції (інакше insert). */
const sanitizeKind = (kind: unknown): BstOpKind =>
  OP_KINDS.includes(kind as BstOpKind) ? (kind as BstOpKind) : "insert"

/** Ціле (відкидає дробову частину; нечисло → 0). */
const clampInt = (value: number): number =>
  Number.isFinite(value) ? Math.trunc(value) : 0

/** Санітизує операцію: kind із дозволених, key — ціле. */
const sanitizeOp = (op: BstOp): BstOp => ({
  kind: sanitizeKind(op.kind),
  key: clampInt(op.key),
})

export const useBstStore = create<BstState>()((set, get) => ({
  ...bstIntroPreset(),

  addOp: (kind = "insert") =>
    set((s) => ({
      ops: [...s.ops, { kind, key: (s.ops.length % 20) + 1 }],
    })),

  updateOp: (index, patch) =>
    set((s) => {
      if (index < 0 || index >= s.ops.length) return {}
      return {
        ops: s.ops.map((op, i) => (i === index ? sanitizeOp({ ...op, ...patch }) : op)),
      }
    }),

  removeOp: (index) =>
    set((s) => {
      if (index < 0 || index >= s.ops.length) return {}
      return { ops: s.ops.filter((_, i) => i !== index) }
    }),

  clear: () => set({ ops: [] }),

  loadDoc: (doc) => set({ ops: doc.ops.map(sanitizeOp) }),

  toDoc: () => ({ ops: get().ops }),

  loadIntro: () => set(bstIntroPreset()),
  loadDegenerate: () => set(bstDegeneratePreset()),
  loadBalanced: () => set(bstBalancedPreset()),
  loadDeleteCases: () => set(bstDeleteCasesPreset()),
  loadRandom: (seed) => set(bstRandomPreset(seed)),
}))
