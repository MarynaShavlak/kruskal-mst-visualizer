// Пресети редактора: приклад (еталон) і випадковий граф — з розкладкою позицій.
// Чисто (без React); координати — звичайна математика.

import { referenceGraph } from "@/lib/exampleGraph"
import { randomGraph } from "@/lib/randomGraph"
import type { Vertex } from "@/lib/graph"
import type { GraphDoc, XY } from "@/store/graph-store"

const EXAMPLE_POSITIONS: Record<Vertex, XY> = {
  A: { x: 80, y: 90 },
  B: { x: 290, y: 40 },
  C: { x: 500, y: 100 },
  D: { x: 120, y: 250 },
  E: { x: 370, y: 240 },
  F: { x: 230, y: 410 },
  G: { x: 500, y: 360 },
}

export function examplePreset(): GraphDoc {
  return { graph: referenceGraph(), positions: { ...EXAMPLE_POSITIONS } }
}

export function circularLayout(
  vertices: readonly Vertex[],
  opts?: { radius?: number; cx?: number; cy?: number },
): Record<Vertex, XY> {
  const n = vertices.length
  const radius = opts?.radius ?? Math.max(140, n * 26)
  const cx = opts?.cx ?? radius + 60
  const cy = opts?.cy ?? radius + 60
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

export function randomPreset(seed: number, vertexCount = 7): GraphDoc {
  const graph = randomGraph({
    vertexCount,
    seed,
    extraEdgeProb: 0.35,
    maxWeight: 20,
    connected: true,
  })
  return { graph, positions: circularLayout(graph.vertices) }
}
