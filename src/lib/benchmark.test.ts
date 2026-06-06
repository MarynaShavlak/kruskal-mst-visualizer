import { describe, it, expect } from "vitest"
import { benchmarkPoint } from "@/lib/benchmark"

describe("benchmarkPoint", () => {
  it("повертає коректну структуру з невід'ємними часами", () => {
    const p = benchmarkPoint(60, 1)
    expect(p.size).toBe(60)
    expect(p.edges).toBeGreaterThan(0)
    expect(p.dsuMs).toBeGreaterThanOrEqual(0)
    expect(p.hasPathMs).toBeGreaterThanOrEqual(0)
    expect(Number.isFinite(p.dsuMs)).toBe(true)
    expect(Number.isFinite(p.hasPathMs)).toBe(true)
  })
})
