// Пресети редактора Флойда–Воршала: три еталонні графи з README (A–F, P–S,
// X–Y–Z) із розкладкою позицій + випадковий орієнтований граф. Чисто (без React).

import type { DirectedGraph, Vertex } from "@/lib/directedGraph"
import {
  abcdefGraph,
  pqrsGraph,
  xyzGraph,
} from "@/lib/exampleDirectedGraph"
import { randomDirectedGraph } from "@/lib/randomDirectedGraph"
import type { DirectedGraphDoc, XY } from "@/store/directed-graph-store"

const ABCDEF_POSITIONS: Record<Vertex, XY> = {
  A: { x: 80, y: 60 },
  B: { x: 320, y: 50 },
  C: { x: 320, y: 200 },
  D: { x: 320, y: 360 },
  E: { x: 80, y: 200 },
  F: { x: 80, y: 360 },
}

const PQRS_POSITIONS: Record<Vertex, XY> = {
  P: { x: 60, y: 220 },
  Q: { x: 240, y: 70 },
  R: { x: 440, y: 70 },
  S: { x: 600, y: 220 },
}

const XYZ_POSITIONS: Record<Vertex, XY> = {
  X: { x: 240, y: 50 },
  Y: { x: 390, y: 320 },
  Z: { x: 90, y: 320 },
}

/** Приклад A–F (лише додатні ваги). */
export function abcdefPreset(): DirectedGraphDoc {
  return { graph: abcdefGraph(), positions: { ...ABCDEF_POSITIONS } }
}

/** Від'ємне ребро Q→R: пряме P→S=10 програє шляху P→Q→R→S=5. */
export function pqrsPreset(): DirectedGraphDoc {
  return { graph: pqrsGraph(), positions: { ...PQRS_POSITIONS } }
}

/** Повністю від'ємний цикл X→Y→Z→X (кожне ребро −1). */
export function xyzPreset(): DirectedGraphDoc {
  return { graph: xyzGraph(), positions: { ...XYZ_POSITIONS } }
}

/** Кругла розкладка вершин (для випадкового графа). */
function circularLayout(vertices: readonly Vertex[]): Record<Vertex, XY> {
  const n = vertices.length
  const radius = Math.max(140, n * 26)
  const cx = radius + 60
  const cy = radius + 60
  const positions: Record<Vertex, XY> = {}
  vertices.forEach((v, i) => {
    const angle = (2 * Math.PI * i) / Math.max(1, n) - Math.PI / 2
    positions[v] = {
      x: Math.round(cx + radius * Math.cos(angle)),
      y: Math.round(cy + radius * Math.sin(angle)),
    }
  })
  return positions
}

export function randomDirectedPreset(
  seed: number,
  vertexCount = 6,
): DirectedGraphDoc {
  const graph: DirectedGraph = randomDirectedGraph({
    vertexCount,
    seed,
    edgeProb: 0.28,
    maxWeight: 20,
  })
  return { graph, positions: circularLayout(graph.vertices) }
}
