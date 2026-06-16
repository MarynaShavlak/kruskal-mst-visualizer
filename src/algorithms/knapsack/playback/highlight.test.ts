import { describe, it, expect } from "vitest"
import {
  backtrackPath,
  cellSources,
  dpLinear,
} from "@/algorithms/knapsack/playback/highlight"
import { knapsackDpTable } from "@/lib/knapsack"
import { KNAPSACK_SMALL, arrays } from "@/lib/exampleKnapsack"

describe("dpLinear", () => {
  it("row-major індекс", () => {
    expect(dpLinear(0, 0, 5)).toBe(0)
    expect(dpLinear(1, 0, 5)).toBe(5)
    expect(dpLinear(3, 4, 5)).toBe(19)
  })
})

describe("cellSources", () => {
  const weights = [1, 2, 3]
  it("обидва джерела, коли предмет вміщається", () => {
    expect(cellSources(3, 4, weights)).toEqual({ skip: [2, 4], take: [2, 1] })
    expect(cellSources(3, 3, weights)).toEqual({ skip: [2, 3], take: [2, 0] })
  })
  it("лише «не брати», коли предмет не вміщається", () => {
    expect(cellSources(1, 0, weights)).toEqual({ skip: [0, 0], take: null })
  })
  it("рядок 0 — джерел немає", () => {
    expect(cellSources(0, 3, weights)).toEqual({ skip: null, take: null })
  })
})

describe("backtrackPath", () => {
  it("малий інстанс: бере П3 (i=3), пропускає П2, бере П1", () => {
    const { weights, values } = arrays(KNAPSACK_SMALL)
    const table = knapsackDpTable(weights, values, KNAPSACK_SMALL.capacity)
    const path = backtrackPath(table, weights, KNAPSACK_SMALL.capacity)
    expect(path).toEqual([
      { i: 3, w: 4, taken: true },
      { i: 2, w: 1, taken: false },
      { i: 1, w: 1, taken: true },
    ])
    // Узяті предмети (i−1), за зростанням
    const taken = path.filter((s) => s.taken).map((s) => s.i - 1).sort((a, b) => a - b)
    expect(taken).toEqual([0, 2])
  })
})
