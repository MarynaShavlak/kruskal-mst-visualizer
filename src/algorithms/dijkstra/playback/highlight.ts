// Чисте відображення кадру Дейкстри у ролі ребер/вершин для панелі графа.
// Без React — лише дані; кольори застосовує GraphView. Відповідає кольорам PDF:
// відвідані (опрацьовані) вершини — зелені, розглянуті ребра — червоні.

import type { Vertex } from "@/lib/graph"
import type { DijkstraFrame } from "@/lib/dijkstra"

/**
 * Статус ребра:
 * - `tree` — ребро дерева найкоротших шляхів (зелене, за prev);
 * - `considered` — розглядається ЦЬОГО relax (яскраво-червоне);
 * - `explored` — уже розглядалось раніше (тьмяно-червоне);
 * - `pending` — ще не задіяне (тонке сіре).
 */
export type DijkEdgeStatus = "tree" | "considered" | "explored" | "pending"

export function dijkEdgeStatuses(
  frame: DijkstraFrame,
): Map<string, DijkEdgeStatus> {
  const out = new Map<string, DijkEdgeStatus>()
  for (const id of frame.exploredEdgeIds) out.set(id, "explored")
  for (const id of frame.treeEdgeIds) out.set(id, "tree")
  for (const id of frame.consideredEdgeIds) out.set(id, "considered")
  return out
}

/** Роль вершини на поточному кадрі. */
export interface DijkVertexRole {
  /** Остаточно опрацьована (зелена заливка). */
  readonly settled: boolean
  /** Обрана цього кроку — у фокусі (помаранчеве кільце). */
  readonly current: boolean
  /** Покращена цього relax (миготливе виділення). */
  readonly updated: boolean
  /** Стартова вершина (маркер). */
  readonly isStart: boolean
}

export function dijkVertexRole(
  frame: DijkstraFrame,
  v: Vertex,
): DijkVertexRole {
  return {
    settled: frame.visited.includes(v),
    current:
      frame.current === v && (frame.sub === "select" || frame.sub === "relax"),
    updated: frame.updated.includes(v),
    isStart: frame.start === v,
  }
}
