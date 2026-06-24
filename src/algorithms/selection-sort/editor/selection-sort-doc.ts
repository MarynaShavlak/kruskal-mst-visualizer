// Серіалізація документа редактора сортування прямим вибором (масив чисел):
//  - JSON для імпорту/експорту;
//  - компактний base64url для шарингу через URL-хеш (?g=...).
// Окремий wire-формат (version 1; масив цілих) — не graph-doc, бо сортування без
// ребер. Значення санітизуються при завантаженні (цілі ≥0). Чисто, без React.

import { tr } from "@/i18n/use-t"
import type { SelectionSortDoc } from "@/store/selection-sort-store"
import { createDocCodec } from "@/algorithms/shared/editor/doc-codec"

interface SelectionWire {
  readonly version: 1
  readonly values: readonly number[]
}

function parseWire(raw: unknown): SelectionWire {
  if (typeof raw !== "object" || raw === null) {
    throw new Error(tr("editor.errNotObject"))
  }
  const o = raw as Record<string, unknown>
  if (o.version !== 1) throw new Error(tr("editor.errBadVersion"))
  if (!Array.isArray(o.values) || !o.values.every((v) => typeof v === "number")) {
    throw new Error(tr("editor.ssErrBadValues"))
  }
  return o as unknown as SelectionWire
}

const docToWire = (doc: SelectionSortDoc): SelectionWire => ({
  version: 1,
  values: doc.values.map((v) => Math.round(v)),
})

const wireToDoc = (wire: SelectionWire): SelectionSortDoc => ({
  values: wire.values.map((v) => Math.max(0, Math.trunc(v))),
})

export const selectionSortCodec = createDocCodec({ docToWire, parseWire, wireToDoc })
