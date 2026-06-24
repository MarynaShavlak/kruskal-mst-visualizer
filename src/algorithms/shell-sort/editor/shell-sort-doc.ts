// Серіалізація документа редактора сортування Шелла (масив чисел): JSON для
// імпорту/експорту + компактний base64url для шарингу через URL-хеш (?g=...).
// Окремий wire-формат (version 1; масив цілих). Значення санітизуються (≥0). Без React.

import { tr } from "@/i18n/use-t"
import type { ShellSortDoc } from "@/store/shell-sort-store"
import { createDocCodec } from "@/algorithms/shared/editor/doc-codec"

interface ShellWire {
  readonly version: 1
  readonly values: readonly number[]
}

function parseWire(raw: unknown): ShellWire {
  if (typeof raw !== "object" || raw === null) {
    throw new Error(tr("editor.errNotObject"))
  }
  const o = raw as Record<string, unknown>
  if (o.version !== 1) throw new Error(tr("editor.errBadVersion"))
  if (!Array.isArray(o.values) || !o.values.every((v) => typeof v === "number")) {
    throw new Error(tr("editor.shErrBadValues"))
  }
  return o as unknown as ShellWire
}

const docToWire = (doc: ShellSortDoc): ShellWire => ({
  version: 1,
  values: doc.values.map((v) => Math.round(v)),
})

const wireToDoc = (wire: ShellWire): ShellSortDoc => ({
  values: wire.values.map((v) => Math.max(0, Math.trunc(v))),
})

export const shellSortCodec = createDocCodec({ docToWire, parseWire, wireToDoc })
