// Стан хеш-таблиці (Zustand). Як knapsack/tsp-store, НЕ будується на graphCore: тут
// редагований об'єкт — це СКРИПТ ОПЕРАЦІЙ (insert/get/delete) над таблицею фіксованої
// місткості плюс вибір хеш-функції. Редактор пише, плеєр і навчальні віджети читають.
// Значення санітизуються в діях (kind із трьох дозволених, місткість ціле ≥1, value
// ціле), щоб інваріанти ядра не порушувалися.

import { create } from "zustand"
import type { CollisionStrategy, HashFnId, HtOp } from "@/lib/hashTable"
import {
  hashClassicPreset,
  hashAnagramsPreset,
  hashRandomPreset,
} from "@/store/hash-table-presets"

/** Документ редактора хеш-таблиці: скрипт операцій + місткість + хеш-функція + стратегія. */
export interface HashTableDoc {
  readonly ops: readonly HtOp[]
  readonly capacity: number
  readonly hashFn: HashFnId
  readonly strategy: CollisionStrategy
}

interface HashTableState {
  readonly ops: readonly HtOp[]
  readonly capacity: number
  readonly hashFn: HashFnId
  readonly strategy: CollisionStrategy

  /** Додає операцію (за замовч. insert канонічного ключа). */
  addOp: (kind?: HtOp["kind"]) => void
  /** Оновлює поле операції за індексом; поля санітизуються. */
  updateOp: (index: number, patch: Partial<HtOp>) => void
  removeOp: (index: number) => void
  /** Встановлює місткість таблиці (ціле ≥ 1). */
  setCapacity: (capacity: number) => void
  /** Перемикає хеш-функцію (навчальна сума / поліноміальна). */
  setHashFn: (hashFn: HashFnId) => void
  /** Перемикає стратегію колізій (ланцюжки / лінійне зондування). */
  setStrategy: (strategy: CollisionStrategy) => void
  clear: () => void
  loadDoc: (doc: HashTableDoc) => void
  toDoc: () => HashTableDoc

  loadClassic: () => void
  loadAnagrams: () => void
  loadRandom: (seed: number) => void
}

const OP_KINDS: readonly HtOp["kind"][] = ["insert", "get", "delete"]

/** Ціле ≥ min (відкидає дробову частину; нечисло → min). */
const clampInt = (value: number, min: number): number =>
  Number.isFinite(value) ? Math.max(min, Math.trunc(value)) : min

/** Дозволений вид операції (інакше insert). */
const sanitizeKind = (kind: unknown): HtOp["kind"] =>
  OP_KINDS.includes(kind as HtOp["kind"]) ? (kind as HtOp["kind"]) : "insert"

/** Санітизує операцію: kind із дозволених, key — рядок, value — ціле (для insert). */
function sanitizeOp(op: HtOp): HtOp {
  const kind = sanitizeKind(op.kind)
  const key = String(op.key)
  if (kind === "insert") {
    return { kind, key, value: clampInt(op.value ?? 0, Number.MIN_SAFE_INTEGER) }
  }
  return { kind, key }
}

const DEFAULT_HASH_FN: HashFnId = "sum"

export const useHashTableStore = create<HashTableState>()((set, get) => ({
  ...hashClassicPreset(),

  addOp: (kind = "insert") =>
    set((s) => ({
      ops: [
        ...s.ops,
        kind === "insert"
          ? { kind, key: `key${s.ops.length + 1}`, value: 0 }
          : { kind, key: `key${s.ops.length + 1}` },
      ],
    })),

  updateOp: (index, patch) =>
    set((s) => {
      if (index < 0 || index >= s.ops.length) return {}
      return {
        ops: s.ops.map((op, i) =>
          i === index ? sanitizeOp({ ...op, ...patch }) : op,
        ),
      }
    }),

  removeOp: (index) =>
    set((s) => {
      if (index < 0 || index >= s.ops.length) return {}
      return { ops: s.ops.filter((_, i) => i !== index) }
    }),

  setCapacity: (capacity) => set({ capacity: clampInt(capacity, 1) }),

  setHashFn: (hashFn) => set({ hashFn }),

  setStrategy: (strategy) => set({ strategy }),

  clear: () =>
    set({ ops: [], capacity: 5, hashFn: DEFAULT_HASH_FN, strategy: "chaining" }),

  loadDoc: (doc) =>
    set({
      ops: doc.ops.map(sanitizeOp),
      capacity: clampInt(doc.capacity, 1),
      hashFn: doc.hashFn === "poly" ? "poly" : "sum",
      strategy: doc.strategy === "linear" ? "linear" : "chaining",
    }),

  toDoc: () => ({
    ops: get().ops,
    capacity: get().capacity,
    hashFn: get().hashFn,
    strategy: get().strategy,
  }),

  loadClassic: () => set(hashClassicPreset()),
  loadAnagrams: () => set(hashAnagramsPreset()),
  loadRandom: (seed) => set(hashRandomPreset(seed)),
}))
