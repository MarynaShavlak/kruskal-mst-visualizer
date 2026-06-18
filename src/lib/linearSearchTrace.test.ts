import { describe, it, expect } from "vitest"
import {
  buildLinearSearchTrace,
  LINEAR_CODE,
  FIND_ALL_CODE,
} from "@/lib/linearSearchTrace"
import {
  LS_MAIN,
  LS_ABSENT,
  LS_DUPLICATES,
} from "@/lib/exampleLinearSearch"

describe("buildLinearSearchTrace — головний приклад (перший збіг)", () => {
  const trace = buildLinearSearchTrace(LS_MAIN.values, LS_MAIN.target)

  it("8 кадрів (init + по 2 на 3 перевірки + done) — як повне трасування README", () => {
    expect(trace.frames.length).toBe(8)
    expect(trace.frames[0].phase).toBe("init")
    expect(trace.frames[trace.frames.length - 1].phase).toBe("done")
    expect(trace.frames.map((f) => f.phase)).toEqual([
      "init",
      "check",
      "reject",
      "check",
      "reject",
      "check",
      "match",
      "done",
    ])
  })

  it("результат і лічильники — еталон (індекс 2, 3 перевірки)", () => {
    expect(trace.result.result).toBe(2)
    expect(trace.result.comparisons).toBe(3)
    expect(trace.result.matches).toEqual([2])
    expect(trace.result.found).toBe(true)
    expect(trace.result.size).toBe(5)
    expect(trace.code).toBe(LINEAR_CODE)
  })

  it("масив незмінний у кожному кадрі; лічильник перевірок монотонний", () => {
    let prev = 0
    for (const f of trace.frames) {
      expect(f.array).toEqual([...LS_MAIN.values])
      expect(f.caption.length).toBeGreaterThan(0)
      expect(f.comparisons).toBeGreaterThanOrEqual(prev)
      prev = f.comparisons
    }
  })

  it("кадр-збіг (frame 6) несе курсор 2, match=true; resolvedTo=2", () => {
    const f = trace.frames[6]
    expect(f.phase).toBe("match")
    expect(f.cursor).toBe(2)
    expect(f.value).toBe(8)
    expect(f.match).toBe(true)
    expect(f.resolvedTo).toBe(2)
  })

  it("step_main_K ↔ кадр 2K+2 (розв'язок перевірки K)", () => {
    expect(trace.frames[2].cursor).toBe(0) // 5 ≠ 8
    expect(trace.frames[4].cursor).toBe(1) // 3 ≠ 8
    expect(trace.frames[6].cursor).toBe(2) // 8 = 8 ✓
  })
})

describe("buildLinearSearchTrace — відсутній елемент (повний скан)", () => {
  const trace = buildLinearSearchTrace(LS_ABSENT.values, LS_ABSENT.target)

  it("12 кадрів, result -1, 5 перевірок, not-found", () => {
    expect(trace.frames.length).toBe(12)
    expect(trace.result.result).toBe(-1)
    expect(trace.result.found).toBe(false)
    expect(trace.result.comparisons).toBe(5)
    const done = trace.frames[trace.frames.length - 1]
    expect(done.phase).toBe("done")
    expect(done.cursor).toBeNull()
    expect(done.lines).toEqual([5]) // return -1
  })
})

describe("buildLinearSearchTrace — дублікати, режим «усі входження»", () => {
  const first = buildLinearSearchTrace(LS_DUPLICATES.values, LS_DUPLICATES.target, false)
  const all = buildLinearSearchTrace(LS_DUPLICATES.values, LS_DUPLICATES.target, true)

  it("перший збіг: зупинка на індексі 1 (2 перевірки, 6 кадрів)", () => {
    expect(first.frames.length).toBe(6)
    expect(first.result.result).toBe(1)
    expect(first.result.matches).toEqual([1])
    expect(first.result.comparisons).toBe(2)
    expect(first.code).toBe(LINEAR_CODE)
  })

  it("усі входження: повний скан, matches [1,3,5] (6 перевірок, 14 кадрів)", () => {
    expect(all.frames.length).toBe(14)
    expect(all.result.matches).toEqual([1, 3, 5])
    expect(all.result.result).toBe(1) // перший збіг лишається індексом 1
    expect(all.result.comparisons).toBe(6)
    expect(all.result.found).toBe(true)
    expect(all.code).toBe(FIND_ALL_CODE)
    // три кадри-збіги (match)
    expect(all.frames.filter((f) => f.phase === "match").length).toBe(3)
  })
})

describe("лістинги коду", () => {
  it("LINEAR_CODE — базовий (return i / return -1), 5 рядків", () => {
    expect(LINEAR_CODE.length).toBe(5)
    expect(LINEAR_CODE.some((l) => l.includes("return i"))).toBe(true)
    expect(LINEAR_CODE.some((l) => l.includes("return -1"))).toBe(true)
  })

  it("FIND_ALL_CODE — усі входження (result.append), 6 рядків", () => {
    expect(FIND_ALL_CODE.length).toBe(6)
    expect(FIND_ALL_CODE.some((l) => l.includes("result.append(i)"))).toBe(true)
  })
})
