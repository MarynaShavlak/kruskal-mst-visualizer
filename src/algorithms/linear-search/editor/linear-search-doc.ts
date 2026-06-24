// Серіалізація документа редактора лінійного пошуку (масив чисел + ціль): JSON для
// імпорту/експорту + компактний base64url для шарингу через URL-хеш (?g=...).
// Окремий wire-формат (version 1; масив цілих + ціль). Значення санітизуються до
// цілих. Без React.

import { tr } from "@/i18n/use-t"
import type { LinearSearchDoc } from "@/store/linear-search-store"
import { createDocCodec } from "@/algorithms/shared/editor/doc-codec"

interface LinearWire {
  readonly version: 1
  readonly values: readonly number[]
  readonly target: number
}

function parseWire(raw: unknown): LinearWire {
  if (typeof raw !== "object" || raw === null) {
    throw new Error(tr("editor.errNotObject"))
  }
  const o = raw as Record<string, unknown>
  if (o.version !== 1) throw new Error(tr("editor.errBadVersion"))
  if (!Array.isArray(o.values) || !o.values.every((v) => typeof v === "number")) {
    throw new Error(tr("editor.lsErrBadValues"))
  }
  if (typeof o.target !== "number") throw new Error(tr("editor.lsErrBadTarget"))
  return o as unknown as LinearWire
}

const docToWire = (doc: LinearSearchDoc): LinearWire => ({
  version: 1,
  values: doc.values.map((v) => Math.round(v)),
  target: Math.round(doc.target),
})

const wireToDoc = (wire: LinearWire): LinearSearchDoc => ({
  values: wire.values.map((v) => Math.trunc(v)),
  target: Math.trunc(wire.target),
})

export const linearSearchCodec = createDocCodec({ docToWire, parseWire, wireToDoc })
