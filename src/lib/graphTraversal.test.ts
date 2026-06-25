import { describe, it, expect } from "vitest"
import { buildGraph } from "@/lib/graph"
import {
  buildTraversalTrace,
  sortedNeighbors,
  traverse,
} from "@/lib/graphTraversal"

// Еталонний граф із README (вага не важлива для обходу — всі = 1):
// A:[B,C], B:[A,D,E], C:[A,F], D:[B], E:[B,F], F:[C,E]
const example = buildGraph([
  ["A", "B", 1],
  ["A", "C", 1],
  ["B", "D", 1],
  ["B", "E", 1],
  ["C", "F", 1],
  ["E", "F", 1],
])

describe("graphTraversal — обхід", () => {
  it("BFS дає еталонний порядок A B C D E F", () => {
    const r = traverse(example, "bfs", "A")
    expect(r.order).toEqual(["A", "B", "C", "D", "E", "F"])
    expect(r.visitedCount).toBe(6)
    expect(r.isConnected).toBe(true)
    expect(r.treeEdgeIds).toHaveLength(5) // остовне дерево обходу: n−1
  })

  it("DFS дає еталонний порядок A B D E F C", () => {
    const r = traverse(example, "dfs", "A")
    expect(r.order).toEqual(["A", "B", "D", "E", "F", "C"])
    expect(r.visitedCount).toBe(6)
    expect(r.isConnected).toBe(true)
    expect(r.treeEdgeIds).toHaveLength(5)
  })

  it("стартова вершина за замовчуванням — лексикографічно найменша", () => {
    expect(traverse(example, "bfs").start).toBe("A")
    expect(traverse(example, "dfs").order[0]).toBe("A")
  })

  it("сусіди впорядковані лексикографічно", () => {
    expect(sortedNeighbors(example, "B")).toEqual(["A", "D", "E"])
  })

  it("незв'язний граф: обхід однієї компоненти, isConnected=false", () => {
    const islands = buildGraph([
      ["A", "B", 1],
      ["C", "D", 1],
    ])
    const r = traverse(islands, "bfs", "A")
    expect(r.order).toEqual(["A", "B"])
    expect(r.isConnected).toBe(false)
    expect(r.visitedCount).toBe(2)
    expect(r.vertexCount).toBe(4)
  })

  it("порожній граф не падає", () => {
    const r = traverse(buildGraph([]), "bfs")
    expect(r.order).toEqual([])
    expect(r.isConnected).toBe(true)
  })
})

describe("graphTraversal — trace", () => {
  for (const strategy of ["bfs", "dfs"] as const) {
    it(`${strategy}: останній кадр повторює порядок прогону`, () => {
      const run = traverse(example, strategy, "A")
      const { trace } = buildTraversalTrace(example, strategy, "A")
      const last = trace.frames[trace.frames.length - 1]
      expect(last.sub).toBe("done")
      expect(last.order).toEqual(run.order)
      expect(trace.result.order).toEqual(run.order)
    })

    it(`${strategy}: перший кадр — ініціалізація з фронтиром {start}`, () => {
      const { trace } = buildTraversalTrace(example, strategy, "A")
      expect(trace.frames[0].sub).toBe("init")
      expect(trace.frames[0].frontier).toEqual(["A"])
    })

    it(`${strategy}: кожна вершина має кадр visit`, () => {
      const { trace } = buildTraversalTrace(example, strategy, "A")
      const visitedVertices = trace.frames
        .filter((f) => f.sub === "visit")
        .map((f) => f.current)
      expect(new Set(visitedVertices)).toEqual(
        new Set(["A", "B", "C", "D", "E", "F"]),
      )
    })
  }

  it("trace порожнього графа дає один кадр done", () => {
    const { trace } = buildTraversalTrace(buildGraph([]), "dfs")
    expect(trace.frames).toHaveLength(1)
    expect(trace.frames[0].sub).toBe("done")
  })
})
