// Детермінований генератор випадкових графів (для пресетів і property-тестів).

import {
  addEdge,
  addVertex,
  emptyGraph,
  hasEdge,
  vertexName,
  type Graph,
} from "@/lib/graph"

// mulberry32 живе в lib/prng; ре-експорт для сумісності зі старими імпортами
// `{ mulberry32 } from "@/lib/randomGraph"` (randomArray/randomKnapsack/randomTsp/…).
import { mulberry32 } from "@/lib/prng"
export { mulberry32 }

export interface RandomGraphOptions {
  readonly vertexCount: number
  /** Імовірність додаткового ребра між парою вершин (0..1). */
  readonly extraEdgeProb?: number
  readonly maxWeight?: number
  readonly seed?: number
  /** Гарантувати зв'язність (через випадкове кістякове дерево). */
  readonly connected?: boolean
}

export function randomGraph(options: RandomGraphOptions): Graph {
  const {
    vertexCount,
    extraEdgeProb = 0.3,
    maxWeight = 20,
    seed = 1,
    connected = true,
  } = options

  const rand = mulberry32(seed)
  const names = Array.from({ length: vertexCount }, (_, i) => vertexName(i))
  const weight = (): number => 1 + Math.floor(rand() * maxWeight)

  let g = emptyGraph()
  for (const v of names) g = addVertex(g, v)

  // Кістякове дерево: кожна нова вершина чіпляється до випадкової попередньої.
  if (connected) {
    for (let i = 1; i < vertexCount; i++) {
      const j = Math.floor(rand() * i)
      g = addEdge(g, names[i], names[j], weight())
    }
  }

  // Додаткові ребра (без дублів і петель).
  for (let i = 0; i < vertexCount; i++) {
    for (let j = i + 1; j < vertexCount; j++) {
      if (!hasEdge(g, names[i], names[j]) && rand() < extraEdgeProb) {
        g = addEdge(g, names[i], names[j], weight())
      }
    }
  }

  return g
}
