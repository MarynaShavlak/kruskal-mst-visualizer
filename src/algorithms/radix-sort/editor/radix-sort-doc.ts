// Серіалізація документа редактора порозрядного сортування (масив чисел): JSON для
// імпорту/експорту + компактний base64url для шарингу через URL-хеш (?g=...).
// Окремий wire-формат (version 1; масив НЕВІД'ЄМНИХ цілих). Значення санітизуються
// (≥0). Без React.

import { tr } from "@/i18n/use-t"
import type { RadixSortDoc } from "@/store/radix-sort-store"

interface RadixWire {
  readonly version: 1
  readonly values: readonly number[]
}

function parseWire(raw: unknown): RadixWire {
  if (typeof raw !== "object" || raw === null) {
    throw new Error(tr("editor.errNotObject"))
  }
  const o = raw as Record<string, unknown>
  if (o.version !== 1) throw new Error(tr("editor.errBadVersion"))
  if (!Array.isArray(o.values) || !o.values.every((v) => typeof v === "number")) {
    throw new Error(tr("editor.rxErrBadValues"))
  }
  return o as unknown as RadixWire
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

const docToWire = (doc: RadixSortDoc): RadixWire => ({
  version: 1,
  values: doc.values.map((v) => Math.round(v)),
})

const wireToDoc = (wire: RadixWire): RadixSortDoc => ({
  values: wire.values.map((v) => Math.max(0, Math.trunc(v))),
})

export const radixSortCodec = {
  toJSON: (doc: RadixSortDoc): string => JSON.stringify(docToWire(doc), null, 2),
  fromJSON: (json: string): RadixSortDoc => wireToDoc(parseWire(JSON.parse(json))),
  encodeHash: (doc: RadixSortDoc): string =>
    toBase64Url(JSON.stringify(docToWire(doc))),
  decodeHash: (s: string): RadixSortDoc | null => {
    try {
      return wireToDoc(parseWire(JSON.parse(fromBase64Url(s))))
    } catch {
      return null
    }
  },
}
