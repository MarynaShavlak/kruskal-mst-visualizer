import { describe, it, expect } from "vitest"
import { buildGraph } from "@/lib/graph"
import { kruskalDsu } from "@/lib/kruskalDsu"
import { kruskalHasPath } from "@/lib/kruskalHasPath"
import { randomGraph } from "@/lib/randomGraph"
import {
  referenceGraph,
  REFERENCE_MST_EDGE_IDS,
  REFERENCE_MST_WEIGHT,
} from "@/lib/__fixtures__/reference-graph"

const sortedIds = (ids: readonly string[]): string[] => [...ids].sort()

describe("Краскал проти еталона (CLAUDE.md)", () => {
  it("DSU дає МОД вагою 39 з очікуваними ребрами", () => {
    const { result } = kruskalDsu(referenceGraph())
    expect(result.totalWeight).toBe(REFERENCE_MST_WEIGHT)
    expect(sortedIds(result.mstEdgeIds)).toEqual([...REFERENCE_MST_EDGE_IDS])
    expect(result.mstEdgeIds).toHaveLength(6)
    expect(result.isSpanning).toBe(true)
    expect(result.componentCount).toBe(1)
  })

  it("has-path дає таку саму МОД", () => {
    const { result } = kruskalHasPath(referenceGraph())
    expect(result.totalWeight).toBe(REFERENCE_MST_WEIGHT)
    expect(sortedIds(result.mstEdgeIds)).toEqual([...REFERENCE_MST_EDGE_IDS])
  })

  it("точний порядок прийняття ребер у DSU відповідає Краскалу", () => {
    const { result } = kruskalDsu(referenceGraph())
    expect(result.mstEdgeIds).toEqual([
      "A|D",
      "C|E",
      "D|F",
      "A|B",
      "B|E",
      "E|G",
    ])
  })
})

describe("обидві реалізації ОБОВ'ЯЗКОВО ідентичні", () => {
  it("на еталоні (той самий порядок прийняття і вага)", () => {
    const a = kruskalDsu(referenceGraph()).result
    const b = kruskalHasPath(referenceGraph()).result
    expect(b.mstEdgeIds).toEqual(a.mstEdgeIds)
    expect(b.totalWeight).toBe(a.totalWeight)
  })

  it("на 50 випадкових зв'язних графах", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const g = randomGraph({ vertexCount: 8, seed, extraEdgeProb: 0.45 })
      const a = kruskalDsu(g).result
      const b = kruskalHasPath(g).result
      expect(b.mstEdgeIds).toEqual(a.mstEdgeIds)
      expect(b.totalWeight).toBe(a.totalWeight)
      expect(a.isSpanning).toBe(true)
      expect(a.mstEdgeIds).toHaveLength(7) // зв'язний ⇒ n-1 = 7 ребер
    }
  })

  it("на незв'язному графі — ліс, не остов", () => {
    const g = buildGraph([
      ["A", "B", 1],
      ["B", "C", 2],
      ["D", "E", 3],
    ])
    const a = kruskalDsu(g).result
    const b = kruskalHasPath(g).result
    expect(a.isSpanning).toBe(false)
    expect(a.componentCount).toBe(2)
    expect(b.componentCount).toBe(2)
    expect(sortedIds(a.mstEdgeIds)).toEqual(sortedIds(b.mstEdgeIds))
    expect(a.totalWeight).toBe(b.totalWeight)
  })
})

describe("trace", () => {
  it("перший кадр — init, останній містить підсумкову МОД", () => {
    const { trace, result } = kruskalDsu(referenceGraph())
    expect(trace.frames[0].sub.kind).toBe("init")
    const last = trace.frames[trace.frames.length - 1]
    expect(last.mstEdgeIds).toEqual(result.mstEdgeIds)
  })

  it("DSU-trace містить підкроки find та union", () => {
    const kinds = new Set(
      kruskalDsu(referenceGraph()).trace.frames.map((f) => f.sub.kind),
    )
    expect(kinds.has("consider")).toBe(true)
    expect(kinds.has("dsu-find")).toBe(true)
    expect(kinds.has("dsu-union")).toBe(true)
    expect(kinds.has("reject-cycle")).toBe(true)
  })

  it("has-path trace містить BFS-підкроки", () => {
    const kinds = new Set(
      kruskalHasPath(referenceGraph()).trace.frames.map((f) => f.sub.kind),
    )
    expect(kinds.has("bfs-visit")).toBe(true)
    expect(kinds.has("accept")).toBe(true)
    expect(kinds.has("reject-cycle")).toBe(true)
  })

  it("кожен DSU-кадр має знімок dsu; індекс ребра не спадає", () => {
    const { trace } = kruskalDsu(referenceGraph())
    let prev = -1
    for (const f of trace.frames) {
      expect(f.dsu).toBeDefined()
      if (f.edgeIndex >= 0) {
        expect(f.edgeIndex).toBeGreaterThanOrEqual(prev)
        prev = f.edgeIndex
      }
    }
  })

  it("кадри прийняття відповідають підсумковим ребрам МОД", () => {
    const { trace, result } = kruskalHasPath(referenceGraph())
    const accepted = trace.frames
      .filter((f) => f.decision === "accept")
      .map((f) => f.consideredEdgeId)
    expect(accepted).toEqual([...result.mstEdgeIds])
  })

  it("lines кадрів — валідні індекси у code", () => {
    const { trace } = kruskalDsu(referenceGraph())
    for (const f of trace.frames) {
      for (const ln of f.lines) {
        expect(ln).toBeGreaterThanOrEqual(1)
        expect(ln).toBeLessThanOrEqual(trace.code.length)
      }
    }
  })
})
