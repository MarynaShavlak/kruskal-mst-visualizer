// Серіалізація документа редактора TSP (міста + старт):
//  - JSON для імпорту/експорту;
//  - компактний base64url для шарингу через URL-хеш (?g=...).
// Окремий wire-формат (version 1; місто як [name, x, y]) — не graph-doc, бо TSP
// без ребер. Старт затискається в межі при завантаженні. Чисто, без React.

import { tr } from "@/i18n/use-t"
import type { TspCity } from "@/lib/tsp"
import type { TspDoc } from "@/store/tsp-store"
import { createDocCodec } from "@/algorithms/shared/editor/doc-codec"

interface TspWire {
  readonly version: 1
  readonly cities: readonly (readonly [string, number, number])[]
  readonly start: number
}

function isWireCity(c: unknown): c is [string, number, number] {
  return (
    Array.isArray(c) &&
    c.length === 3 &&
    typeof c[0] === "string" &&
    typeof c[1] === "number" &&
    typeof c[2] === "number"
  )
}

function parseWire(raw: unknown): TspWire {
  if (typeof raw !== "object" || raw === null) {
    throw new Error(tr("editor.errNotObject"))
  }
  const o = raw as Record<string, unknown>
  if (o.version !== 1) throw new Error(tr("editor.errBadVersion"))
  if (!Array.isArray(o.cities) || !o.cities.every(isWireCity)) {
    throw new Error(tr("editor.errBadCities"))
  }
  if (typeof o.start !== "number" || !Number.isInteger(o.start)) {
    throw new Error(tr("editor.errBadStart"))
  }
  return o as unknown as TspWire
}

const docToWire = (doc: TspDoc): TspWire => ({
  version: 1,
  cities: doc.cities.map(
    (c) => [c.name, Math.round(c.x), Math.round(c.y)] as const,
  ),
  start: doc.start,
})

const wireToDoc = (wire: TspWire): TspDoc => {
  const cities: TspCity[] = wire.cities.map(([name, x, y]) => ({ name, x, y }))
  const start =
    cities.length === 0
      ? 0
      : Math.min(Math.max(0, wire.start), cities.length - 1)
  return { cities, start }
}

export const tspCodec = createDocCodec({ docToWire, parseWire, wireToDoc })
