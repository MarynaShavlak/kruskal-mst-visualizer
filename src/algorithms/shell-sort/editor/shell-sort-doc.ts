// Серіалізація документа редактора сортування Шелла (масив чисел): JSON для
// імпорту/експорту + компактний base64url для шарингу через URL-хеш (?g=...).
// Окремий wire-формат (version 1; масив цілих). Значення санітизуються (≥0). Без React.

import { tr } from "@/i18n/use-t"
import type { ShellSortDoc } from "@/store/shell-sort-store"

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

const docToWire = (doc: ShellSortDoc): ShellWire => ({
  version: 1,
  values: doc.values.map((v) => Math.round(v)),
})

const wireToDoc = (wire: ShellWire): ShellSortDoc => ({
  values: wire.values.map((v) => Math.max(0, Math.trunc(v))),
})

export const shellSortCodec = {
  toJSON: (doc: ShellSortDoc): string => JSON.stringify(docToWire(doc), null, 2),
  fromJSON: (json: string): ShellSortDoc => wireToDoc(parseWire(JSON.parse(json))),
  encodeHash: (doc: ShellSortDoc): string =>
    toBase64Url(JSON.stringify(docToWire(doc))),
  decodeHash: (s: string): ShellSortDoc | null => {
    try {
      return wireToDoc(parseWire(JSON.parse(fromBase64Url(s))))
    } catch {
      return null
    }
  },
}
