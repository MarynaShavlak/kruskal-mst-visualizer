import { describe, it, expect } from "vitest"
import { buildGraph, type Graph } from "@/lib/graph"
import { primMstLazy, primMstEager } from "@/lib/prim"
import { buildPrimTrace } from "@/lib/primTrace"
import { kruskalDsu } from "@/lib/kruskalDsu"
import { randomGraph } from "@/lib/randomGraph"
import {
  referenceGraph,
  REFERENCE_MST_EDGE_IDS,
  REFERENCE_MST_WEIGHT,
} from "@/lib/exampleGraph"

const sortedIds = (ids: readonly string[]): string[] => [...ids].sort()

// Граф `A–F` із прикладу 1 README (6 вершин, 6 ребер); МОД = 11, відкинуто C–D(7).
function graphAF(): Graph {
  return buildGraph([
    ["A", "B", 3],
    ["B", "C", 1],
    ["C", "D", 7],
    ["C", "F", 2],
    ["D", "E", 2],
    ["E", "F", 3],
  ])
}

describe("Прим проти еталона (CLAUDE.md, граф A–G)", () => {
  it("лінива версія дає МОД вагою 39 з очікуваними ребрами", () => {
    const r = primMstLazy(referenceGraph())
    expect(r.totalWeight).toBe(REFERENCE_MST_WEIGHT)
    expect(sortedIds(r.mstEdgeIds)).toEqual([...REFERENCE_MST_EDGE_IDS])
    expect(r.mstEdgeIds).toHaveLength(6)
    expect(r.isSpanning).toBe(true)
  })

  it("точний порядок прийняття ребер (Прим росте від A — інший, ніж у Краскала)", () => {
    const r = primMstLazy(referenceGraph())
    expect(r.mstEdgeIds).toEqual(["A|D", "D|F", "A|B", "B|E", "C|E", "E|G"])
    expect(r.order).toEqual(["A", "D", "F", "B", "E", "C", "G"])
  })

  it("ліниве видалення: рівно 3 застарілі ребра поспіль (кроки 6–8)", () => {
    const r = primMstLazy(referenceGraph())
    expect(r.poppedCount).toBe(9)
    expect(r.staleCount).toBe(3)
  })
})

describe("Прим на графі A–F (приклад 1 README)", () => {
  it("МОД вагою 11; відкинуто найважче ребро циклу C–D(7)", () => {
    const r = primMstLazy(graphAF())
    expect(r.totalWeight).toBe(11)
    expect(r.mstEdgeIds).toEqual(["A|B", "B|C", "C|F", "E|F", "D|E"])
    expect(r.mstEdgeIds).not.toContain("C|D")
    expect(r.staleCount).toBe(0)
  })
})

describe("лінива та eager версії ОБОВ'ЯЗКОВО дають той самий результат", () => {
  it("на еталоні (той самий набір ребер і вага)", () => {
    const lazy = primMstLazy(referenceGraph())
    const eager = primMstEager(referenceGraph())
    expect(eager.totalWeight).toBe(lazy.totalWeight)
    expect(sortedIds(eager.mstEdgeIds)).toEqual(sortedIds(lazy.mstEdgeIds))
  })

  it("на графі A–F", () => {
    const lazy = primMstLazy(graphAF())
    const eager = primMstEager(graphAF())
    expect(eager.totalWeight).toBe(lazy.totalWeight)
    expect(sortedIds(eager.mstEdgeIds)).toEqual(sortedIds(lazy.mstEdgeIds))
  })

  it("на 50 випадкових зв'язних графах — однакова вага, n-1 ребер", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const g = randomGraph({ vertexCount: 8, seed, extraEdgeProb: 0.45 })
      const lazy = primMstLazy(g)
      const eager = primMstEager(g)
      expect(lazy.isSpanning).toBe(true)
      expect(lazy.mstEdgeIds).toHaveLength(7)
      expect(eager.totalWeight).toBe(lazy.totalWeight)
    }
  })
})

describe("Прим і Краскал дають ту саму вагу МОД (різний шлях)", () => {
  it("на еталоні — обидва 39", () => {
    expect(primMstLazy(referenceGraph()).totalWeight).toBe(
      kruskalDsu(referenceGraph()).result.totalWeight,
    )
  })

  it("на 50 випадкових зв'язних графах — вага збігається", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const g = randomGraph({ vertexCount: 8, seed, extraEdgeProb: 0.45 })
      expect(primMstLazy(g).totalWeight).toBe(kruskalDsu(g).result.totalWeight)
    }
  })
})

describe("вага МОД не залежить від стартової вершини", () => {
  it("будь-який старт на еталоні дає 39", () => {
    for (const v of referenceGraph().vertices) {
      expect(primMstLazy(referenceGraph(), v).totalWeight).toBe(REFERENCE_MST_WEIGHT)
    }
  })
})

describe("незв'язний граф: лінива версія НЕ «вибухає», а зупиняється", () => {
  it("охоплює лише компоненту старту, isSpanning=false", () => {
    const g = buildGraph([
      ["A", "B", 1],
      ["B", "C", 2],
      ["D", "E", 3],
    ])
    const r = primMstLazy(g, "A")
    expect(r.isSpanning).toBe(false)
    expect(r.totalWeight).toBe(3)
    expect(sortedIds(r.mstEdgeIds)).toEqual(["A|B", "B|C"])
    expect([...r.order].sort()).toEqual(["A", "B", "C"])
  })
})

describe("trace (buildPrimTrace)", () => {
  it("результат trace збігається з primMstLazy", () => {
    const lazy = primMstLazy(referenceGraph())
    const { result } = buildPrimTrace(referenceGraph())
    expect(result.mstEdgeIds).toEqual(lazy.mstEdgeIds)
    expect(result.totalWeight).toBe(lazy.totalWeight)
    expect(result.isSpanning).toBe(lazy.isSpanning)
    expect(result.staleCount).toBe(lazy.staleCount)
  })

  it("перший кадр — init, останній — done з підсумковою МОД", () => {
    const { trace, result } = buildPrimTrace(referenceGraph())
    expect(trace.frames[0].sub.kind).toBe("init")
    const last = trace.frames[trace.frames.length - 1]
    expect(last.sub.kind).toBe("done")
    expect(last.mstEdgeIds).toEqual(result.mstEdgeIds)
  })

  it("кількість skip-кадрів дорівнює staleCount", () => {
    const { trace, result } = buildPrimTrace(referenceGraph())
    const skips = trace.frames.filter((f) => f.sub.kind === "skip")
    expect(skips).toHaveLength(result.staleCount)
  })

  it("accept-кадри відповідають підсумковим ребрам МОД (у порядку)", () => {
    const { trace, result } = buildPrimTrace(referenceGraph())
    const accepted = trace.frames
      .filter((f) => f.sub.kind === "accept")
      .map((f) => f.popped?.id)
    expect(accepted).toEqual([...result.mstEdgeIds])
  })

  it("черга кожного кадру відсортована за пріоритетом зняття", () => {
    const { trace } = buildPrimTrace(referenceGraph())
    for (const f of trace.frames) {
      for (let i = 1; i < f.queue.length; i++) {
        const a = f.queue[i - 1]
        const b = f.queue[i]
        const less =
          a.weight < b.weight ||
          (a.weight === b.weight && a.from < b.from) ||
          (a.weight === b.weight && a.from === b.from && a.to <= b.to)
        expect(less).toBe(true)
      }
    }
  })

  it("init: у чергу лягли обидва ребра старт-вершини A, відсортовані (5,A,D),(7,A,B)", () => {
    const { trace } = buildPrimTrace(referenceGraph())
    const init = trace.frames[0]
    expect(init.queue.map((e) => e.id)).toEqual(["A|D", "A|B"])
    expect(init.addedVertex).toBe("A")
  })

  it("lines кожного кадру — валідні індекси у code", () => {
    const { trace } = buildPrimTrace(referenceGraph())
    for (const f of trace.frames) {
      for (const ln of f.lines) {
        expect(ln).toBeGreaterThanOrEqual(1)
        expect(ln).toBeLessThanOrEqual(trace.code.length)
      }
    }
  })

  it("порожній граф: один кадр done, без помилок", () => {
    const { trace, result } = buildPrimTrace(buildGraph([]))
    expect(trace.frames).toHaveLength(1)
    expect(trace.frames[0].sub.kind).toBe("done")
    expect(result.isSpanning).toBe(true)
    expect(result.mstEdgeIds).toHaveLength(0)
  })
})
