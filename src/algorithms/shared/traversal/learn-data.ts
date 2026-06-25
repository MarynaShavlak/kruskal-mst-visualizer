// Демо-графи для живих фігур навчальних вкладок BFS/DFS. Чисто (без React).
// MAIN — еталонний граф обходу (той самий, що в редакторі); решта — навчальні
// випадки/корнер-кейси: ланцюг, цикл, незв'язний граф.

import { buildGraph, type Graph, type Vertex } from "@/lib/graph"
import type { XY } from "@/store/create-graph-store"
import { traversalExamplePreset } from "@/store/graph-search-presets"

export type TravDemo = "main" | "chain" | "cyclic" | "disconnected"

const main = traversalExamplePreset()

/** Ланцюг A–B–C–D–E: BFS і DFS дають ОДНАКОВИЙ порядок (немає розгалужень). */
const CHAIN: Graph = buildGraph([
  ["A", "B", 1],
  ["B", "C", 1],
  ["C", "D", 1],
  ["D", "E", 1],
])
const CHAIN_POS: Record<Vertex, XY> = {
  A: { x: 40, y: 120 },
  B: { x: 190, y: 120 },
  C: { x: 340, y: 120 },
  D: { x: 490, y: 120 },
  E: { x: 640, y: 120 },
}

/** Цикл A–B–C–D–A: показує, що множина «відвіданих» рятує від нескінченного обходу. */
const CYCLIC: Graph = buildGraph([
  ["A", "B", 1],
  ["B", "C", 1],
  ["C", "D", 1],
  ["A", "D", 1],
])
const CYCLIC_POS: Record<Vertex, XY> = {
  A: { x: 120, y: 60 },
  B: { x: 380, y: 60 },
  C: { x: 380, y: 320 },
  D: { x: 120, y: 320 },
}

/** Незв'язний: трикутник {A,B,C} + окреме ребро {D,E}. Обхід з A не дійде до D,E. */
const DISCONNECTED: Graph = buildGraph([
  ["A", "B", 1],
  ["A", "C", 1],
  ["B", "C", 1],
  ["D", "E", 1],
])
const DISCONNECTED_POS: Record<Vertex, XY> = {
  A: { x: 70, y: 60 },
  B: { x: 300, y: 60 },
  C: { x: 185, y: 290 },
  D: { x: 470, y: 90 },
  E: { x: 620, y: 260 },
}

export function travDemo(which: TravDemo): {
  graph: Graph
  positions: Record<Vertex, XY>
} {
  switch (which) {
    case "chain":
      return { graph: CHAIN, positions: CHAIN_POS }
    case "cyclic":
      return { graph: CYCLIC, positions: CYCLIC_POS }
    case "disconnected":
      return { graph: DISCONNECTED, positions: DISCONNECTED_POS }
    default:
      return { graph: main.graph, positions: main.positions }
  }
}
