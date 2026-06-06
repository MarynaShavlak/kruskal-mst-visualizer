import { describe, it, expect } from "vitest"
import { referenceGraph, REFERENCE_MST_WEIGHT } from "@/lib/exampleGraph"
import { kruskalDsu } from "@/lib/kruskalDsu"
import {
  kruskalDsuCompute,
  kruskalHasPathCompute,
} from "@/lib/kruskalCompute"
import { randomGraph } from "@/lib/randomGraph"

const sortedIds = (ids: readonly string[]): string[] => [...ids].sort()

describe("compute-only варіанти", () => {
  it("DSU compute дає еталонну МОД (вага 39)", () => {
    expect(kruskalDsuCompute(referenceGraph()).totalWeight).toBe(
      REFERENCE_MST_WEIGHT,
    )
  })

  it("compute збігається з traced-версією на 30 випадкових графах", () => {
    for (let seed = 1; seed <= 30; seed++) {
      const g = randomGraph({ vertexCount: 9, seed, extraEdgeProb: 0.4 })
      const traced = kruskalDsu(g).result
      const dsuC = kruskalDsuCompute(g)
      const hpC = kruskalHasPathCompute(g)
      expect(dsuC.totalWeight).toBe(traced.totalWeight)
      expect(hpC.totalWeight).toBe(traced.totalWeight)
      expect(sortedIds(dsuC.mstEdgeIds)).toEqual(sortedIds(traced.mstEdgeIds))
      expect(sortedIds(hpC.mstEdgeIds)).toEqual(sortedIds(dsuC.mstEdgeIds))
    }
  })
})
