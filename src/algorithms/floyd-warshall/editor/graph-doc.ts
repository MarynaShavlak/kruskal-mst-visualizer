// Серіалізація документа редактора Флойда–Воршала (орієнтований граф + позиції):
//  - JSON для імпорту/експорту;
//  - компактний base64url для шарингу через URL-хеш.
// Імпорт валідує структуру і перебудовує граф через lib/directedGraph (інваріанти).
// На відміну від Краскала: ребра напрямлені [from, to, weight], ваги — будь-які цілі.

import {
  addDirectedEdge,
  addDirectedVertex,
  emptyDirectedGraph,
  type DirectedGraph,
} from "@/lib/directedGraph"
import type { DirectedGraphDoc, XY } from "@/store/directed-graph-store"

interface WireDoc {
  readonly version: 1
  readonly vertices: readonly string[]
  readonly edges: readonly (readonly [string, string, number])[]
  readonly positions: Readonly<Record<string, readonly [number, number]>>
}

function docToWire(doc: DirectedGraphDoc): WireDoc {
  return {
    version: 1,
    vertices: [...doc.graph.vertices],
    edges: doc.graph.edges.map((e) => [e.from, e.to, e.weight] as const),
    positions: Object.fromEntries(
      Object.entries(doc.positions).map(
        ([k, p]) => [k, [Math.round(p.x), Math.round(p.y)] as const] as const,
      ),
    ),
  }
}

function wireToDoc(wire: WireDoc): DirectedGraphDoc {
  let g: DirectedGraph = emptyDirectedGraph()
  for (const v of wire.vertices) g = addDirectedVertex(g, v)
  for (const [from, to, w] of wire.edges) g = addDirectedEdge(g, from, to, w)
  const positions: Record<string, XY> = {}
  for (const v of g.vertices) {
    const p = wire.positions[v]
    positions[v] = p ? { x: p[0], y: p[1] } : { x: 0, y: 0 }
  }
  return { graph: g, positions }
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
    throw new Error("Документ має бути об'єктом")
  }
  const o = raw as Record<string, unknown>
  if (o.version !== 1) throw new Error("Непідтримувана версія документа")
  if (!Array.isArray(o.vertices) || !o.vertices.every((x) => typeof x === "string")) {
    throw new Error("Поле vertices невалідне")
  }
  if (!Array.isArray(o.edges) || !o.edges.every(isWireEdge)) {
    throw new Error("Поле edges невалідне")
  }
  if (typeof o.positions !== "object" || o.positions === null) {
    throw new Error("Поле positions невалідне")
  }
  for (const p of Object.values(o.positions as Record<string, unknown>)) {
    if (!isXYTuple(p)) throw new Error("Позиція має бути [x, y]")
  }
  return o as unknown as WireDoc
}

export function toJSON(doc: DirectedGraphDoc): string {
  return JSON.stringify(docToWire(doc), null, 2)
}

export function fromJSON(json: string): DirectedGraphDoc {
  return wireToDoc(parseWire(JSON.parse(json)))
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

export function encodeHash(doc: DirectedGraphDoc): string {
  return toBase64Url(JSON.stringify(docToWire(doc)))
}

export function decodeHash(s: string): DirectedGraphDoc | null {
  try {
    return wireToDoc(parseWire(JSON.parse(fromBase64Url(s))))
  } catch {
    return null
  }
}
