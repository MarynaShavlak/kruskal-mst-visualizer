// Серіалізація документа редактора пошуку Рабіна-Карпа (текст + шаблон): JSON для
// імпорту/експорту + компактний base64url для шарингу через URL-хеш (?g=...).
// Окремий wire-формат (version 1; два рядки). Без React.

import { tr } from "@/i18n/use-t"
import type { RabinKarpStringSearchDoc } from "@/store/rabin-karp-string-search-store"
import { createDocCodec } from "@/algorithms/shared/editor/doc-codec"

interface RkWire {
  readonly version: 1
  readonly text: string
  readonly pattern: string
}

function parseWire(raw: unknown): RkWire {
  if (typeof raw !== "object" || raw === null) {
    throw new Error(tr("editor.errNotObject"))
  }
  const o = raw as Record<string, unknown>
  if (o.version !== 1) throw new Error(tr("editor.errBadVersion"))
  if (typeof o.text !== "string") throw new Error(tr("editor.rkErrBadText"))
  if (typeof o.pattern !== "string") throw new Error(tr("editor.rkErrBadPattern"))
  return o as unknown as RkWire
}

const docToWire = (doc: RabinKarpStringSearchDoc): RkWire => ({
  version: 1,
  text: doc.text,
  pattern: doc.pattern,
})

const wireToDoc = (wire: RkWire): RabinKarpStringSearchDoc => ({
  text: wire.text,
  pattern: wire.pattern,
})

export const rabinKarpStringSearchCodec = createDocCodec({ docToWire, parseWire, wireToDoc })
