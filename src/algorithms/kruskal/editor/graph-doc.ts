// Серіалізація документа редактора Краскала: спільний кодек + неорієнтована
// graph-модель (ребра [u, v, weight]). Експорти toJSON/fromJSON/encodeHash/
// decodeHash незмінні — редактор і тести не чіпаємо.

import { addEdge, addVertex, emptyGraph, type Graph } from "@/lib/graph"
import { createGraphDocCodec } from "@/algorithms/shared/editor/graph-doc"

export const codec = createGraphDocCodec<Graph>({
  emptyGraph,
  addVertex,
  addEdge,
  edgesToWire: (g) => g.edges.map((e) => [e.u, e.v, e.weight] as const),
})

export const { toJSON, fromJSON, encodeHash, decodeHash } = codec
