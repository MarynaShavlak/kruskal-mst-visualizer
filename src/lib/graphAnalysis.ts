// Аналіз графа: компоненти зв'язності та зв'язність (через DSU).
// Чисто, без UI; використовується редактором і плеєром.

import { DSU } from "@/lib/dsu"
import type { Graph, Vertex } from "@/lib/graph"

export interface GraphAnalysis {
  readonly vertexCount: number
  readonly edgeCount: number
  readonly componentCount: number
  readonly isConnected: boolean
  /** Групи вершин за компонентами зв'язності. */
  readonly components: readonly (readonly Vertex[])[]
}

export function analyzeGraph(g: Graph): GraphAnalysis {
  const dsu = new DSU(g.vertices)
  for (const e of g.edges) dsu.union(e.u, e.v)

  const groups = new Map<Vertex, Vertex[]>()
  for (const v of g.vertices) {
    const root = dsu.findRoot(v)
    const group = groups.get(root)
    if (group) group.push(v)
    else groups.set(root, [v])
  }

  const components = [...groups.values()]
  return {
    vertexCount: g.vertices.length,
    edgeCount: g.edges.length,
    componentCount: components.length,
    isConnected: g.vertices.length > 0 && components.length === 1,
    components,
  }
}
