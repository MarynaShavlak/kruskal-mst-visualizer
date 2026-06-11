// Наївний Краскал: перевірка циклу обходом (BFS) у допоміжному лісі.
// Повільна версія «для ідеї». Дає ІДЕНТИЧНИЙ результат із DSU-версією,
// бо обидві обробляють ребра в тому самому порядку й приймають ребро,
// лише якщо воно з'єднує різні компоненти.

import { sortedEdges, type Edge, type Graph, type Vertex } from "@/lib/graph"
import { identityTranslate, type Translate } from "@/lib/translate"
import {
  TraceBuilder,
  type EdgeDecision,
  type KruskalRun,
  type MstResult,
  type Sub,
} from "@/lib/trace"

/** Лістинг для панелі підсвітки (рядки 1-based). */
export const KRUSKAL_HASPATH_CODE: readonly string[] = [
  "function kruskalHasPath(graph) {",
  "  const forest = []                 // допоміжний ліс",
  "  for (const e of sortByWeight(graph.edges)) {",
  "    if (hasPath(forest, e.u, e.v))  // BFS у лісі",
  "      continue                      // цикл",
  "    forest.push(e)",
  "    if (forest.length === graph.vertices.length - 1) break",
  "  }",
  "  return forest",
  "}",
  "",
  "function hasPath(forest, src, dst) {",
  "  const queue = [src], seen = {src}",
  "  while (queue.length) {",
  "    const v = queue.shift()",
  "    if (v === dst) return true",
  "    for (const nb of neighbors(forest, v))",
  "      if (!seen[nb]) { seen[nb] = true; queue.push(nb) }",
  "  }",
  "  return false",
  "}",
]

const edgeLabel = (e: Edge): string => `${e.u}–${e.v}`

export function kruskalHasPath(
  graph: Graph,
  t: Translate = identityTranslate,
): KruskalRun {
  const edges = sortedEdges(graph)
  const tb = new TraceBuilder(
    "hasPath",
    KRUSKAL_HASPATH_CODE,
    edges.map((e) => e.id),
  )

  // Суміжність допоміжного лісу (лише прийняті ребра).
  const adj = new Map<Vertex, Vertex[]>()
  for (const v of graph.vertices) adj.set(v, [])

  const mst: string[] = []
  let weight = 0
  let considered = 0
  const n = graph.vertices.length
  const need = n === 0 ? 0 : n - 1

  let edgeIndex = -1
  let consideredEdgeId: string | null = null
  const emit = (
    lines: number[],
    caption: string,
    sub: Sub,
    decision: EdgeDecision | null = null,
  ): void =>
    tb.push({
      edgeIndex,
      consideredEdgeId,
      decision,
      lines,
      caption,
      mstEdgeIds: [...mst],
      sub,
    })

  emit([2], t("play.nHpInit"), { kind: "init" })

  for (let idx = 0; idx < edges.length; idx++) {
    const e = edges[idx]
    edgeIndex = idx
    consideredEdgeId = e.id
    considered++

    emit([3], t("play.nConsider", { edge: edgeLabel(e), w: e.weight }), {
      kind: "consider",
      edgeId: e.id,
    })

    // BFS: чи вже існує шлях e.u → e.v у лісі?
    let connected = false
    const seen = new Set<Vertex>([e.u])
    const queue: Vertex[] = [e.u]
    while (queue.length > 0) {
      const v = queue.shift()!
      if (v === e.v) {
        connected = true
        emit([16], t("play.nBfsReached", { v: e.v }), {
          kind: "bfs-visit",
          at: v,
          frontier: [...queue],
          visited: [...seen],
        })
        break
      }
      for (const nb of adj.get(v) ?? []) {
        if (!seen.has(nb)) {
          seen.add(nb)
          queue.push(nb)
        }
      }
      emit([15, 17, 18], t("play.nBfsVisit", { v, frontier: queue.join(", ") }), {
        kind: "bfs-visit",
        at: v,
        frontier: [...queue],
        visited: [...seen],
      })
    }
    if (!connected) {
      emit([20], t("play.nBfsExhausted"), {
        kind: "bfs-exhausted",
        visited: [...seen],
      })
    }

    if (connected) {
      emit(
        [5],
        t("play.nHpCycle", { u: e.u, v: e.v }),
        { kind: "reject-cycle", edgeId: e.id },
        "reject",
      )
      continue
    }

    mst.push(e.id)
    weight += e.weight
    adj.get(e.u)!.push(e.v)
    adj.get(e.v)!.push(e.u)
    emit(
      [6],
      t("play.nHpAccept", { edge: edgeLabel(e), w: weight }),
      { kind: "accept", edgeId: e.id },
      "accept",
    )

    if (mst.length === need) {
      emit([7], t("play.nDone", { need }), { kind: "done" })
      break
    }
  }

  const result: MstResult = {
    algo: "hasPath",
    mstEdgeIds: [...mst],
    totalWeight: weight,
    isSpanning: mst.length === need,
    componentCount: n - mst.length,
    consideredCount: considered,
  }
  return { result, trace: tb.build(result) }
}
