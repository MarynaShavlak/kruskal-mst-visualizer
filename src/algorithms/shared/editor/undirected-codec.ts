// Спільний кодек документа редактора для неорієнтованих зважених графів
// (BFS / DFS / Дейкстра — той самий wire-формат, що й Прим/Краскал, тож
// шаринг-посилання сумісні між розділами).

import { addEdge, addVertex, emptyGraph, type Graph } from "@/lib/graph"
import { createGraphDocCodec } from "@/algorithms/shared/editor/graph-doc"

export const undirectedGraphCodec = createGraphDocCodec<Graph>({
  emptyGraph,
  addVertex,
  addEdge,
  edgesToWire: (g) => g.edges.map((e) => [e.u, e.v, e.weight] as const),
})
