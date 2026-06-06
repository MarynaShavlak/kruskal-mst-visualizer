// Compute-only варіанти Краскала (без побудови trace) — для бенчмарку.
// Дають той самий результат, що й traced-версії, але без накладних витрат на кадри.

import { DSU } from "@/lib/dsu"
import { sortedEdges, type Graph, type Vertex } from "@/lib/graph"

export interface MstCompute {
  readonly mstEdgeIds: string[]
  readonly totalWeight: number
}

function targetEdges(graph: Graph): number {
  return graph.vertices.length === 0 ? 0 : graph.vertices.length - 1
}

/** Краскал на DSU (union-by-rank + path compression). */
export function kruskalDsuCompute(graph: Graph): MstCompute {
  const edges = sortedEdges(graph)
  const dsu = new DSU(graph.vertices)
  const mstEdgeIds: string[] = []
  let totalWeight = 0
  const target = targetEdges(graph)

  for (const e of edges) {
    if (dsu.findRoot(e.u) !== dsu.findRoot(e.v)) {
      dsu.union(e.u, e.v)
      mstEdgeIds.push(e.id)
      totalWeight += e.weight
      if (mstEdgeIds.length === target) break
    }
  }
  return { mstEdgeIds, totalWeight }
}

/** Наївний Краскал: перевірка циклу обходом (BFS) у допоміжному лісі. */
export function kruskalHasPathCompute(graph: Graph): MstCompute {
  const edges = sortedEdges(graph)
  const adj = new Map<Vertex, Vertex[]>()
  for (const v of graph.vertices) adj.set(v, [])
  const mstEdgeIds: string[] = []
  let totalWeight = 0
  const target = targetEdges(graph)

  for (const e of edges) {
    if (!hasPath(adj, e.u, e.v)) {
      mstEdgeIds.push(e.id)
      totalWeight += e.weight
      adj.get(e.u)!.push(e.v)
      adj.get(e.v)!.push(e.u)
      if (mstEdgeIds.length === target) break
    }
  }
  return { mstEdgeIds, totalWeight }
}

function hasPath(
  adj: Map<Vertex, Vertex[]>,
  src: Vertex,
  dst: Vertex,
): boolean {
  const seen = new Set<Vertex>([src])
  const queue: Vertex[] = [src]
  let head = 0
  while (head < queue.length) {
    const v = queue[head++]
    if (v === dst) return true
    for (const nb of adj.get(v) ?? []) {
      if (!seen.has(nb)) {
        seen.add(nb)
        queue.push(nb)
      }
    }
  }
  return false
}
