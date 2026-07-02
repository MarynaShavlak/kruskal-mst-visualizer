// Серіалізація документа редактора ДДП (скрипт операцій):
//  - JSON для імпорту/експорту;
//  - компактний base64url для шарингу через URL-хеш (?g=...).
// Окремий wire-формат (version 1; операція як [kind, key]) — не graph/values-doc, бо
// тут скрипт операцій над деревом. Значення санітизуються при завантаженні. Без React.

import { tr } from "@/i18n/use-t"
import type { BstOp } from "@/lib/binarySearchTree"
import type { BstDoc } from "@/store/bst-store"
import { createDocCodec } from "@/algorithms/shared/editor/doc-codec"

/** Операція у дротовому форматі: [kind, key]. */
type WireOp = readonly [string, number]

interface BstWire {
  readonly version: 1
  readonly ops: readonly WireOp[]
}

const OP_KINDS = ["insert", "search", "delete"] as const

function isWireOp(op: unknown): op is [string, number] {
  return (
    Array.isArray(op) &&
    op.length === 2 &&
    typeof op[0] === "string" &&
    (OP_KINDS as readonly string[]).includes(op[0]) &&
    typeof op[1] === "number"
  )
}

function parseWire(raw: unknown): BstWire {
  if (typeof raw !== "object" || raw === null) {
    throw new Error(tr("editor.errNotObject"))
  }
  const o = raw as Record<string, unknown>
  if (o.version !== 1) throw new Error(tr("editor.errBadVersion"))
  if (!Array.isArray(o.ops) || !o.ops.every(isWireOp)) {
    throw new Error(tr("editor.errBadOps"))
  }
  return o as unknown as BstWire
}

const docToWire = (doc: BstDoc): BstWire => ({
  version: 1,
  ops: doc.ops.map((op) => [op.kind, Math.round(op.key)] as const),
})

const wireToDoc = (wire: BstWire): BstDoc => ({
  ops: wire.ops.map(([kind, key]): BstOp => ({
    kind: (OP_KINDS as readonly string[]).includes(kind) ? (kind as BstOp["kind"]) : "insert",
    key: Math.trunc(key),
  })),
})

export const bstCodec = createDocCodec({ docToWire, parseWire, wireToDoc })
