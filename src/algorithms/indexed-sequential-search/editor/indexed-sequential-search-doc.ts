// Серіалізація документа редактора індексно-послідовного пошуку (масив + ціль +
// крок індексу): JSON для імпорту/експорту + компактний base64url для шарингу через
// URL-хеш (?g=...). Окремий wire-формат (version 1; масив цілих + ціль + крок).
// Значення санітизуються до цілих, крок — до ≥1. Без React.

import { tr } from "@/i18n/use-t"
import type { IndexedSequentialSearchDoc } from "@/store/indexed-sequential-search-store"
import { createDocCodec } from "@/algorithms/shared/editor/doc-codec"

interface IxsWire {
  readonly version: 1
  readonly values: readonly number[]
  readonly target: number
  readonly step: number
}

function parseWire(raw: unknown): IxsWire {
  if (typeof raw !== "object" || raw === null) {
    throw new Error(tr("editor.errNotObject"))
  }
  const o = raw as Record<string, unknown>
  if (o.version !== 1) throw new Error(tr("editor.errBadVersion"))
  if (!Array.isArray(o.values) || !o.values.every((v) => typeof v === "number")) {
    throw new Error(tr("editor.issErrBadValues"))
  }
  if (typeof o.target !== "number") throw new Error(tr("editor.issErrBadTarget"))
  if (typeof o.step !== "number") throw new Error(tr("editor.issErrBadStep"))
  return o as unknown as IxsWire
}

const docToWire = (doc: IndexedSequentialSearchDoc): IxsWire => ({
  version: 1,
  values: doc.values.map((v) => Math.round(v)),
  target: Math.round(doc.target),
  step: Math.max(1, Math.round(doc.step)),
})

const wireToDoc = (wire: IxsWire): IndexedSequentialSearchDoc => ({
  values: wire.values.map((v) => Math.trunc(v)),
  target: Math.trunc(wire.target),
  step: Math.max(1, Math.trunc(wire.step)),
})

export const indexedSequentialSearchCodec = createDocCodec({ docToWire, parseWire, wireToDoc })
