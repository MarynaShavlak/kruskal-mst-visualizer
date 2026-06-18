// Серіалізація документа редактора лінійного пошуку (масив чисел + ціль): JSON для
// імпорту/експорту + компактний base64url для шарингу через URL-хеш (?g=...).
// Окремий wire-формат (version 1; масив цілих + ціль). Значення санітизуються до
// цілих. Без React.

import { tr } from "@/i18n/use-t"
import type { LinearSearchDoc } from "@/store/linear-search-store"

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

const docToWire = (doc: LinearSearchDoc): LinearWire => ({
  version: 1,
  values: doc.values.map((v) => Math.round(v)),
  target: Math.round(doc.target),
})

const wireToDoc = (wire: LinearWire): LinearSearchDoc => ({
  values: wire.values.map((v) => Math.trunc(v)),
  target: Math.trunc(wire.target),
})

export const linearSearchCodec = {
  toJSON: (doc: LinearSearchDoc): string => JSON.stringify(docToWire(doc), null, 2),
  fromJSON: (json: string): LinearSearchDoc => wireToDoc(parseWire(JSON.parse(json))),
  encodeHash: (doc: LinearSearchDoc): string =>
    toBase64Url(JSON.stringify(docToWire(doc))),
  decodeHash: (s: string): LinearSearchDoc | null => {
    try {
      return wireToDoc(parseWire(JSON.parse(fromBase64Url(s))))
    } catch {
      return null
    }
  },
}
