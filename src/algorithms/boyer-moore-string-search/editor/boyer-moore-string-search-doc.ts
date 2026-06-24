// Серіалізація документа редактора Боєра-Мура (текст + шаблон): JSON для імпорту/експорту
// + компактний base64url для шарингу через URL-хеш (?g=...). Окремий wire-формат
// (version 1; два рядки). Без React.

import { tr } from "@/i18n/use-t"
import type { BoyerMooreStringSearchDoc } from "@/store/boyer-moore-string-search-store"
import { createDocCodec } from "@/algorithms/shared/editor/doc-codec"

interface BmWire {
  readonly version: 1
  readonly text: string
  readonly pattern: string
}

function parseWire(raw: unknown): BmWire {
  if (typeof raw !== "object" || raw === null) {
    throw new Error(tr("editor.errNotObject"))
  }
  const o = raw as Record<string, unknown>
  if (o.version !== 1) throw new Error(tr("editor.errBadVersion"))
  if (typeof o.text !== "string") throw new Error(tr("editor.bmErrBadText"))
  if (typeof o.pattern !== "string") throw new Error(tr("editor.bmErrBadPattern"))
  return o as unknown as BmWire
}

const docToWire = (doc: BoyerMooreStringSearchDoc): BmWire => ({
  version: 1,
  text: doc.text,
  pattern: doc.pattern,
})

const wireToDoc = (wire: BmWire): BoyerMooreStringSearchDoc => ({
  text: wire.text,
  pattern: wire.pattern,
})

export const boyerMooreStringSearchCodec = createDocCodec({ docToWire, parseWire, wireToDoc })
