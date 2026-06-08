import { describe, it, expect } from "vitest"
import { referenceGraph, REFERENCE_MST_EDGE_IDS } from "@/lib/exampleGraph"
import { maxWeightEdgeId, mstCycle } from "@/algorithms/kruskal/learn/proof-logic"

describe("mstCycle", () => {
  it("B–C замикає цикл B–C, B–E, C–E", () => {
    const g = referenceGraph()
    const mst = new Set(REFERENCE_MST_EDGE_IDS)
    const cycle = mstCycle(g, mst, "B|C")
    expect([...cycle].sort()).toEqual(["B|C", "B|E", "C|E"])
  })

  it("найважче деревне ребро циклу B–C — це B–E (7)", () => {
    const g = referenceGraph()
    const mst = new Set(REFERENCE_MST_EDGE_IDS)
    const cycle = mstCycle(g, mst, "B|C")
    const treeEdges = [...cycle].filter((id) => mst.has(id))
    expect(maxWeightEdgeId(g, treeEdges)).toBe("B|E")
  })

  it("обране ребро завжди найважче у своєму циклі (властивість МОД)", () => {
    const g = referenceGraph()
    const mst = new Set(REFERENCE_MST_EDGE_IDS)
    const byId = new Map(g.edges.map((e) => [e.id, e]))
    for (const e of g.edges) {
      if (mst.has(e.id)) continue
      const cycle = mstCycle(g, mst, e.id)
      const heaviest = maxWeightEdgeId(g, cycle)
      expect(byId.get(heaviest!)!.weight).toBe(e.weight) // обране — найважче
    }
  })
})
