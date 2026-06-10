import { describe, it, expect } from "vitest"
import { bruteForceTsp, countRoutes } from "@/lib/tspBruteForce"
import { tourLength } from "@/lib/tsp"
import {
  TSP_DEMO_OPTIMAL_LENGTH,
  TSP_DEMO_OPTIMAL_TOUR,
  tspDemoMatrix,
} from "@/lib/exampleTsp"

describe("bruteForceTsp проти еталона", () => {
  it("демо A–E: довжина ≈ 16.75 і тур A→C→B→D→E→A", () => {
    const m = tspDemoMatrix()
    const { cost, path } = bruteForceTsp(m)
    expect(cost).toBeCloseTo(TSP_DEMO_OPTIMAL_LENGTH, 9)
    expect(path).toEqual(TSP_DEMO_OPTIMAL_TOUR)
    expect(tourLength(path.slice(0, -1), m)).toBeCloseTo(cost, 9)
  })

  it("трикутник із будь-якого старту дає той самий периметр", () => {
    const m = [
      [0, 3, 4],
      [3, 0, 5],
      [4, 5, 0],
    ]
    expect(bruteForceTsp(m, 0).cost).toBeCloseTo(12, 12)
    expect(bruteForceTsp(m, 1).cost).toBeCloseTo(12, 12)
    expect(bruteForceTsp(m, 2).cost).toBeCloseTo(12, 12)
  })
})

describe("countRoutes", () => {
  it("(n−1)! замкнених маршрутів: 5 міст → 24, 3 → 2", () => {
    expect(countRoutes(5)).toBe(24)
    expect(countRoutes(3)).toBe(2)
    expect(countRoutes(1)).toBe(1)
  })
})
