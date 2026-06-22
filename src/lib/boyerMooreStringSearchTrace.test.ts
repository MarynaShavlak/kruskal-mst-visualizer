import { describe, expect, it } from "vitest"
import { buildBoyerMooreStringSearchTrace } from "@/lib/boyerMooreStringSearchTrace"
import {
  BM_MAIN,
  BM_WORST,
  BM_BIG_JUMPS,
  BM_NOT_FOUND,
  BM_MAIN_STATS,
} from "@/lib/exampleBoyerMooreStringSearch"

describe("buildBoyerMooreStringSearchTrace — канонічний приклад (developer)", () => {
  const trace = buildBoyerMooreStringSearchTrace(BM_MAIN.text, BM_MAIN.pattern)

  it("24 кадри = таблиця T00–T10 (11) + пошук S00–S12 (13)", () => {
    expect(trace.frames.length).toBe(BM_MAIN_STATS.frames)
    const tableFrames = trace.frames.filter((f) => f.phase === "table")
    const searchFrames = trace.frames.filter((f) => f.phase === "search")
    expect(tableFrames.length).toBe(BM_MAIN_STATS.tableFrames)
    expect(searchFrames.length).toBe(BM_MAIN_STATS.searchFrames)
  })

  it("перший кадр — table-init; останній — done зі збігом", () => {
    expect(trace.frames[0].step).toBe("table-init")
    const last = trace.frames[trace.frames.length - 1]
    expect(last.step).toBe("done")
    expect(last.result).toBe(8)
    expect(last.full).toBe(true)
  })

  it("фінальний результат: 8 за 10 порівнянь, 1 стрибок, 8 пропущених", () => {
    expect(trace.result.result).toBe(BM_MAIN_STATS.result)
    expect(trace.result.comparisons).toBe(BM_MAIN_STATS.comparisons)
    expect(trace.result.jumps).toBe(BM_MAIN_STATS.jumps)
    expect(trace.result.skipped).toBe(BM_MAIN_STATS.skipped)
    expect(trace.result.found).toBe(true)
  })

  it("таблиця у result = таблиця developer", () => {
    expect(trace.result.table).toEqual({ d: 8, e: 1, v: 6, l: 4, o: 3, p: 2, r: 9 })
  })

  it("фаза таблиці: 1 init + 8 entry + 1 default + 1 final; є кадр перезапису 'e'", () => {
    const t = trace.frames.filter((f) => f.phase === "table")
    expect(t.filter((f) => f.step === "table-init").length).toBe(1)
    expect(t.filter((f) => f.step === "table-entry").length).toBe(8)
    expect(t.filter((f) => f.step === "table-default").length).toBe(1)
    expect(t.filter((f) => f.step === "table-final").length).toBe(1)
    expect(t.some((f) => f.step === "table-entry" && f.tableChar === "e" && f.overwrite)).toBe(true)
  })

  it("фаза пошуку: init + 1 розбіжність + 1 стрибок + 9 збігів + done(знайдено) = 13", () => {
    const s = trace.frames.filter((f) => f.phase === "search")
    expect(s.length).toBe(13)
    expect(s[0].step).toBe("search-init")
    const compares = s.filter((f) => f.step === "compare")
    expect(compares.length).toBe(10) // 1 розбіжність (i=0,j=8) + 9 збігів (i=8)
    expect(compares.filter((f) => f.compareMatch === false).length).toBe(1)
    expect(compares.filter((f) => f.compareMatch === true).length).toBe(9)
    expect(s.filter((f) => f.step === "shift").length).toBe(1)
    const done = s[s.length - 1]
    expect(done.step).toBe("done")
    expect(done.full).toBe(true)
    expect(done.offset).toBe(8)
  })

  it("стрибок: i 0→8, символ кінця вікна 'd', стрибок 8, 8 пропущених", () => {
    const shift = trace.frames.find((f) => f.step === "shift")!
    expect(shift.offset).toBe(0)
    expect(shift.windowEndChar).toBe("d")
    expect(shift.jump).toBe(8)
    expect(shift.skippedNow.length).toBe(8)
  })

  it("суфікс росте справа наліво у вікні i=8 (matchedSuffix зростає до 9)", () => {
    const win = trace.frames.filter((f) => f.step === "compare" && f.offset === 8 && f.compareMatch === true)
    const suffixes = win.map((f) => f.matchedSuffix)
    expect(suffixes).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it("накопичені порівняння монотонно зростають до 10", () => {
    let prev = -1
    for (const f of trace.frames.filter((x) => x.phase === "search")) {
      expect(f.comparisons).toBeGreaterThanOrEqual(prev)
      prev = f.comparisons
    }
    expect(trace.frames[trace.frames.length - 1].comparisons).toBe(10)
  })

  it("коди — лістинги build_shift_table і boyer_moore_search", () => {
    expect(trace.tableCode.join("\n")).toContain("def build_shift_table(")
    expect(trace.searchCode.join("\n")).toContain("def boyer_moore_search(")
  })
})

describe("buildBoyerMooreStringSearchTrace — крайові випадки", () => {
  it("найгірший CAAAA: done з результатом -1, 30 порівнянь, 6 стрибків", () => {
    const trace = buildBoyerMooreStringSearchTrace(BM_WORST.text, BM_WORST.pattern)
    expect(trace.result.found).toBe(false)
    expect(trace.result.result).toBe(-1)
    expect(trace.result.comparisons).toBe(30)
    expect(trace.result.jumps).toBe(6)
    expect(trace.frames[trace.frames.length - 1].step).toBe("done")
  })

  it("великі стрибки jumps: знайдено 20, 4 стрибки, 16 пропущених", () => {
    const trace = buildBoyerMooreStringSearchTrace(BM_BIG_JUMPS.text, BM_BIG_JUMPS.pattern)
    expect(trace.result.result).toBe(BM_BIG_JUMPS.text.indexOf(BM_BIG_JUMPS.pattern))
    expect(trace.result.jumps).toBe(4)
    expect(trace.result.skipped).toBe(16)
    expect(trace.frames.filter((f) => f.step === "shift").length).toBe(4)
  })

  it("не знайдено XYZ: done -1, 2 стрибки", () => {
    const trace = buildBoyerMooreStringSearchTrace(BM_NOT_FOUND.text, BM_NOT_FOUND.pattern)
    expect(trace.result.found).toBe(false)
    expect(trace.frames.filter((f) => f.step === "shift").length).toBe(2)
  })

  it("порожній шаблон: фаза таблиці (init+final) + пошук (init+found+done), знайдено 0", () => {
    const trace = buildBoyerMooreStringSearchTrace("abc", "")
    expect(trace.result.result).toBe(0)
    expect(trace.frames[trace.frames.length - 1].step).toBe("done")
  })
})
