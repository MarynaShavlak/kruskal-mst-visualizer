// Основний Краскал на DSU (union-by-rank + path compression).
// Проганяється один раз і пише trace з підкроками: find-підйом, стиснення, union.

import { DSU, type DsuOptions } from "@/lib/dsu"
import { sortedEdges, type Edge, type Graph } from "@/lib/graph"
import {
  TraceBuilder,
  type EdgeDecision,
  type KruskalRun,
  type MstResult,
  type Sub,
} from "@/lib/trace"

/** Лістинг для панелі підсвітки (рядки 1-based). */
export const KRUSKAL_DSU_CODE: readonly string[] = [
  "function kruskalDSU(graph) {",
  "  const dsu = new DSU(graph.vertices)",
  "  const mst = []",
  "  for (const e of sortByWeight(graph.edges)) {",
  "    const ru = dsu.find(e.u)",
  "    const rv = dsu.find(e.v)",
  "    if (ru === rv) continue          // цикл",
  "    dsu.union(ru, rv)                // різні дерева",
  "    mst.push(e)",
  "    if (mst.length === graph.vertices.length - 1) break",
  "  }",
  "  return mst",
  "}",
]

const edgeLabel = (e: Edge): string => `${e.u}–${e.v}`

export function kruskalDsu(graph: Graph, options?: DsuOptions): KruskalRun {
  const edges = sortedEdges(graph)
  const dsu = new DSU(graph.vertices, options)
  const tb = new TraceBuilder(
    "dsu",
    KRUSKAL_DSU_CODE,
    edges.map((e) => e.id),
  )

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
      dsu: dsu.snapshot(),
      dsuStats: dsu.stats,
    })

  emit(
    [2, 3],
    "Ініціалізація: кожна вершина — окрема множина (DSU), МОД порожня.",
    { kind: "init" },
  )

  for (let idx = 0; idx < edges.length; idx++) {
    const e = edges[idx]
    edgeIndex = idx
    consideredEdgeId = e.id
    considered++

    emit([4], `Розглядаємо ребро ${edgeLabel(e)} (вага ${e.weight}).`, {
      kind: "consider",
      edgeId: e.id,
    })

    const fu = dsu.find(e.u)
    emit([5], `find(${e.u}): підйом ${fu.path.join(" → ")}; корінь ${fu.root}.`, {
      kind: "dsu-find",
      vertex: e.u,
      path: fu.path,
      root: fu.root,
    })
    if (fu.compressed.length > 0) {
      emit([5], `Стиснення шляху: ${fu.compressed.join(", ")} → ${fu.root}.`, {
        kind: "dsu-compress",
        vertex: e.u,
        changed: fu.compressed,
        root: fu.root,
      })
    }

    const fv = dsu.find(e.v)
    emit([6], `find(${e.v}): підйом ${fv.path.join(" → ")}; корінь ${fv.root}.`, {
      kind: "dsu-find",
      vertex: e.v,
      path: fv.path,
      root: fv.root,
    })
    if (fv.compressed.length > 0) {
      emit([6], `Стиснення шляху: ${fv.compressed.join(", ")} → ${fv.root}.`, {
        kind: "dsu-compress",
        vertex: e.v,
        changed: fv.compressed,
        root: fv.root,
      })
    }

    if (fu.root === fv.root) {
      emit(
        [7],
        `${e.u} і ${e.v} в одній множині (корінь ${fu.root}) — цикл, пропускаємо.`,
        { kind: "reject-cycle", edgeId: e.id },
        "reject",
      )
      continue
    }

    const ur = dsu.union(e.u, e.v)
    emit(
      [8],
      `Різні множини — обʼєднуємо ${ur.rootX} та ${ur.rootY} → корінь ${ur.root}${
        ur.rankIncreased ? `; ранг ${ur.root}↑` : ""
      }.`,
      { kind: "dsu-union", rootX: ur.rootX, rootY: ur.rootY, newRoot: ur.root },
    )

    mst.push(e.id)
    weight += e.weight
    emit(
      [9],
      `Додаємо ${edgeLabel(e)} до МОД (вага ${weight}).`,
      { kind: "accept", edgeId: e.id },
      "accept",
    )

    if (mst.length === need) {
      emit([10], `Зібрано ${need} ребер — остовне дерево готове.`, {
        kind: "done",
      })
      break
    }
  }

  const result: MstResult = {
    algo: "dsu",
    mstEdgeIds: [...mst],
    totalWeight: weight,
    isSpanning: mst.length === need,
    componentCount: dsu.componentCount(),
    consideredCount: considered,
    dsuStats: dsu.stats,
  }
  return { result, trace: tb.build(result) }
}
