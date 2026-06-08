// Детермінований генератор випадкових орієнтованих графів (для пресета
// редактора Флойда–Воршала). Ваги додатні цілі — тож від'ємних циклів немає
// й матриця найкоротших відстаней завжди визначена.

import {
  addDirectedEdge,
  addDirectedVertex,
  emptyDirectedGraph,
  hasDirectedEdge,
  type DirectedGraph,
} from "@/lib/directedGraph"
import { vertexName } from "@/lib/graph"
import { mulberry32 } from "@/lib/randomGraph"

export interface RandomDirectedGraphOptions {
  readonly vertexCount: number
  /** Імовірність додаткового напрямленого ребра між парою (0..1). */
  readonly edgeProb?: number
  readonly maxWeight?: number
  readonly seed?: number
}

export function randomDirectedGraph(
  options: RandomDirectedGraphOptions,
): DirectedGraph {
  const { vertexCount, edgeProb = 0.3, maxWeight = 20, seed = 1 } = options

  const rand = mulberry32(seed)
  const names = Array.from({ length: vertexCount }, (_, i) => vertexName(i))
  const weight = (): number => 1 + Math.floor(rand() * maxWeight)

  let g = emptyDirectedGraph()
  for (const v of names) g = addDirectedVertex(g, v)

  // «Хребет» досяжності: кожна наступна вершина отримує вхідне ребро від
  // випадкової попередньої (forward-ребра → багато пар лишаються досяжними).
  for (let i = 1; i < vertexCount; i++) {
    const j = Math.floor(rand() * i)
    g = addDirectedEdge(g, names[j], names[i], weight())
  }

  // Додаткові напрямлені ребра в обидва боки (без дублів і петель).
  for (let i = 0; i < vertexCount; i++) {
    for (let j = 0; j < vertexCount; j++) {
      if (i === j) continue
      if (!hasDirectedEdge(g, names[i], names[j]) && rand() < edgeProb) {
        g = addDirectedEdge(g, names[i], names[j], weight())
      }
    }
  }

  return g
}
