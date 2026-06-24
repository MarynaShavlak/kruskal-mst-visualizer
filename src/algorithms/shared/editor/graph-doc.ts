// Спільна серіалізація документа редактора (граф + позиції):
//  - JSON для імпорту/експорту;
//  - компактний base64url для шарингу через URL-хеш (?g=...).
// Wire-формат однаковий для всіх графів (version 1; ребра як [кінець1, кінець2,
// вага]; позиції як [x, y]), тож шаринг-посилання сумісні між алгоритмами.
// graph-модель інжектиться: як читати ребра й перебудовувати граф з інваріантами.

import { tr } from "@/i18n/use-t"
import type { GraphLike, GraphStoreDoc, XY } from "@/store/create-graph-store"
import { createDocCodec } from "./doc-codec"

/** Як кодек читає й будує конкретну graph-модель. */
export interface GraphDocModel<G extends GraphLike> {
  emptyGraph: () => G
  addVertex: (g: G, v: string) => G
  addEdge: (g: G, a: string, b: string, weight: number) => G
  /** Ребра графа у дротовому вигляді [кінець1, кінець2, вага]. */
  edgesToWire: (g: G) => readonly (readonly [string, string, number])[]
}

export interface GraphDocCodec<G extends GraphLike> {
  toJSON: (doc: GraphStoreDoc<G>) => string
  fromJSON: (json: string) => GraphStoreDoc<G>
  encodeHash: (doc: GraphStoreDoc<G>) => string
  decodeHash: (s: string) => GraphStoreDoc<G> | null
}

interface WireDoc {
  readonly version: 1
  readonly vertices: readonly string[]
  readonly edges: readonly (readonly [string, string, number])[]
  readonly positions: Readonly<Record<string, readonly [number, number]>>
}

function isWireEdge(e: unknown): e is [string, string, number] {
  return (
    Array.isArray(e) &&
    e.length === 3 &&
    typeof e[0] === "string" &&
    typeof e[1] === "string" &&
    typeof e[2] === "number"
  )
}

function isXYTuple(p: unknown): p is [number, number] {
  return (
    Array.isArray(p) &&
    p.length === 2 &&
    typeof p[0] === "number" &&
    typeof p[1] === "number"
  )
}

function parseWire(raw: unknown): WireDoc {
  if (typeof raw !== "object" || raw === null) {
    throw new Error(tr("editor.errNotObject"))
  }
  const o = raw as Record<string, unknown>
  if (o.version !== 1) throw new Error(tr("editor.errBadVersion"))
  if (
    !Array.isArray(o.vertices) ||
    !o.vertices.every((x) => typeof x === "string")
  ) {
    throw new Error(tr("editor.errBadVertices"))
  }
  if (!Array.isArray(o.edges) || !o.edges.every(isWireEdge)) {
    throw new Error(tr("editor.errBadEdges"))
  }
  if (typeof o.positions !== "object" || o.positions === null) {
    throw new Error(tr("editor.errBadPositions"))
  }
  for (const p of Object.values(o.positions as Record<string, unknown>)) {
    if (!isXYTuple(p)) throw new Error(tr("editor.errBadPosition"))
  }
  return o as unknown as WireDoc
}

/** Будує кодек документа (JSON + URL-хеш) для заданої graph-моделі. */
export function createGraphDocCodec<G extends GraphLike>(
  model: GraphDocModel<G>,
): GraphDocCodec<G> {
  const docToWire = (doc: GraphStoreDoc<G>): WireDoc => ({
    version: 1,
    vertices: [...doc.graph.vertices],
    edges: model.edgesToWire(doc.graph),
    positions: Object.fromEntries(
      Object.entries(doc.positions).map(
        ([k, p]) => [k, [Math.round(p.x), Math.round(p.y)] as const] as const,
      ),
    ),
  })

  const wireToDoc = (wire: WireDoc): GraphStoreDoc<G> => {
    let g = model.emptyGraph()
    for (const v of wire.vertices) g = model.addVertex(g, v)
    for (const [a, b, w] of wire.edges) g = model.addEdge(g, a, b, w)
    const positions: Record<string, XY> = {}
    for (const v of g.vertices) {
      const p = wire.positions[v]
      positions[v] = p ? { x: p[0], y: p[1] } : { x: 0, y: 0 }
    }
    return { graph: g, positions }
  }

  return createDocCodec({ docToWire, parseWire, wireToDoc })
}
