import { describe, expect, it } from "vitest"
import { buildNaiveStringSearchTrace } from "@/lib/naiveStringSearchTrace"
import {
  NSS_MAIN,
  NSS_NOT_FOUND,
  NSS_OVERLAP,
  NSS_MAIN_STATS,
} from "@/lib/exampleNaiveStringSearch"

describe("buildNaiveStringSearchTrace — канонічний приклад (перший збіг)", () => {
  const trace = buildNaiveStringSearchTrace(NSS_MAIN.text, NSS_MAIN.pattern)

  it("13 кадрів = init + 11 вирівнювань + done (step_00..12)", () => {
    expect(trace.frames.length).toBe(NSS_MAIN_STATS.frames)
    expect(trace.frames[0].phase).toBe("init")
    expect(trace.frames[trace.frames.length - 1].phase).toBe("done")
  })

  it("перший кадр — init (offset -1), фінальний результат — 10 за 29 порівнянь", () => {
    expect(trace.frames[0].offset).toBe(-1)
    expect(trace.result.result).toBe(10)
    expect(trace.result.comparisons).toBe(29)
    expect(trace.result.alignments).toBe(11)
    expect(trace.result.shifts).toBe(10)
    expect(trace.result.found).toBe(true)
  })

  it("кадр i=0 (frame 1): 4 збіги, розбіжність на j=4", () => {
    const f = trace.frames[1]
    expect(f.phase).toBe("align")
    expect(f.offset).toBe(0)
    expect(f.matched).toBe(4)
    expect(f.mismatchJ).toBe(4)
  })

  it("кадр повного збігу (frame 11): offset 10, full=true, matched=M", () => {
    const f = trace.frames[11]
    expect(f.phase).toBe("found")
    expect(f.offset).toBe(10)
    expect(f.full).toBe(true)
    expect(f.matched).toBe(NSS_MAIN.pattern.length)
  })

  it("накопичені порівняння монотонно зростають до 29", () => {
    let prev = -1
    for (const f of trace.frames) {
      expect(f.comparisons).toBeGreaterThanOrEqual(prev)
      prev = f.comparisons
    }
    expect(trace.frames[trace.frames.length - 1].comparisons).toBe(29)
  })

  it("код — лістинг «перший збіг» (naive_search)", () => {
    expect(trace.code.join("\n")).toContain("def naive_search(")
  })
})

describe("buildNaiveStringSearchTrace — режим «усі входження»", () => {
  it("ABABAB / AB: 3 кадри-збіги, фінальний список [0,2,4]", () => {
    const trace = buildNaiveStringSearchTrace(NSS_OVERLAP.text, NSS_OVERLAP.pattern, true)
    expect(trace.frames.filter((f) => f.phase === "found").length).toBe(3)
    expect(trace.result.matches).toEqual([0, 2, 4])
    expect(trace.code.join("\n")).toContain("def naive_search_all(")
  })
})

describe("buildNaiveStringSearchTrace — крайові випадки", () => {
  it("не знайдено: фінальний кадр done, результат -1", () => {
    const trace = buildNaiveStringSearchTrace(NSS_NOT_FOUND.text, NSS_NOT_FOUND.pattern)
    expect(trace.result.found).toBe(false)
    expect(trace.result.result).toBe(-1)
    expect(trace.frames[trace.frames.length - 1].phase).toBe("done")
  })

  it("порожній шаблон: init + done, знайдено на 0", () => {
    const trace = buildNaiveStringSearchTrace("abc", "")
    expect(trace.result.result).toBe(0)
    expect(trace.frames.length).toBe(2)
  })
})
