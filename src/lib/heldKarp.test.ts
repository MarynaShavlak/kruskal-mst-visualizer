import { describe, it, expect } from "vitest"
import { heldKarp } from "@/lib/heldKarp"
import { bruteForceTsp } from "@/lib/tspBruteForce"
import { distanceMatrix, tourLength } from "@/lib/tsp"
import {
  TSP_DEMO_CITIES,
  TSP_DEMO_OPTIMAL_LENGTH,
  TSP_DEMO_OPTIMAL_TOUR,
  tspDemoMatrix,
} from "@/lib/exampleTsp"

describe("heldKarp проти еталона (README)", () => {
  it("демо A–E: довжина ≈ 16.75 і тур A→C→B→D→E→A", () => {
    const { cost, path } = heldKarp(tspDemoMatrix())
    expect(cost).toBeCloseTo(TSP_DEMO_OPTIMAL_LENGTH, 9)
    expect(path).toEqual(TSP_DEMO_OPTIMAL_TOUR)
    expect(path[0]).toBe(0)
    expect(path[path.length - 1]).toBe(0) // замкнений маршрут
  })

  it("трикутник 3-4-5: периметр 12, маршрут замкнений", () => {
    const matrix = [
      [0, 3, 4],
      [3, 0, 5],
      [4, 5, 0],
    ]
    const { cost, path } = heldKarp(matrix)
    expect(cost).toBeCloseTo(12, 12)
    expect(path[0]).toBe(0)
    expect(path[path.length - 1]).toBe(0)
  })

  it("обидва методи (перебір і ДП) дають той самий оптимум", () => {
    const m = tspDemoMatrix()
    const hk = heldKarp(m)
    const bf = bruteForceTsp(m)
    expect(hk.cost).toBeCloseTo(bf.cost, 12)
    expect(hk.path).toEqual(bf.path) // спільний tie-break ⇒ ідентичний тур
  })

  it("довжина оптимального ЦИКЛУ не залежить від вибору старту", () => {
    const m = tspDemoMatrix()
    const fromA = heldKarp(m, 0).cost
    for (let start = 1; start < TSP_DEMO_CITIES.length; start++) {
      expect(heldKarp(m, start).cost).toBeCloseTo(fromA, 9)
    }
  })

  it("повернений шлях справді має пораховану довжину", () => {
    const m = distanceMatrix(TSP_DEMO_CITIES)
    const { cost, path } = heldKarp(m)
    // path замкнений; tourLength рахує по відкритому порядку (без останнього старту)
    expect(tourLength(path.slice(0, -1), m)).toBeCloseTo(cost, 9)
  })
})
