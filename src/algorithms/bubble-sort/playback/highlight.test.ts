import { describe, it, expect } from "vitest"
import { barRole, barHeightPct } from "@/algorithms/bubble-sort/playback/highlight"

describe("barRole", () => {
  it("пара, що порівнюється без обміну → comparing", () => {
    expect(barRole(1, [1, 2], false, 6)).toBe("comparing")
    expect(barRole(2, [1, 2], false, 6)).toBe("comparing")
  })

  it("пара з обміном → swapped", () => {
    expect(barRole(1, [1, 2], true, 6)).toBe("swapped")
  })

  it("елемент у хвості (index ≥ sortedFrom) → sorted", () => {
    expect(barRole(5, null, false, 5)).toBe("sorted")
    expect(barRole(5, [0, 1], false, 5)).toBe("sorted")
  })

  it("решта → idle", () => {
    expect(barRole(0, [2, 3], false, 6)).toBe("idle")
    expect(barRole(3, null, false, 6)).toBe("idle")
  })

  it("пара має пріоритет над хвостом", () => {
    expect(barRole(4, [4, 5], true, 4)).toBe("swapped")
  })
})

describe("barHeightPct", () => {
  it("масштабує відносно максимуму", () => {
    expect(barHeightPct(8, 8)).toBe(100)
    expect(barHeightPct(4, 8)).toBe(50)
  })

  it("тримає мінімальну видиму висоту", () => {
    expect(barHeightPct(0, 8)).toBe(8)
    expect(barHeightPct(0, 8, 12)).toBe(12)
  })

  it("max ≤ 0 → minPct", () => {
    expect(barHeightPct(0, 0)).toBe(8)
  })
})
