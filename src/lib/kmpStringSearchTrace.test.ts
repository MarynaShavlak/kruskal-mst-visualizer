import { describe, expect, it } from "vitest"
import { buildKmpStringSearchTrace } from "@/lib/kmpStringSearchTrace"
import {
  KMP_CANONICAL,
  KMP_KONSPECT,
  KMP_WORST,
  KMP_CANONICAL_STATS,
  KMP_KONSPECT_STATS,
} from "@/lib/exampleKmpStringSearch"

describe("buildKmpStringSearchTrace — канонічний приклад", () => {
  const trace = buildKmpStringSearchTrace(KMP_CANONICAL.text, KMP_CANONICAL.pattern)

  it("перший кадр — init, останній — done", () => {
    expect(trace.frames[0].phase).toBe("init")
    expect(trace.frames[trace.frames.length - 1].phase).toBe("done")
  })

  it("дві фази присутні: lps (передобробка) і search (пошук)", () => {
    expect(trace.frames.some((f) => f.phase === "lps")).toBe(true)
    expect(trace.frames.some((f) => f.phase === "search")).toBe(true)
  })

  it("69 кадрів = init + 19 (lps) + 48 (search) + done", () => {
    expect(trace.frames.length).toBe(69)
    expect(trace.frames.filter((f) => f.phase === "init").length).toBe(1)
    expect(trace.frames.filter((f) => f.phase === "lps").length).toBe(19)
    expect(trace.frames.filter((f) => f.phase === "search").length).toBe(48)
    expect(trace.frames.filter((f) => f.phase === "done").length).toBe(1)
  })

  it("результат 10; lps 9 + пошук 23 = 32; наївний 29; i монотонний", () => {
    const r = trace.result
    expect(r.result).toBe(KMP_CANONICAL_STATS.result)
    expect(r.lpsComparisons).toBe(KMP_CANONICAL_STATS.lpsComparisons)
    expect(r.searchComparisons).toBe(KMP_CANONICAL_STATS.searchComparisons)
    expect(r.totalComparisons).toBe(KMP_CANONICAL_STATS.totalComparisons)
    expect(r.naiveComparisons).toBe(KMP_CANONICAL_STATS.naiveComparisons)
    expect(r.iMonotonic).toBe(true)
    expect(r.found).toBe(true)
    expect(r.lps).toEqual([0, 0, 1, 2, 0, 1, 2, 3, 4])
  })

  it("lps-фаза несе таблицю; пошук-фаза несе стрічку", () => {
    const lpsFrame = trace.frames.find((f) => f.phase === "lps" && f.lpsState?.kind === "final")
    expect(lpsFrame?.lpsState?.lps).toEqual([0, 0, 1, 2, 0, 1, 2, 3, 4])
    const searchFrame = trace.frames.find((f) => f.phase === "search" && f.searchState?.kind === "match_found")
    expect(searchFrame?.searchState?.offset).toBe(10)
  })

  it("накопичені порівняння монотонно зростають", () => {
    let prevLps = -1
    let prevSearch = -1
    for (const f of trace.frames) {
      expect(f.lpsComparisons).toBeGreaterThanOrEqual(prevLps)
      prevLps = f.lpsComparisons
      expect(f.searchComparisons).toBeGreaterThanOrEqual(prevSearch)
      prevSearch = f.searchComparisons
    }
    const last = trace.frames[trace.frames.length - 1]
    expect(last.lpsComparisons).toBe(9)
    expect(last.searchComparisons).toBe(23)
  })

  it("у фазі пошуку є подія shift (стрибок шаблону за lps)", () => {
    const shift = trace.frames.find((f) => f.searchState?.kind === "shift")
    expect(shift).toBeDefined()
    expect((shift?.searchState?.jump ?? 0)).toBeGreaterThanOrEqual(1)
  })

  it("обидва лістинги наявні", () => {
    expect(trace.lpsCode.join("\n")).toContain("def compute_lps(")
    expect(trace.searchCode.join("\n")).toContain("def kmp_search(")
  })
})

describe("buildKmpStringSearchTrace — конспект «алг» → 4", () => {
  const trace = buildKmpStringSearchTrace(KMP_KONSPECT.text, KMP_KONSPECT.pattern)

  it("результат 4; lps [0,0,0]; lps 2 + пошук 7 порівнянь; i монотонний", () => {
    expect(trace.result.result).toBe(KMP_KONSPECT_STATS.result)
    expect(trace.result.lps).toEqual([0, 0, 0])
    expect(trace.result.lpsComparisons).toBe(KMP_KONSPECT_STATS.lpsComparisons)
    expect(trace.result.searchComparisons).toBe(KMP_KONSPECT_STATS.searchComparisons)
    expect(trace.result.iMonotonic).toBe(true)
  })
})

describe("buildKmpStringSearchTrace — крайові випадки", () => {
  it("не знайдено: фінальний кадр done, результат -1, found=false", () => {
    const trace = buildKmpStringSearchTrace(KMP_WORST.text, KMP_WORST.pattern)
    expect(trace.result.found).toBe(false)
    expect(trace.result.result).toBe(-1)
    expect(trace.frames[trace.frames.length - 1].phase).toBe("done")
  })

  it("порожній шаблон: init + lps-фаза(мін) + пошук(збіг 0) + done", () => {
    const trace = buildKmpStringSearchTrace("abc", "")
    expect(trace.result.result).toBe(0)
    expect(trace.frames[0].phase).toBe("init")
    expect(trace.frames[trace.frames.length - 1].phase).toBe("done")
  })
})
