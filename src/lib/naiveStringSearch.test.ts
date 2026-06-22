import { describe, expect, it } from "vitest"
import {
  naiveSearch,
  naiveSearchAll,
  naiveSearchSlices,
  naiveSearchSteps,
  countComparisons,
  caseAnalysis,
} from "@/lib/naiveStringSearch"
import {
  NSS_MAIN,
  NSS_INTUITION,
  NSS_START,
  NSS_NOT_FOUND,
  NSS_WORST,
  NSS_WORST_FOUND,
  NSS_OVERLAP,
  NSS_QUICKFAIL,
  NSS_MAIN_STATS,
  NSS_WORST_STATS,
  NSS_NOT_FOUND_STATS,
  NSS_OVERLAP_STATS,
} from "@/lib/exampleNaiveStringSearch"

describe("naiveSearch — базовий результат (еталон README)", () => {
  it("канонічний приклад: ABABCABAB у тексті → позиція 10", () => {
    expect(naiveSearch(NSS_MAIN.text, NSS_MAIN.pattern)).toBe(NSS_MAIN_STATS.result)
  })

  it("інтуїція: WORLD у HELLO WORLD → 6", () => {
    expect(naiveSearch(NSS_INTUITION.text, NSS_INTUITION.pattern)).toBe(6)
  })

  it("збіг на старті → 0; не знайдено → -1; найгірший із збігом → 6", () => {
    expect(naiveSearch(NSS_START.text, NSS_START.pattern)).toBe(0)
    expect(naiveSearch(NSS_NOT_FOUND.text, NSS_NOT_FOUND.pattern)).toBe(-1)
    expect(naiveSearch(NSS_WORST.text, NSS_WORST.pattern)).toBe(-1)
    expect(naiveSearch(NSS_WORST_FOUND.text, NSS_WORST_FOUND.pattern)).toBe(6)
    expect(naiveSearch(NSS_QUICKFAIL.text, NSS_QUICKFAIL.pattern)).toBe(-1)
  })

  it("порожній шаблон → 0; шаблон довший за текст → -1", () => {
    expect(naiveSearch("abc", "")).toBe(0)
    expect(naiveSearch("ab", "abc")).toBe(-1)
  })

  it("Pythonic-варіант через зрізи дає той самий перший індекс", () => {
    for (const c of [NSS_MAIN, NSS_INTUITION, NSS_NOT_FOUND, NSS_WORST_FOUND, NSS_QUICKFAIL]) {
      expect(naiveSearchSlices(c.text, c.pattern)).toBe(naiveSearch(c.text, c.pattern))
    }
  })
})

describe("naiveSearchAll — усі входження", () => {
  it("кілька входжень AB у ABABAB → [0, 2, 4]", () => {
    expect(naiveSearchAll(NSS_OVERLAP.text, NSS_OVERLAP.pattern)).toEqual([
      ...NSS_OVERLAP_STATS.allIndices,
    ])
  })

  it("один збіг → список з одного; немає → []", () => {
    expect(naiveSearchAll(NSS_MAIN.text, NSS_MAIN.pattern)).toEqual([10])
    expect(naiveSearchAll(NSS_NOT_FOUND.text, NSS_NOT_FOUND.pattern)).toEqual([])
  })

  it("порожній шаблон → усі позиції [0..N]", () => {
    expect(naiveSearchAll("abc", "")).toEqual([0, 1, 2, 3])
  })
})

describe("naiveSearchSteps — лічильники (еталон README)", () => {
  it("канонічний: 29 порівнянь, 11 вирівнювань, 10 зсувів", () => {
    const r = naiveSearchSteps(NSS_MAIN.text, NSS_MAIN.pattern)
    expect(r.result).toBe(NSS_MAIN_STATS.result)
    expect(r.comparisons).toBe(NSS_MAIN_STATS.comparisons)
    expect(r.alignments).toBe(NSS_MAIN_STATS.alignments)
    expect(r.shifts).toBe(NSS_MAIN_STATS.shifts)
  })

  it("найгірший AAAA…: 30 порівнянь, 6 вирівнювань, 6 зсувів", () => {
    const r = naiveSearchSteps(NSS_WORST.text, NSS_WORST.pattern)
    expect(r.comparisons).toBe(NSS_WORST_STATS.comparisons)
    expect(r.alignments).toBe(NSS_WORST_STATS.alignments)
    expect(r.shifts).toBe(NSS_WORST_STATS.shifts)
  })

  it("не знайдено: 18 порівнянь, 6 вирівнювань, 6 зсувів", () => {
    const r = naiveSearchSteps(NSS_NOT_FOUND.text, NSS_NOT_FOUND.pattern)
    expect(r.comparisons).toBe(NSS_NOT_FOUND_STATS.comparisons)
    expect(r.alignments).toBe(NSS_NOT_FOUND_STATS.alignments)
    expect(r.shifts).toBe(NSS_NOT_FOUND_STATS.shifts)
  })

  it("інваріанти: comparisons=кільк. compare, alignments=кільк. align, shifts=кільк. mismatch", () => {
    for (const c of [NSS_MAIN, NSS_NOT_FOUND, NSS_WORST, NSS_WORST_FOUND]) {
      const r = naiveSearchSteps(c.text, c.pattern)
      expect(r.events.filter((e) => e.kind === "compare").length).toBe(r.comparisons)
      expect(r.events.filter((e) => e.kind === "align").length).toBe(r.alignments)
      expect(r.events.filter((e) => e.kind === "mismatch").length).toBe(r.shifts)
    }
  })

  it("findAll продовжує скан і збирає всі позиції", () => {
    const r = naiveSearchSteps(NSS_OVERLAP.text, NSS_OVERLAP.pattern, true)
    expect(r.matches).toEqual([0, 2, 4])
    expect(r.events.filter((e) => e.kind === "match_found").length).toBe(3)
  })

  it("countComparisons збігається з полем steps", () => {
    expect(countComparisons(NSS_MAIN.text, NSS_MAIN.pattern)).toBe(29)
    expect(countComparisons(NSS_WORST.text, NSS_WORST.pattern)).toBe(30)
  })
})

describe("caseAnalysis — best ≈ N-M+1, worst (N-M+1)·M", () => {
  it("канонічний (N=19, M=9): 11 вирівнювань, best 11, worst 99", () => {
    const c = caseAnalysis(NSS_MAIN.text, NSS_MAIN.pattern)
    expect(c.alignments).toBe(11)
    expect(c.best).toBe(11)
    expect(c.worst).toBe(99)
  })

  it("шаблон довший за текст → 0 вирівнювань", () => {
    const c = caseAnalysis("ab", "abcd")
    expect(c.alignments).toBe(0)
    expect(c.best).toBe(0)
    expect(c.worst).toBe(0)
  })
})
