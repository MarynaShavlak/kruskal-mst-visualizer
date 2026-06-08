// Орієнтований зважений граф для Флойда–Воршала. Фреймворк-незалежний,
// JSON-серіалізовний. На відміну від неорієнтованого графа Краскала (graph.ts):
//   • ребро напрямлене (from → to), id "A->B" НЕ сортується;
//   • ваги — цілі числа, зокрема нульові й від'ємні (від'ємні цикли дозволені
//     як вхід — алгоритм їх виявляє);
//   • без петель (діагональ матриці відстаней завжди 0).
// Усі мутації — іммутабельні (повертають новий граф).

import { INF, type Matrix } from "@/lib/floydWarshall"
import type { Vertex } from "@/lib/graph"

export type { Vertex }

export interface DirectedEdge {
  /** id "from->to" — напрям зберігається, кінці не сортуються. */
  readonly id: string
  readonly from: Vertex
  readonly to: Vertex
  /** Ціла вага (може бути нульовою або від'ємною). */
  readonly weight: number
}

export interface DirectedGraph {
  readonly vertices: readonly Vertex[]
  readonly edges: readonly DirectedEdge[]
}

/** id орієнтованого ребра: напрям "from->to" (на відміну від "|" Краскала). */
export function directedEdgeId(from: Vertex, to: Vertex): string {
  return `${from}->${to}`
}

/** Порожній граф. */
export function emptyDirectedGraph(): DirectedGraph {
  return { vertices: [], edges: [] }
}

/** Чи є вершина у графі. */
export function hasDirectedVertex(g: DirectedGraph, v: Vertex): boolean {
  return g.vertices.includes(v)
}

/** Чи є ребро from→to (напрям важливий). */
export function hasDirectedEdge(
  g: DirectedGraph,
  from: Vertex,
  to: Vertex,
): boolean {
  const id = directedEdgeId(from, to)
  return g.edges.some((e) => e.id === id)
}

/** Додає вершину. Повертає той самий граф, якщо вже присутня. */
export function addDirectedVertex(g: DirectedGraph, v: Vertex): DirectedGraph {
  assertVertexName(v)
  if (hasDirectedVertex(g, v)) return g
  return { vertices: [...g.vertices, v], edges: g.edges }
}

/**
 * Додає орієнтоване ребро з валідацією: без петель, без дублів (за напрямом),
 * вага — ціле число. Відсутні кінці додаються як вершини. Зустрічне ребро
 * to→from дозволене (це інше ребро). Кидає помилку на невалідний вхід.
 */
export function addDirectedEdge(
  g: DirectedGraph,
  from: Vertex,
  to: Vertex,
  weight: number,
): DirectedGraph {
  assertVertexName(from)
  assertVertexName(to)
  if (from === to) {
    throw new Error(`Петля заборонена: ${from}`)
  }
  if (!Number.isInteger(weight)) {
    throw new Error(`Вага має бути цілим числом, отримано: ${weight}`)
  }
  if (hasDirectedEdge(g, from, to)) {
    throw new Error(`Дубль ребра: ${directedEdgeId(from, to)}`)
  }
  const edge: DirectedEdge = { id: directedEdgeId(from, to), from, to, weight }
  const withVerts = addDirectedVertex(addDirectedVertex(g, from), to)
  return { vertices: withVerts.vertices, edges: [...withVerts.edges, edge] }
}

/** Будує граф зі списку ребер [from, to, weight]. Зручно для тестів і пресетів. */
export function buildDirectedGraph(
  edges: ReadonlyArray<readonly [Vertex, Vertex, number]>,
  extraVertices: readonly Vertex[] = [],
): DirectedGraph {
  let g = emptyDirectedGraph()
  for (const v of extraVertices) g = addDirectedVertex(g, v)
  for (const [from, to, w] of edges) g = addDirectedEdge(g, from, to, w)
  return g
}

/** Видаляє вершину разом з усіма інцидентними ребрами (в обидва боки). */
export function removeDirectedVertex(
  g: DirectedGraph,
  v: Vertex,
): DirectedGraph {
  return {
    vertices: g.vertices.filter((x) => x !== v),
    edges: g.edges.filter((e) => e.from !== v && e.to !== v),
  }
}

/** Видаляє ребро за id "from->to". */
export function removeDirectedEdge(g: DirectedGraph, id: string): DirectedGraph {
  return { vertices: g.vertices, edges: g.edges.filter((e) => e.id !== id) }
}

/** Оновлює вагу наявного ребра (ціле). Кидає помилку, якщо ребра немає. */
export function setDirectedEdgeWeight(
  g: DirectedGraph,
  id: string,
  weight: number,
): DirectedGraph {
  if (!Number.isInteger(weight)) {
    throw new Error(`Вага має бути цілим числом, отримано: ${weight}`)
  }
  let found = false
  const edges = g.edges.map((e) => {
    if (e.id !== id) return e
    found = true
    return { ...e, weight }
  })
  if (!found) throw new Error(`Невідоме ребро: ${id}`)
  return { vertices: g.vertices, edges }
}

/** Стабільний порядок вершин для рядків/стовпців матриці (лексикографічний). */
export function vertexOrder(g: DirectedGraph): Vertex[] {
  return [...g.vertices].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
}

export interface DistMatrixView {
  /** Мітки вершин у порядку рядків/стовпців матриці. */
  readonly order: readonly Vertex[]
  /** Стартова матриця відстаней (угода INF): 0 на діагоналі, ваги ребер, решта INF. */
  readonly dist: Matrix
}

/**
 * Будує стартову матрицю відстаней (угода INF) з орієнтованого графа.
 * Підтримує ребра нульової ваги (на відміну від угоди «0 == немає ребра»).
 */
export function toDistMatrix(g: DirectedGraph): DistMatrixView {
  const order = vertexOrder(g)
  const index = new Map(order.map((v, i) => [v, i] as const))
  const n = order.length
  const dist: Matrix = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 0 : INF)),
  )
  for (const e of g.edges) {
    const i = index.get(e.from)
    const j = index.get(e.to)
    if (i !== undefined && j !== undefined) dist[i][j] = e.weight
  }
  return { order, dist }
}

function assertVertexName(v: Vertex): void {
  if (typeof v !== "string" || v.length === 0) {
    throw new Error(
      `Назва вершини має бути непорожнім рядком, отримано: ${JSON.stringify(v)}`,
    )
  }
}
