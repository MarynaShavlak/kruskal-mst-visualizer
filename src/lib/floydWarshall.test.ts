import { describe, it, expect } from "vitest"
import {
  INF,
  type Matrix,
  type ReadonlyMatrix,
  adjacencyToInf,
  floydWarshall,
  floydWarshallSteps,
  hasNegativeCycle,
  reconstructPath,
  stepsFromDist,
} from "@/lib/floydWarshall"
import { toDistMatrix } from "@/lib/directedGraph"
import {
  ABCDEF_REFERENCE_DIST,
  PQRS_REFERENCE_DIST,
  abcdefGraph,
  pqrsGraph,
  xyzGraph,
} from "@/lib/exampleDirectedGraph"

// Матриця суміжності A–F в угоді «0 == немає ребра» (як у test_core.py).
const ABCDEF_ADJ0: ReadonlyMatrix = [
  [0, 3, 0, 0, 0, 0],
  [0, 0, 1, 0, 0, 0],
  [0, 0, 0, 7, 0, 2],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 2, 0, 3],
  [0, 0, 0, 0, 0, 0],
]

// Список ребер -> матриця відстаней в угоді INF (0 на діагоналі).
function edgesToInf(
  n: number,
  edges: ReadonlyArray<readonly [number, number, number]>,
): Matrix {
  const dist: Matrix = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 0 : INF)),
  )
  for (const [u, v, w] of edges) dist[u][v] = w
  return dist
}

const PQRS_EDGES_IDX: ReadonlyArray<readonly [number, number, number]> = [
  [0, 1, 4],
  [1, 2, -2],
  [2, 3, 3],
  [0, 3, 10],
]

describe("Флойд–Воршал проти еталона (README)", () => {
  it("додатні ваги: підсумкова матриця A–F збігається з README", () => {
    const got = floydWarshall(toDistMatrix(abcdefGraph()).dist)
    expect(got).toEqual(ABCDEF_REFERENCE_DIST)
  })

  it("від'ємне ребро: підсумкова матриця P–S збігається з README", () => {
    const got = floydWarshall(toDistMatrix(pqrsGraph()).dist)
    expect(got).toEqual(PQRS_REFERENCE_DIST)
    // пряме ребро P→S=10 програє шляху P→Q→R→S=5 (ефект від'ємного ребра)
    expect(got[0][3]).toBe(5)
  })

  it("ребро нульової ваги зберігається, а не трактується як «немає ребра»", () => {
    // 0 →(0)→ 1 →(5)→ 2 ; нульове ребро не має «загубитись»
    const adj: ReadonlyMatrix = [
      [0, 0, INF],
      [INF, 0, 5],
      [INF, INF, 0],
    ]
    const dist = floydWarshall(adj)
    expect(dist[0][1]).toBe(0) // пряме ребро нульової ваги
    expect(dist[0][2]).toBe(5) // 0 → 1 → 2 = 0 + 5
  })
})

describe("floydWarshallSteps / stepsFromDist", () => {
  it("відомі відстані A–F (інструментована версія)", () => {
    const { dist } = floydWarshallSteps(ABCDEF_ADJ0)
    expect(dist[0][3]).toBe(11) // A → D
    expect(dist[0][5]).toBe(6) // A → F
    expect(dist[0][2]).toBe(4) // A → C
    expect(dist[3][0]).toBe(INF) // D — стік, з нього шляху в A немає
  })

  it("кількість знімків = n + 1; перший знімок має k = null", () => {
    const adj: ReadonlyMatrix = [
      [0, 3, 0],
      [0, 0, 1],
      [0, 0, 0],
    ]
    const { snapshots } = floydWarshallSteps(adj)
    expect(snapshots).toHaveLength(adj.length + 1)
    expect(snapshots[0].k).toBeNull()
    expect(snapshots[0].changed).toEqual([])
  })

  it("stepsFromDist дає ту саму dist, що й компактна floydWarshall", () => {
    const adjInf = toDistMatrix(pqrsGraph()).dist
    expect(stepsFromDist(adjInf).dist).toEqual(floydWarshall(adjInf))
  })

  it("знімки лише покращують відстані (монотонність релаксації)", () => {
    const { snapshots } = floydWarshallSteps(ABCDEF_ADJ0)
    for (let s = 1; s < snapshots.length; s++) {
      const prev = snapshots[s - 1].matrix
      const cur = snapshots[s].matrix
      for (let i = 0; i < cur.length; i++) {
        for (let j = 0; j < cur.length; j++) {
          expect(cur[i][j]).toBeLessThanOrEqual(prev[i][j])
        }
      }
    }
  })
})

describe("reconstructPath", () => {
  it("розгортає A → B → C → D у графі A–F", () => {
    const { nxt } = stepsFromDist(toDistMatrix(abcdefGraph()).dist)
    expect(reconstructPath(nxt, 0, 3)).toEqual([0, 1, 2, 3]) // A→B→C→D
    expect(reconstructPath(nxt, 0, 0)).toEqual([0]) // тривіальний шлях у себе
    expect(reconstructPath(nxt, 3, 0)).toBeNull() // шляху не існує
  })

  it("розгортає P → Q → R → S (через від'ємне ребро)", () => {
    const { nxt } = stepsFromDist(toDistMatrix(pqrsGraph()).dist)
    expect(reconstructPath(nxt, 0, 3)).toEqual([0, 1, 2, 3]) // P→Q→R→S
    expect(reconstructPath(nxt, 0, 2)).toEqual([0, 1, 2]) // P→Q→R
  })

  it("прохід через від'ємний цикл кидає помилку, а не зациклюється", () => {
    // цикл 0→1→2→0 (усі −1) плюс ребро 2→3: маршрут у вершину 3 нескінченно петляє
    const g: ReadonlyMatrix = [
      [0, -1, 0, 0],
      [0, 0, -1, 0],
      [-1, 0, 0, 1],
      [0, 0, 0, 0],
    ]
    const { nxt } = floydWarshallSteps(g)
    expect(() => reconstructPath(nxt, 0, 3)).toThrow(/від'ємний цикл/)
  })
})

describe("hasNegativeCycle", () => {
  it("виявляє від'ємний цикл (X→Y→Z→X, усі −1)", () => {
    const { dist } = stepsFromDist(toDistMatrix(xyzGraph()).dist)
    expect(hasNegativeCycle(dist)).toBe(true)
  })

  it("на нормальному графі з від'ємним ребром циклу немає", () => {
    const dist = floydWarshall(edgesToInf(4, PQRS_EDGES_IDX))
    expect(hasNegativeCycle(dist)).toBe(false)
  })
})

describe("adjacencyToInf", () => {
  it("0-угоду переводить в INF-угоду", () => {
    const dist = adjacencyToInf([
      [0, 3, 0],
      [0, 0, 1],
      [0, 0, 0],
    ])
    expect(dist[0][0]).toBe(0) // діагональ
    expect(dist[0][1]).toBe(3) // наявне ребро
    expect(dist[0][2]).toBe(INF) // відсутнє ребро
  })
})
