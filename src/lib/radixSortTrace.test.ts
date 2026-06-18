import { describe, it, expect } from "vitest"
import { buildRadixSortTrace, RADIX_CODE } from "@/lib/radixSortTrace"
import {
  RADIX_INTRO,
  RADIX_INTRO_SORTED,
  RADIX_BIG,
} from "@/lib/exampleRadixSort"

describe("buildRadixSortTrace (головний приклад)", () => {
  const trace = buildRadixSortTrace(RADIX_INTRO)

  it("35 кадрів (по одному на подію); перший init, останній done", () => {
    expect(trace.frames.length).toBe(35)
    expect(trace.frames[0].phase).toBe("init")
    expect(trace.frames[trace.frames.length - 1].phase).toBe("done")
    expect(trace.frames[trace.frames.length - 1].gathered).toBe(true)
  })

  it("результат і лічильники — еталон (3 проходи / 27 розкладань / 0 порівнянь)", () => {
    expect(trace.result.sorted).toEqual([...RADIX_INTRO_SORTED])
    expect(trace.result.passes).toBe(3)
    expect(trace.result.distributions).toBe(27)
    expect(trace.result.comparisons).toBe(0)
    expect(trace.result.maxDigits).toBe(3)
    expect(trace.result.base).toBe(10)
  })

  it("кадри розкладання несуть активну фішку, кошик і 10 кошиків; лічильники монотонні", () => {
    let prevP = 0
    let prevD = 0
    let sawDistribute = false
    let sawGather = false
    for (const f of trace.frames) {
      expect(f.caption.length).toBeGreaterThan(0)
      expect(f.buckets.length).toBe(10)
      expect(f.passes).toBeGreaterThanOrEqual(prevP)
      expect(f.distributions).toBeGreaterThanOrEqual(prevD)
      prevP = f.passes
      prevD = f.distributions
      if (f.phase === "distribute") {
        sawDistribute = true
        expect(f.activeValue).not.toBeNull()
        expect(f.activeBucket).not.toBeNull()
        expect(f.activeIndex).not.toBeNull()
      }
      if (f.phase === "gather") {
        sawGather = true
        expect(f.gathered).toBe(true)
      }
    }
    expect(sawDistribute).toBe(true)
    expect(sawGather).toBe(true)
  })

  it("перший прохід — за одиницями (position = 1), активна фішка падає у свій кошик", () => {
    const pass = trace.frames.find((f) => f.phase === "pass")!
    expect(pass.position).toBe(1)
    expect(pass.digitIndex).toBe(0)
    const dist = trace.frames.find((f) => f.phase === "distribute")!
    expect(dist.activeValue).toBe(3)
    expect(dist.activeBucket).toBe(3)
  })
})

describe("buildRadixSortTrace — межовий масив", () => {
  it("BIG [4,7,1000000,23,9]: велике d → 7 проходів, ширина фішки 7", () => {
    const trace = buildRadixSortTrace(RADIX_BIG)
    expect(trace.result.passes).toBe(7)
    expect(trace.result.maxDigits).toBe(7)
    expect(trace.result.sorted).toEqual([4, 7, 9, 23, 1000000])
  })
})

describe("RADIX_CODE", () => {
  it("наочний лістинг: кошики + конкатенація", () => {
    expect(RADIX_CODE.some((l) => l.includes("buckets[digit].append(x)"))).toBe(true)
    expect(RADIX_CODE.some((l) => l.includes("for b in buckets for x in b"))).toBe(true)
    expect(RADIX_CODE.length).toBe(9)
  })
})
