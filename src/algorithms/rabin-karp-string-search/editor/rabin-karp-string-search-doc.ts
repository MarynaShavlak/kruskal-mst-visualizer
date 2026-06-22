// Серіалізація документа редактора пошуку Рабіна-Карпа (текст + шаблон): JSON для
// імпорту/експорту + компактний base64url для шарингу через URL-хеш (?g=...).
// Окремий wire-формат (version 1; два рядки). Без React.

import { tr } from "@/i18n/use-t"
import type { RabinKarpStringSearchDoc } from "@/store/rabin-karp-string-search-store"

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

const docToWire = (doc: RabinKarpStringSearchDoc): RkWire => ({
  version: 1,
  text: doc.text,
  pattern: doc.pattern,
})

const wireToDoc = (wire: RkWire): RabinKarpStringSearchDoc => ({
  text: wire.text,
  pattern: wire.pattern,
})

export const rabinKarpStringSearchCodec = {
  toJSON: (doc: RabinKarpStringSearchDoc): string => JSON.stringify(docToWire(doc), null, 2),
  fromJSON: (json: string): RabinKarpStringSearchDoc => wireToDoc(parseWire(JSON.parse(json))),
  encodeHash: (doc: RabinKarpStringSearchDoc): string =>
    toBase64Url(JSON.stringify(docToWire(doc))),
  decodeHash: (s: string): RabinKarpStringSearchDoc | null => {
    try {
      return wireToDoc(parseWire(JSON.parse(fromBase64Url(s))))
    } catch {
      return null
    }
  },
}
