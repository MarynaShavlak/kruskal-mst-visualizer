import { describe, it, expect } from "vitest"
import { barRole, barHeightPct } from "@/algorithms/selection-sort/playback/highlight"

const base = { sortedTo: 0, minIdx: null, placedAt: null, swapAt: null, hole: null }

describe("barRole (вибір)", () => {
  it("«дірка» має найвищий пріоритет", () => {
    expect(barRole(2, { ...base, hole: 2, swapAt: 2, minIdx: 2 })).toBe("hole")
  })

  it("елемент, що став на місце → placed", () => {
    expect(barRole(0, { ...base, placedAt: 0, swapAt: 4 })).toBe("placed")
  })

  it("пара обміну / щойно зсунутий → swap", () => {
    expect(barRole(4, { ...base, placedAt: 0, swapAt: 4 })).toBe("swap")
  })

  it("кандидат-мінімум → min", () => {
    expect(barRole(3, { ...base, sortedTo: 1, minIdx: 3 })).toBe("min")
  })

  it("елемент префікса (index < sortedTo) → prefix", () => {
    expect(barRole(0, { ...base, sortedTo: 3 })).toBe("prefix")
    expect(barRole(2, { ...base, sortedTo: 3 })).toBe("prefix")
  })

  it("несортований суфікс → idle", () => {
    expect(barRole(4, { ...base, sortedTo: 3 })).toBe("idle")
  })

  it("placed/swap мають пріоритет над префіксом і мінімумом", () => {
    expect(barRole(0, { ...base, sortedTo: 2, placedAt: 0 })).toBe("placed")
    expect(barRole(1, { ...base, sortedTo: 3, minIdx: 1, swapAt: 1 })).toBe("swap")
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
