import { describe, it, expect } from "vitest"
import {
  countOperations,
  distanceMatrix,
  euclidean,
  tourLength,
  tourLess,
} from "@/lib/tsp"
import {
  TSP_DEMO_CITIES,
  TSP_DEMO_OPTIMAL_LENGTH,
} from "@/lib/exampleTsp"

describe("euclidean", () => {
  it("трикутник 3-4-5 і нульова відстань у себе", () => {
    expect(euclidean({ name: "A", x: 0, y: 0 }, { name: "B", x: 3, y: 4 })).toBeCloseTo(5, 12)
    expect(euclidean({ name: "A", x: 1, y: 1 }, { name: "B", x: 1, y: 1 })).toBe(0)
  })
})

describe("distanceMatrix", () => {
  const m = distanceMatrix(TSP_DEMO_CITIES)
  const n = TSP_DEMO_CITIES.length

  it("симетрична, з нулями на діагоналі", () => {
    expect(m).toHaveLength(n)
    for (let i = 0; i < n; i++) {
      expect(m[i]).toHaveLength(n)
      expect(m[i][i]).toBe(0)
      for (let j = 0; j < n; j++) expect(m[i][j]).toBeCloseTo(m[j][i], 12)
    }
  })

  it("значення збігаються з README (A–B 5.10, C–D 1.41 — найближча пара)", () => {
    expect(m[0][1]).toBeCloseTo(5.1, 2) // A→B
    expect(m[2][3]).toBeCloseTo(1.41, 2) // C→D
    expect(m[1][4]).toBeCloseTo(5.66, 2) // B→E (найдальша пара)
  })
})

describe("tourLength", () => {
  it("довжина еталонного туру A→C→B→D→E (замикається автоматично)", () => {
    const m = distanceMatrix(TSP_DEMO_CITIES)
    expect(tourLength([0, 2, 1, 3, 4], m)).toBeCloseTo(TSP_DEMO_OPTIMAL_LENGTH, 9)
  })

  it("вироджені входи дають 0", () => {
    expect(tourLength([], [])).toBe(0)
    expect(tourLength([0], [[0]])).toBe(0)
  })
})

describe("tourLess", () => {
  it("дешевший тур кращий за вартістю", () => {
    expect(tourLess({ cost: 1, path: [0] }, { cost: 2, path: [0] })).toBe(true)
    expect(tourLess({ cost: 2, path: [0] }, { cost: 1, path: [0] })).toBe(false)
  })

  it("на рівних вартостях — лексикографічно за шляхом (детермінований напрямок)", () => {
    const a = { cost: 5, path: [0, 2, 1, 3, 4, 0] }
    const b = { cost: 5, path: [0, 4, 3, 1, 2, 0] } // той самий цикл навпаки
    expect(tourLess(a, b)).toBe(true)
    expect(tourLess(b, a)).toBe(false)
  })
})

describe("countOperations", () => {
  it("n²·2ⁿ: для 5 міст — 800", () => {
    expect(countOperations(5)).toBe(25 * 32)
    expect(countOperations(20)).toBe(20 * 20 * 2 ** 20)
  })
})
