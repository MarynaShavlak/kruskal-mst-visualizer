// Кольори компонент і похідні підсвітки для панелі графа.
// Працює і для DSU-кадрів (зі знімка), і для наївних (із прийнятих ребер).

import { DSU } from "@/lib/dsu"
import type { Graph, Vertex } from "@/lib/graph"
import type { Frame, Trace } from "@/lib/trace"

/** Корені компонент на момент кадру. */
export function componentRoots(graph: Graph, frame: Frame): Map<Vertex, Vertex> {
  const roots = new Map<Vertex, Vertex>()

  if (frame.dsu) {
    const parent = frame.dsu.parent
    const findRoot = (v: Vertex): Vertex => {
      let cur = v
      while (parent[cur] !== undefined && parent[cur] !== cur) cur = parent[cur]
      return cur
    }
    for (const v of graph.vertices) roots.set(v, findRoot(v))
  } else {
    const dsu = new DSU(graph.vertices)
    const byId = new Map(graph.edges.map((e) => [e.id, e]))
    for (const id of frame.mstEdgeIds) {
      const e = byId.get(id)
      if (e) dsu.union(e.u, e.v)
    }
    for (const v of graph.vertices) roots.set(v, dsu.findRoot(v))
  }

  return roots
}

const PALETTE = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#d97706",
  "#9333ea",
  "#0891b2",
  "#db2777",
  "#65a30d",
  "#ea580c",
  "#4f46e5",
  "#0d9488",
  "#c026d3",
]

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** Стабільний колір компоненти за її коренем (за іменем кореня). */
export function colorForRoot(root: Vertex): string {
  return PALETTE[hashStr(root) % PALETTE.length]
}

/** Колір кожної вершини за коренем її компоненти. */
export function colorByRoot(roots: Map<Vertex, Vertex>): Map<Vertex, string> {
  const vertexColor = new Map<Vertex, string>()
  for (const [v, r] of roots) vertexColor.set(v, colorForRoot(r))
  return vertexColor
}

export type EdgeStatus = "accepted" | "current" | "rejected" | "pending"

/** Статус кожного ребра на момент кадру (для панелі графа й таблиці рішень). */
export function edgeStatuses(trace: Trace, frame: Frame): Map<string, EdgeStatus> {
  const accepted = new Set(frame.mstEdgeIds)
  const statuses = new Map<string, EdgeStatus>()
  trace.sortedEdgeIds.forEach((id, idx) => {
    if (accepted.has(id)) {
      statuses.set(id, "accepted")
    } else if (id === frame.consideredEdgeId) {
      statuses.set(id, frame.decision === "reject" ? "rejected" : "current")
    } else if (frame.edgeIndex >= 0 && idx < frame.edgeIndex) {
      statuses.set(id, "rejected")
    } else {
      statuses.set(id, "pending")
    }
  })
  return statuses
}
