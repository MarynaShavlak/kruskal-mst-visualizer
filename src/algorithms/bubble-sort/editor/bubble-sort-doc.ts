// Серіалізація документа редактора бульбашкового сортування (масив чисел):
//  - JSON для імпорту/експорту;
//  - компактний base64url для шарингу через URL-хеш (?g=...).
// Окремий wire-формат (version 1; масив цілих) — не graph-doc, бо сортування без
// ребер. Значення санітизуються при завантаженні (цілі ≥0). Чисто, без React.

import { tr } from "@/i18n/use-t"
import type { BubbleSortDoc } from "@/store/bubble-sort-store"
import { createDocCodec } from "@/algorithms/shared/editor/doc-codec"

interface BubbleWire {
  readonly version: 1
  readonly values: readonly number[]
}

function parseWire(raw: unknown): BubbleWire {
  if (typeof raw !== "object" || raw === null) {
    throw new Error(tr("editor.errNotObject"))
  }
  const o = raw as Record<string, unknown>
  if (o.version !== 1) throw new Error(tr("editor.errBadVersion"))
  if (!Array.isArray(o.values) || !o.values.every((v) => typeof v === "number")) {
    throw new Error(tr("editor.bsErrBadValues"))
  }
  return o as unknown as BubbleWire
}

const docToWire = (doc: BubbleSortDoc): BubbleWire => ({
  version: 1,
  values: doc.values.map((v) => Math.round(v)),
})

const wireToDoc = (wire: BubbleWire): BubbleSortDoc => ({
  values: wire.values.map((v) => Math.max(0, Math.trunc(v))),
})

export const bubbleSortCodec = createDocCodec({ docToWire, parseWire, wireToDoc })
