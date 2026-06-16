// Демо-графи для живих фігур навчальної вкладки Прима (відповідають
// examples/_graphs.py Python-репозиторію). Позиції — екранні пікселі (вісь Y
// вниз), MiniGraph/GraphView самі підганяють viewBox. Чисто, без React.

import { buildGraph, type Graph, type Vertex } from "@/lib/graph"
import { examplePreset } from "@/store/presets"

export type XY = { x: number; y: number }
export type DemoGraph = "AF" | "AG" | "ISLANDS"

/** Приклад 1 — граф `A–F` (6 вершин, 6 ребер); МОД = 11. */
export const GRAPH_AF: Graph = buildGraph([
  ["A", "B", 3],
  ["B", "C", 1],
  ["C", "D", 7],
  ["C", "F", 2],
  ["D", "E", 2],
  ["E", "F", 3],
])
export const POS_AF: Record<Vertex, XY> = {
  A: { x: 408, y: 12 },
  B: { x: 360, y: 120 },
  C: { x: 240, y: 120 },
  D: { x: 252, y: 324 },
  E: { x: 108, y: 120 },
  F: { x: 48, y: 0 },
}

// Приклад 2 — граф `A–G` (граф 2): еталонний граф із пресету редактора.
const ag = examplePreset()
export const GRAPH_AG: Graph = ag.graph
export const POS_AG: Record<Vertex, XY> = ag.positions

/** Незв'язний граф «островів» {M, N, O} та {P, Q} — обмеження Прима. */
export const GRAPH_ISLANDS: Graph = buildGraph([
  ["M", "N", 2],
  ["N", "O", 4],
  ["M", "O", 7],
  ["P", "Q", 3],
])
export const POS_ISLANDS: Record<Vertex, XY> = {
  M: { x: 0, y: 84 },
  N: { x: 168, y: 0 },
  O: { x: 144, y: 204 },
  P: { x: 384, y: 24 },
  Q: { x: 480, y: 168 },
}

export function demoGraph(which: DemoGraph): {
  graph: Graph
  positions: Record<Vertex, XY>
} {
  if (which === "AF") return { graph: GRAPH_AF, positions: POS_AF }
  if (which === "ISLANDS") return { graph: GRAPH_ISLANDS, positions: POS_ISLANDS }
  return { graph: GRAPH_AG, positions: POS_AG }
}
