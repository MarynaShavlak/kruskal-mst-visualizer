// Чисте відображення кадру обходу (BFS/DFS) у ролі ребер/вершин для панелі графа.
// Без React — лише дані; кольори застосовує GraphView.

import type { Vertex } from "@/lib/graph"
import type { TraversalFrame } from "@/lib/graphTraversal"

/**
 * Статус ребра на поточному кадрі:
 * - `tree` — ребро дерева обходу (зелене);
 * - `current` — ребро-«відкриття» поточної вершини цього кроку (помаранчеве);
 * - `pending` — ще не задіяне (тонке сіре).
 */
export type TravEdgeStatus = "tree" | "current" | "pending"

export function travEdgeStatuses(
  frame: TraversalFrame,
): Map<string, TravEdgeStatus> {
  const out = new Map<string, TravEdgeStatus>()
  for (const id of frame.treeEdgeIds) out.set(id, "tree")
  if (frame.currentEdgeId) out.set(frame.currentEdgeId, "current")
  return out
}

/** Роль вершини на поточному кадрі (для заливки/кільця). */
export interface TravVertexRole {
  /** Уже відвідана (зелена заливка). */
  readonly visited: boolean
  /** Зняти з фронтиру цього кроку — зараз у фокусі (помаранчеве кільце). */
  readonly current: boolean
  /** Перебуває у фронтирі (черга/стек), ще не відвідана (синє кільце). */
  readonly inFrontier: boolean
  /** Стартова вершина (маркер). */
  readonly isStart: boolean
}

export function travVertexRole(
  frame: TraversalFrame,
  v: Vertex,
): TravVertexRole {
  const visited = frame.visited.includes(v)
  const current =
    frame.current === v &&
    (frame.sub === "pop" || frame.sub === "visit" || frame.sub === "skip")
  return {
    visited,
    current,
    inFrontier: !visited && frame.frontier.includes(v),
    isStart: frame.start === v,
  }
}
