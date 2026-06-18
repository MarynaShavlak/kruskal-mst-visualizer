import { describe, it, expect } from "vitest"
import { partRole, barHeightPct } from "@/algorithms/quick-sort/playback/highlight"

describe("partRole (швидке сортування)", () => {
  it("сам опорний (за індексом) → pivot, навіть якщо є рівні", () => {
    expect(partRole(4, 4, true)).toBe("pivot")
  })

  it("менший за опорний → less", () => {
    expect(partRole(2, 4, false)).toBe("less")
  })

  it("рівний опорному (але не сам опорний) → equal", () => {
    expect(partRole(4, 4, false)).toBe("equal")
  })

  it("більший за опорний → greater", () => {
    expect(partRole(7, 4, false)).toBe("greater")
  })
})

describe("barHeightPct", () => {
  it("масштабує відносно максимуму; тримає мінімум; max≤0 → minPct", () => {
    expect(barHeightPct(7, 7)).toBe(100)
    expect(barHeightPct(0, 7)).toBe(8)
    expect(barHeightPct(0, 0)).toBe(8)
  })
})
