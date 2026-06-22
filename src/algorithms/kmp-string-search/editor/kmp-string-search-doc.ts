// Серіалізація документа редактора KMP (текст + шаблон): JSON для імпорту/експорту +
// компактний base64url для шарингу через URL-хеш (?g=...). Окремий wire-формат (version 1;
// два рядки). Без React.

import { tr } from "@/i18n/use-t"
import type { KmpStringSearchDoc } from "@/store/kmp-string-search-store"

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

function toBase64Url(s: string): string {
  const bytes = new TextEncoder().encode(s)
  let bin = ""
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function fromBase64Url(s: string): string {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"))
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
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

export const kmpStringSearchCodec = {
  toJSON: (doc: KmpStringSearchDoc): string => JSON.stringify(docToWire(doc), null, 2),
  fromJSON: (json: string): KmpStringSearchDoc => wireToDoc(parseWire(JSON.parse(json))),
  encodeHash: (doc: KmpStringSearchDoc): string =>
    toBase64Url(JSON.stringify(docToWire(doc))),
  decodeHash: (s: string): KmpStringSearchDoc | null => {
    try {
      return wireToDoc(parseWire(JSON.parse(fromBase64Url(s))))
    } catch {
      return null
    }
  },
}
