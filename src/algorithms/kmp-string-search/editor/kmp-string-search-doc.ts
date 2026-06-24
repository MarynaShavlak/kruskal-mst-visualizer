// Серіалізація документа редактора KMP (текст + шаблон): JSON для імпорту/експорту +
// компактний base64url для шарингу через URL-хеш (?g=...). Окремий wire-формат (version 1;
// два рядки). Без React.

import { tr } from "@/i18n/use-t"
import type { KmpStringSearchDoc } from "@/store/kmp-string-search-store"
import { createDocCodec } from "@/algorithms/shared/editor/doc-codec"

interface KmpWire {
  readonly version: 1
  readonly text: string
  readonly pattern: string
}

function parseWire(raw: unknown): KmpWire {
  if (typeof raw !== "object" || raw === null) {
    throw new Error(tr("editor.errNotObject"))
  }
  const o = raw as Record<string, unknown>
  if (o.version !== 1) throw new Error(tr("editor.errBadVersion"))
  if (typeof o.text !== "string") throw new Error(tr("editor.kmpErrBadText"))
  if (typeof o.pattern !== "string") throw new Error(tr("editor.kmpErrBadPattern"))
  return o as unknown as KmpWire
}

const docToWire = (doc: KmpStringSearchDoc): KmpWire => ({
  version: 1,
  text: doc.text,
  pattern: doc.pattern,
})

const wireToDoc = (wire: KmpWire): KmpStringSearchDoc => ({
  text: wire.text,
  pattern: wire.pattern,
})

export const kmpStringSearchCodec = createDocCodec({ docToWire, parseWire, wireToDoc })
