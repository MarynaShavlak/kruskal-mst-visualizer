import { describe, it, expect } from "vitest"
import { buildShellSortTrace, SHELL_CODE } from "@/lib/shellSortTrace"
import { SHELL_INTRO, SHELL_INTRO_SORTED } from "@/lib/exampleShellSort"

describe("buildShellSortTrace (послідовність Шелла)", () => {
  const trace = buildShellSortTrace(SHELL_INTRO, "shell")

  it("76 кадрів (по одному на подію); перший init, останній done", () => {
    expect(trace.frames.length).toBe(76)
    expect(trace.frames[0].phase).toBe("init")
    expect(trace.frames[trace.frames.length - 1].phase).toBe("done")
    expect(trace.frames[trace.frames.length - 1].sortedAll).toBe(true)
  })

  it("результат і лічильники — еталон (23/11/3, gaps [4,2,1])", () => {
    expect(trace.result.sorted).toEqual([...SHELL_INTRO_SORTED])
    expect(trace.result.comparisons).toBe(23)
    expect(trace.result.shifts).toBe(11)
    expect(trace.result.gapPhases).toBe(3)
    expect(trace.result.gaps).toEqual([4, 2, 1])
  })

  it("кадри взяття несуть temp «у руці» й «дірку»; лічильники монотонні", () => {
    let prevC = 0
    let prevS = 0
    let sawTake = false
    let sawShift = false
    for (const f of trace.frames) {
      expect(f.caption.length).toBeGreaterThan(0)
      expect(f.comparisons).toBeGreaterThanOrEqual(prevC)
      expect(f.shifts).toBeGreaterThanOrEqual(prevS)
      prevC = f.comparisons
      prevS = f.shifts
      if (f.phase === "take") {
        sawTake = true
        expect(f.key).not.toBeNull()
        expect(f.hole).not.toBeNull()
      }
      if (f.phase === "shift") {
        sawShift = true
        expect(f.shiftAt).not.toBeNull()
      }
    }
    expect(sawTake).toBe(true)
    expect(sawShift).toBe(true)
  })

  it("groupResidue = i % gap на кадрах вставки (поточна підпослідовність)", () => {
    const take = trace.frames.find((f) => f.phase === "take")!
    expect(take.gap).not.toBeNull()
    expect(take.groupResidue).toBeGreaterThanOrEqual(0)
    expect(take.groupResidue).toBeLessThan(take.gap ?? 1)
  })
})

describe("buildShellSortTrace — режим впливає на gaps і ціну", () => {
  it("Кнут на INTRO: gaps [4,1], 20/13/2 (менше фаз, ніж Шелла)", () => {
    const trace = buildShellSortTrace(SHELL_INTRO, "knuth")
    expect(trace.result.gaps).toEqual([4, 1])
    expect(trace.result.comparisons).toBe(20)
    expect(trace.result.shifts).toBe(13)
    expect(trace.result.gapPhases).toBe(2)
  })
})

describe("SHELL_CODE", () => {
  it("параметризований лістинг: for gap in gaps + while j>=gap", () => {
    expect(SHELL_CODE.some((l) => l.includes("for gap in gaps"))).toBe(true)
    expect(SHELL_CODE.some((l) => l.includes("while j >= gap"))).toBe(true)
    expect(SHELL_CODE.length).toBe(11)
  })
})
