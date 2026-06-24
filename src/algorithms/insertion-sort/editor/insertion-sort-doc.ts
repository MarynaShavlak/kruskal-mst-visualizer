// Серіалізація документа редактора сортування вставками (масив чисел):
//  - JSON для імпорту/експорту;
//  - компактний base64url для шарингу через URL-хеш (?g=...).
// Окремий wire-формат (version 1; масив цілих) — не graph-doc, бо сортування без
// ребер. Значення санітизуються при завантаженні (цілі ≥0). Чисто, без React.

import { tr } from "@/i18n/use-t"
import type { InsertionSortDoc } from "@/store/insertion-sort-store"
import { createDocCodec } from "@/algorithms/shared/editor/doc-codec"

interface InsertionWire {
  readonly version: 1
  readonly values: readonly number[]
}

function parseWire(raw: unknown): InsertionWire {
  if (typeof raw !== "object" || raw === null) {
    throw new Error(tr("editor.errNotObject"))
  }
  const o = raw as Record<string, unknown>
  if (o.version !== 1) throw new Error(tr("editor.errBadVersion"))
  if (!Array.isArray(o.values) || !o.values.every((v) => typeof v === "number")) {
    throw new Error(tr("editor.isErrBadValues"))
  }
  return o as unknown as InsertionWire
}

const docToWire = (doc: InsertionSortDoc): InsertionWire => ({
  version: 1,
  values: doc.values.map((v) => Math.round(v)),
})

const wireToDoc = (wire: InsertionWire): InsertionSortDoc => ({
  values: wire.values.map((v) => Math.max(0, Math.trunc(v))),
})

export const insertionSortCodec = createDocCodec({ docToWire, parseWire, wireToDoc })
