// Демо-графи для живих фігур навчальної вкладки Дейкстри. Чисто (без React).
// MAIN — еталонний зважений граф (як у редакторі); SHORTCUT — випадок, де
// 2-крокова дорога коротша за пряме ребро (видно послаблення); DISCONNECTED —
// корнер-кейс із недосяжною вершиною (∞).

import { buildGraph, type Graph, type Vertex } from "@/lib/graph"
import type { XY } from "@/store/create-graph-store"
import { dijkstraExamplePreset } from "@/store/graph-search-presets"

export type DijkDemo = "main" | "shortcut" | "disconnected"

const main = dijkstraExamplePreset()

/** Пряме A–C коштує 5, але A→B→C = 2: Дейкстра «послабить» C з 5 до 2; далі D=4. */
const SHORTCUT: Graph = buildGraph([
  ["A", "B", 1],
  ["B", "C", 1],
  ["A", "C", 5],
  ["C", "D", 2],
])
const SHORTCUT_POS: Record<Vertex, XY> = {
  A: { x: 60, y: 230 },
  B: { x: 250, y: 60 },
  C: { x: 440, y: 230 },
  D: { x: 640, y: 230 },
}

/** Недосяжна вершина Z (без ребер): її відстань лишається ∞. */
const DISCONNECTED: Graph = buildGraph(
  [
    ["A", "B", 2],
    ["B", "C", 3],
  ],
  ["Z"],
)
const DISCONNECTED_POS: Record<Vertex, XY> = {
  A: { x: 70, y: 90 },
  B: { x: 300, y: 90 },
  C: { x: 530, y: 90 },
  Z: { x: 300, y: 300 },
}

export function dijkDemo(which: DijkDemo): {
  graph: Graph
  positions: Record<Vertex, XY>
} {
  switch (which) {
    case "shortcut":
      return { graph: SHORTCUT, positions: SHORTCUT_POS }
    case "disconnected":
      return { graph: DISCONNECTED, positions: DISCONNECTED_POS }
    default:
      return { graph: main.graph, positions: main.positions }
  }
}
