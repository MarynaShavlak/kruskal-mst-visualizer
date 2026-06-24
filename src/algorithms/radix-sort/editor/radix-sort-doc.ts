// Серіалізація документа редактора порозрядного сортування (масив чисел): JSON для
// імпорту/експорту + компактний base64url для шарингу через URL-хеш (?g=...).
// Окремий wire-формат (version 1; масив НЕВІД'ЄМНИХ цілих). Значення санітизуються
// (≥0). Без React.

import { tr } from "@/i18n/use-t"
import type { RadixSortDoc } from "@/store/radix-sort-store"
import { createDocCodec } from "@/algorithms/shared/editor/doc-codec"

interface RadixWire {
  readonly version: 1
  readonly values: readonly number[]
}

function parseWire(raw: unknown): RadixWire {
  if (typeof raw !== "object" || raw === null) {
    throw new Error(tr("editor.errNotObject"))
  }
  const o = raw as Record<string, unknown>
  if (o.version !== 1) throw new Error(tr("editor.errBadVersion"))
  if (!Array.isArray(o.values) || !o.values.every((v) => typeof v === "number")) {
    throw new Error(tr("editor.rxErrBadValues"))
  }
  return o as unknown as RadixWire
}

const docToWire = (doc: RadixSortDoc): RadixWire => ({
  version: 1,
  values: doc.values.map((v) => Math.round(v)),
})

const wireToDoc = (wire: RadixWire): RadixSortDoc => ({
  values: wire.values.map((v) => Math.max(0, Math.trunc(v))),
})

export const radixSortCodec = createDocCodec({ docToWire, parseWire, wireToDoc })
