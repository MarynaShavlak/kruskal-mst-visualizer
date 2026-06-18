import { describe, it, expect } from "vitest"
import {
  buildInsertionSortTrace,
  LINEAR_CODE,
  BINARY_CODE,
} from "@/lib/insertionSortTrace"
import { insertionSort, countOperations } from "@/lib/insertionSort"
import {
  INSERTION_INTRO,
  INSERTION_INTRO_SORTED,
  INSERTION_WORST,
} from "@/lib/exampleInsertionSort"

describe("buildInsertionSortTrace: результат збігається з чистим ядром", () => {
  it("лінійна на [5,2,4,6,1,3]: sorted/comparisons/shifts/insertions", () => {
    const { result } = buildInsertionSortTrace(INSERTION_INTRO, false)
    const counts = countOperations(INSERTION_INTRO, false)
    expect(result.sorted).toEqual([...INSERTION_INTRO_SORTED])
    expect(result.sorted).toEqual(insertionSort(INSERTION_INTRO))
    expect(result.comparisons).toBe(counts.comparisons)
    expect(result.shifts).toBe(counts.shifts)
    expect(result.insertions).toBe(counts.insertions)
    expect(result.maxComparisons).toBe(15)
    expect(result.size).toBe(6)
    expect(result.binary).toBe(false)
  })

  it("обирає лістинг коду за режимом", () => {
    expect(buildInsertionSortTrace(INSERTION_INTRO, false).code).toBe(LINEAR_CODE)
    expect(buildInsertionSortTrace(INSERTION_INTRO, true).code).toBe(BINARY_CODE)
  })

  it("бінарна на [6..1]: 11 порівнянь, 15 зсувів", () => {
    const { result } = buildInsertionSortTrace(INSERTION_WORST, true)
    expect(result.comparisons).toBe(11)
    expect(result.shifts).toBe(15)
    expect(result.binary).toBe(true)
  })
})

describe("buildInsertionSortTrace: структура кадрів", () => {
  it("init → … → done; індекси послідовні", () => {
    const { frames } = buildInsertionSortTrace(INSERTION_INTRO, false)
    expect(frames[0].sub.kind).toBe("init")
    expect(frames[0].phase).toBe("scan")
    const last = frames[frames.length - 1]
    expect(last.sub.kind).toBe("done")
    expect(last.phase).toBe("done")
    frames.forEach((f, i) => expect(f.i).toBe(i))
  })

  it("на [5,2,4,6,1,3] лінійна: 24 кадри", () => {
    const { frames } = buildInsertionSortTrace(INSERTION_INTRO, false)
    expect(frames.length).toBe(24)
  })

  it("кадр-зсув підсвічує перенесений елемент (shiftAt), зупинне порівняння — compareAt", () => {
    const { frames } = buildInsertionSortTrace(INSERTION_INTRO, false)
    for (const f of frames) {
      if (f.sub.kind === "compare") {
        if (f.sub.shifted) {
          expect(f.shiftAt).toBe(f.sub.j + 1)
          expect(f.compareAt).toBeNull()
        } else {
          expect(f.compareAt).toBe(f.sub.j)
          expect(f.shiftAt).toBeNull()
        }
      }
    }
  })

  it("кадри з key «в руці» (take/compare/probe/shift) несуть key, insert/done — ні", () => {
    const { frames } = buildInsertionSortTrace(INSERTION_INTRO, false)
    for (const f of frames) {
      if (f.sub.kind === "insert" || f.sub.kind === "done" || f.sub.kind === "init") {
        expect(f.key).toBeNull()
      } else {
        expect(f.key).not.toBeNull()
      }
    }
  })

  it("останній кадр несе відсортований масив і повний префікс", () => {
    const { frames } = buildInsertionSortTrace(INSERTION_INTRO, false)
    const last = frames[frames.length - 1]
    expect(last.array).toEqual([...INSERTION_INTRO_SORTED])
    expect(last.prefixLen).toBe(6)
  })

  it("бінарна дає кадри probe та shift", () => {
    const { frames } = buildInsertionSortTrace(INSERTION_WORST, true)
    expect(frames.some((f) => f.sub.kind === "probe")).toBe(true)
    expect(frames.some((f) => f.sub.kind === "shift")).toBe(true)
    expect(frames.some((f) => f.sub.kind === "compare")).toBe(false)
  })
})
