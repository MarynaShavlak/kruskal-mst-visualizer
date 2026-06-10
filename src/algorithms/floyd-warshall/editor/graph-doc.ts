// Серіалізація документа редактора Флойда–Воршала: спільний кодек + орієнтована
// graph-модель (ребра [from, to, weight], ваги — будь-які цілі). Експорти
// toJSON/fromJSON/encodeHash/decodeHash незмінні — редактор і тести не чіпаємо.

import {
  addDirectedEdge,
  addDirectedVertex,
  emptyDirectedGraph,
  type DirectedGraph,
} from "@/lib/directedGraph"
import { createGraphDocCodec } from "@/algorithms/shared/editor/graph-doc"

export const codec = createGraphDocCodec<DirectedGraph>({
  emptyGraph: emptyDirectedGraph,
  addVertex: addDirectedVertex,
  addEdge: addDirectedEdge,
  edgesToWire: (g) => g.edges.map((e) => [e.from, e.to, e.weight] as const),
})

export const { toJSON, fromJSON, encodeHash, decodeHash } = codec
