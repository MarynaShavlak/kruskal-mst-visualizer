// Серіалізація документа редактора рюкзака (предмети + місткість):
//  - JSON для імпорту/експорту;
//  - компактний base64url для шарингу через URL-хеш (?g=...).
// Окремий wire-формат (version 1; предмет як [name, weight, value]) — не graph-doc,
// бо рюкзак без ребер. Числа санітизуються при завантаженні. Чисто, без React.

import { tr } from "@/i18n/use-t"
import type { KnapsackItem } from "@/lib/knapsack"
import type { KnapsackDoc } from "@/store/knapsack-store"
import { createDocCodec } from "@/algorithms/shared/editor/doc-codec"

interface KnapsackWire {
  readonly version: 1
  readonly items: readonly (readonly [string, number, number])[]
  readonly capacity: number
}

function isWireItem(it: unknown): it is [string, number, number] {
  return (
    Array.isArray(it) &&
    it.length === 3 &&
    typeof it[0] === "string" &&
    typeof it[1] === "number" &&
    typeof it[2] === "number"
  )
}

function parseWire(raw: unknown): KnapsackWire {
  if (typeof raw !== "object" || raw === null) {
    throw new Error(tr("editor.errNotObject"))
  }
  const o = raw as Record<string, unknown>
  if (o.version !== 1) throw new Error(tr("editor.errBadVersion"))
  if (!Array.isArray(o.items) || !o.items.every(isWireItem)) {
    throw new Error(tr("editor.errBadItems"))
  }
  if (typeof o.capacity !== "number" || !Number.isInteger(o.capacity)) {
    throw new Error(tr("editor.errBadCapacity"))
  }
  return o as unknown as KnapsackWire
}

const docToWire = (doc: KnapsackDoc): KnapsackWire => ({
  version: 1,
  items: doc.items.map(
    (it) => [it.name, Math.round(it.weight), Math.round(it.value)] as const,
  ),
  capacity: Math.round(doc.capacity),
})

const wireToDoc = (wire: KnapsackWire): KnapsackDoc => {
  const items: KnapsackItem[] = wire.items.map(([name, weight, value]) => ({
    name,
    weight: Math.max(1, Math.trunc(weight)),
    value: Math.max(0, Math.trunc(value)),
  }))
  return { items, capacity: Math.max(0, Math.trunc(wire.capacity)) }
}

export const knapsackCodec = createDocCodec({ docToWire, parseWire, wireToDoc })
