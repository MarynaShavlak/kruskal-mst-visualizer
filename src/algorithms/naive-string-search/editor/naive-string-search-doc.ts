// Серіалізація документа редактора наївного пошуку (текст + шаблон): JSON для
// імпорту/експорту + компактний base64url для шарингу через URL-хеш (?g=...).
// Окремий wire-формат (version 1; два рядки). Без React.

import { tr } from "@/i18n/use-t"
import type { NaiveStringSearchDoc } from "@/store/naive-string-search-store"
import { createDocCodec } from "@/algorithms/shared/editor/doc-codec"

interface NaiveWire {
  readonly version: 1
  readonly text: string
  readonly pattern: string
}

function parseWire(raw: unknown): NaiveWire {
  if (typeof raw !== "object" || raw === null) {
    throw new Error(tr("editor.errNotObject"))
  }
  const o = raw as Record<string, unknown>
  if (o.version !== 1) throw new Error(tr("editor.errBadVersion"))
  if (typeof o.text !== "string") throw new Error(tr("editor.nssErrBadText"))
  if (typeof o.pattern !== "string") throw new Error(tr("editor.nssErrBadPattern"))
  return o as unknown as NaiveWire
}

const docToWire = (doc: NaiveStringSearchDoc): NaiveWire => ({
  version: 1,
  text: doc.text,
  pattern: doc.pattern,
})

const wireToDoc = (wire: NaiveWire): NaiveStringSearchDoc => ({
  text: wire.text,
  pattern: wire.pattern,
})

export const naiveStringSearchCodec = createDocCodec({ docToWire, parseWire, wireToDoc })
