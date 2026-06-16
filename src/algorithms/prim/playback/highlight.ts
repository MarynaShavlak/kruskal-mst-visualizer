// Чисте відображення кадру Прима у ролі ребер/вершин для панелі графа.
// Без React і без залежності від UI — лише дані. Кольори застосовує GraphView.

import type { Graph, Vertex } from "@/lib/graph"
import type { PrimFrame } from "@/lib/primTrace"

/**
 * Статус ребра на поточному кадрі:
 * - `tree` — прийняте, у МОД (зелене);
 * - `candidate` — у черзі, веде до невідвіданої вершини (синій пунктир);
 * - `stale` — у черзі, але обидва кінці вже в дереві → застаріле (сірий пунктир);
 * - `popped` — щойно зняте з черги, перевіряємо (червоне суцільне);
 * - `poppedSkip` — зняте й пропущене як застаріле (червоний пунктир, ✗);
 * - `pending` — ще не задіяне (тонке сіре).
 */
export type PrimEdgeStatus =
  | "tree"
  | "candidate"
  | "stale"
  | "popped"
  | "poppedSkip"
  | "pending"

export function edgeStatuses(
  frame: PrimFrame,
): Map<string, PrimEdgeStatus> {
  const visited = new Set(frame.visited)
  const mst = new Set(frame.mstEdgeIds)
  const queue = new Map(frame.queue.map((q) => [q.id, q]))
  const out = new Map<string, PrimEdgeStatus>()

  const all = new Set<string>([
    ...mst,
    ...queue.keys(),
  ])
  if (frame.popped) all.add(frame.popped.id)

  for (const id of all) {
    // Щойно зняте ребро: на кадрі "pop" — перевіряємо (червоне), на "skip" —
    // застаріле (червоний пунктир). На "accept" воно вже в mst → випаде як tree.
    if (frame.popped && frame.popped.id === id && !mst.has(id)) {
      out.set(id, frame.sub.kind === "skip" ? "poppedSkip" : "popped")
      continue
    }
    if (mst.has(id)) {
      out.set(id, "tree")
      continue
    }
    const q = queue.get(id)
    if (q) {
      out.set(id, visited.has(q.to) && visited.has(q.from) ? "stale" : "candidate")
      continue
    }
  }
  return out
}

/** Підсвітка-кільце вершини на поточному кадрі. */
export interface PrimVertexRole {
  /** Вершина вже в дереві (зелена заливка). */
  readonly inTree: boolean
  /** Щойно приєднана (помаранчеве суцільне кільце). */
  readonly justAdded: boolean
  /** Кінець-кандидат знятого ребра, який зараз перевіряємо (пунктирне кільце). */
  readonly examining: boolean
  /** Стартова вершина (маркер). */
  readonly isStart: boolean
}

export function vertexRole(frame: PrimFrame, v: Vertex): PrimVertexRole {
  const visited = new Set(frame.visited)
  const examining =
    frame.popped != null &&
    frame.popped.to === v &&
    (frame.sub.kind === "pop" || frame.sub.kind === "skip")
  return {
    inTree: visited.has(v),
    justAdded: frame.addedVertex === v && frame.sub.kind !== "init",
    examining,
    isStart: frame.start === v,
  }
}

/** Зручна мапа id ребра → вага (для панелей черги/МОД). */
export function weightById(graph: Graph): Map<string, number> {
  return new Map(graph.edges.map((e) => [e.id, e.weight]))
}
