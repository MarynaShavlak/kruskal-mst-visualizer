import { describe, it, expect } from "vitest"
import {
  buildBubbleSortTrace,
  NAIVE_CODE,
  OPTIMIZED_CODE,
} from "@/lib/bubbleSortTrace"
import { bubbleSort, countOperations } from "@/lib/bubbleSort"
import {
  BUBBLE_INTRO,
  BUBBLE_INTRO_SORTED,
  BUBBLE_BEST,
} from "@/lib/exampleBubbleSort"

describe("buildBubbleSortTrace: результат збігається з чистим ядром", () => {
  it("наївна на [5,1,4,2,8,3]: sorted/comparisons/swaps/passes", () => {
    const { result } = buildBubbleSortTrace(BUBBLE_INTRO, false)
    const counts = countOperations(BUBBLE_INTRO, false)
    expect(result.sorted).toEqual([...BUBBLE_INTRO_SORTED])
    expect(result.sorted).toEqual(bubbleSort(BUBBLE_INTRO))
    expect(result.comparisons).toBe(counts.comparisons)
    expect(result.swaps).toBe(counts.swaps)
    expect(result.passes).toBe(counts.passes)
    expect(result.maxComparisons).toBe(15)
    expect(result.size).toBe(6)
  })

  it("обирає лістинг коду за режимом", () => {
    expect(buildBubbleSortTrace(BUBBLE_INTRO, false).code).toBe(NAIVE_CODE)
    expect(buildBubbleSortTrace(BUBBLE_INTRO, true).code).toBe(OPTIMIZED_CODE)
  })
})

describe("buildBubbleSortTrace: структура кадрів", () => {
  it("init → … → done; індекси послідовні", () => {
    const { frames } = buildBubbleSortTrace(BUBBLE_INTRO, false)
    expect(frames[0].sub.kind).toBe("init")
    expect(frames[0].phase).toBe("scan")
    const last = frames[frames.length - 1]
    expect(last.sub.kind).toBe("done")
    expect(last.phase).toBe("done")
    frames.forEach((f, i) => expect(f.i).toBe(i))
  })

  it("на [5,1,4,2,8,3] наївна: 22 кадри", () => {
    const { frames } = buildBubbleSortTrace(BUBBLE_INTRO, false)
    expect(frames.length).toBe(22)
  })

  it("кадри-порівняння несуть пару [j, j+1]", () => {
    const { frames } = buildBubbleSortTrace(BUBBLE_INTRO, false)
    for (const f of frames) {
      if (f.sub.kind === "compare") {
        expect(f.pair).toEqual([f.sub.j, f.sub.j + 1])
      } else {
        expect(f.pair).toBeNull()
      }
    }
  })

  it("кадри з обміном мають swapped=true і збігаються з sub.swapped", () => {
    const { frames } = buildBubbleSortTrace(BUBBLE_INTRO, false)
    for (const f of frames) {
      if (f.sub.kind === "compare") {
        expect(f.swapped).toBe(f.sub.swapped)
      }
    }
  })

  it("останній кадр несе відсортований масив", () => {
    const { frames } = buildBubbleSortTrace(BUBBLE_INTRO, false)
    expect(frames[frames.length - 1].array).toEqual([...BUBBLE_INTRO_SORTED])
  })

  it("оптимізована на [1..6]: є кадр early-stop, один pass-end", () => {
    const { frames, result } = buildBubbleSortTrace(BUBBLE_BEST, true)
    expect(frames.some((f) => f.sub.kind === "early-stop")).toBe(true)
    expect(frames.filter((f) => f.sub.kind === "pass-end").length).toBe(1)
    expect(result.passes).toBe(1)
    expect(result.comparisons).toBe(5)
  })
})
