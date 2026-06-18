import { describe, it, expect } from "vitest"
import { barRole, barHeightPct } from "@/algorithms/insertion-sort/playback/highlight"

describe("barRole (вставки)", () => {
  it("«дірка» має найвищий пріоритет", () => {
    expect(barRole(2, 4, 2, 2, null)).toBe("hole")
  })

  it("щойно зсунутий елемент → shift", () => {
    expect(barRole(3, 4, 2, null, 3)).toBe("shift")
  })

  it("елемент, який порівнюють/перевіряють → compare", () => {
    expect(barRole(1, 4, null, 1, null)).toBe("compare")
  })

  it("елемент префікса (index < prefixLen) → prefix", () => {
    expect(barRole(0, 3, null, null, null)).toBe("prefix")
    expect(barRole(2, 3, null, null, null)).toBe("prefix")
  })

  it("несортований суфікс → idle", () => {
    expect(barRole(4, 3, null, null, null)).toBe("idle")
  })

  it("shift має пріоритет над префіксом", () => {
    expect(barRole(2, 5, null, null, 2)).toBe("shift")
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
