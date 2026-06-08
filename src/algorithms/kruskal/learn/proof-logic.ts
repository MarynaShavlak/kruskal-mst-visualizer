// Чиста логіка для інтерактивного доведення «аргумент обміну».
import type { Graph } from "@/lib/graph"

/**
 * Цикл, який утворює ребро `edgeId` при додаванні до дерева `mstIds`:
 * шлях у дереві між кінцями ребра + саме ребро. Повертає id ребер циклу.
 */
export function mstCycle(
  graph: Graph,
  mstIds: ReadonlySet<string>,
  edgeId: string,
): Set<string> {
  const edge = graph.edges.find((e) => e.id === edgeId)
  if (!edge) return new Set()

  const adj = new Map<string, { to: string; id: string }[]>()
  for (const v of graph.vertices) adj.set(v, [])
  for (const e of graph.edges) {
    if (mstIds.has(e.id)) {
      adj.get(e.u)!.push({ to: e.v, id: e.id })
      adj.get(e.v)!.push({ to: e.u, id: e.id })
    }
  }

  const prev = new Map<string, { from: string; id: string }>()
  const seen = new Set<string>([edge.u])
  const queue: string[] = [edge.u]
  let head = 0
  while (head < queue.length) {
    const x = queue[head++]
    if (x === edge.v) break
    for (const { to, id } of adj.get(x) ?? []) {
      if (!seen.has(to)) {
        seen.add(to)
        prev.set(to, { from: x, id })
        queue.push(to)
      }
    }
  }

  const cycle = new Set<string>()
  if (!seen.has(edge.v)) return cycle
  cycle.add(edgeId)
  let cur = edge.v
  while (cur !== edge.u) {
    const p = prev.get(cur)
    if (!p) break
    cycle.add(p.id)
    cur = p.from
  }
  return cycle
}

/** id ребра з максимальною вагою серед `ids` (null, якщо порожньо). */
export function maxWeightEdgeId(
  graph: Graph,
  ids: Iterable<string>,
): string | null {
  const byId = new Map(graph.edges.map((e) => [e.id, e]))
  let best: { id: string; weight: number } | null = null
  for (const id of ids) {
    const e = byId.get(id)
    if (e && (!best || e.weight > best.weight)) best = { id, weight: e.weight }
  }
  return best ? best.id : null
}
