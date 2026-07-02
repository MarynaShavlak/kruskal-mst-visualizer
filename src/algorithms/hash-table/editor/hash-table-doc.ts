// Серіалізація документа редактора хеш-таблиці (скрипт операцій + місткість +
// хеш-функція):
//  - JSON для імпорту/експорту;
//  - компактний base64url для шарингу через URL-хеш (?g=...).
// Окремий wire-формат (version 1; операція як [kind, key, value]) — не graph/values-doc,
// бо тут скрипт операцій, а не масив чисел. Значення санітизуються при завантаженні.
// Чисто, без React.

import { tr } from "@/i18n/use-t"
import type { CollisionStrategy, HashFnId, HtOp } from "@/lib/hashTable"
import type { HashTableDoc } from "@/store/hash-table-store"
import { createDocCodec } from "@/algorithms/shared/editor/doc-codec"

/** Операція у дротовому форматі: [kind, key, value] (value ігнорується для get/delete). */
type WireOp = readonly [string, string, number]

interface HashTableWire {
  readonly version: 1
  readonly ops: readonly WireOp[]
  readonly capacity: number
  readonly hashFn: HashFnId
  /** Опційне для зворотної сумісності зі старими посиланнями (за замовч. chaining). */
  readonly strategy?: CollisionStrategy
}

const OP_KINDS = ["insert", "get", "delete"] as const

function isWireOp(op: unknown): op is [string, string, number] {
  return (
    Array.isArray(op) &&
    op.length === 3 &&
    typeof op[0] === "string" &&
    (OP_KINDS as readonly string[]).includes(op[0]) &&
    typeof op[1] === "string" &&
    typeof op[2] === "number"
  )
}

function parseWire(raw: unknown): HashTableWire {
  if (typeof raw !== "object" || raw === null) {
    throw new Error(tr("editor.errNotObject"))
  }
  const o = raw as Record<string, unknown>
  if (o.version !== 1) throw new Error(tr("editor.errBadVersion"))
  if (!Array.isArray(o.ops) || !o.ops.every(isWireOp)) {
    throw new Error(tr("editor.errBadOps"))
  }
  if (typeof o.capacity !== "number" || !Number.isInteger(o.capacity)) {
    throw new Error(tr("editor.errBadCapacity"))
  }
  if (o.hashFn !== "sum" && o.hashFn !== "poly") {
    throw new Error(tr("editor.errBadHashFn"))
  }
  if (o.strategy !== undefined && o.strategy !== "chaining" && o.strategy !== "linear") {
    throw new Error(tr("editor.errBadStrategy"))
  }
  return o as unknown as HashTableWire
}

const docToWire = (doc: HashTableDoc): HashTableWire => ({
  version: 1,
  ops: doc.ops.map(
    (op) => [op.kind, op.key, Math.round(op.value ?? 0)] as const,
  ),
  capacity: Math.round(doc.capacity),
  hashFn: doc.hashFn,
  strategy: doc.strategy,
})

const wireToDoc = (wire: HashTableWire): HashTableDoc => {
  const ops: HtOp[] = wire.ops.map(([kind, key, value]) =>
    kind === "insert"
      ? { kind: "insert", key, value: Math.trunc(value) }
      : { kind: kind as "get" | "delete", key },
  )
  return {
    ops,
    capacity: Math.max(1, Math.trunc(wire.capacity)),
    hashFn: wire.hashFn === "poly" ? "poly" : "sum",
    strategy: wire.strategy === "linear" ? "linear" : "chaining",
  }
}

export const hashTableCodec = createDocCodec({ docToWire, parseWire, wireToDoc })
