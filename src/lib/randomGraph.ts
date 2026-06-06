// Детермінований генератор випадкових графів (для пресетів і property-тестів).

import {
  addEdge,
  addVertex,
  emptyGraph,
  hasEdge,
  vertexName,
  type Graph,
} from "@/lib/graph"

/** PRNG mulberry32 — детермінований за seed. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

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
