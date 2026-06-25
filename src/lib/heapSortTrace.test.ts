import { describe, it, expect } from "vitest"
import { buildHeapSortTrace, MAX_HEAP_CODE, MIN_HEAP_CODE } from "@/lib/heapSortTrace"
import {
  HEAP_INTRO,
  HEAP_INTRO_SORTED_ASC,
  HEAP_INTRO_SORTED_DESC,
} from "@/lib/exampleHeapSort"

describe("buildHeapSortTrace (max-купа, asc)", () => {
  const trace = buildHeapSortTrace(HEAP_INTRO, "asc")

  it("39 кадрів; перший init, останній done (усе зелене)", () => {
    expect(trace.frames.length).toBe(39)
    expect(trace.frames[0].phase).toBe("init")
    const last = trace.frames[trace.frames.length - 1]
    expect(last.phase).toBe("done")
    expect(last.sortedAll).toBe(true)
    expect(last.heapSize).toBe(0)
  })

  it("результат і лічильники — еталон (14 / 10)", () => {
    expect(trace.result.sorted).toEqual([...HEAP_INTRO_SORTED_ASC])
    expect(trace.result.comparisons).toBe(14)
    expect(trace.result.swaps).toBe(10)
    expect(trace.code).toBe(MAX_HEAP_CODE)
  })

  it("є фаза побудови й фаза сортування; extract має isExtract", () => {
    expect(trace.frames.some((f) => f.stage === "build")).toBe(true)
    expect(trace.frames.some((f) => f.stage === "sort")).toBe(true)
    const extract = trace.frames.find((f) => f.phase === "extract")!
    expect(extract.isExtract).toBe(true)
    expect(extract.swapA).toBe(0)
    expect(extract.swapB).not.toBeNull()
  })

  it("усі кадри мають нарацію; розмір купи не зростає по ходу", () => {
    let prev = Infinity
    for (const f of trace.frames) {
      expect(f.caption.length).toBeGreaterThan(0)
      expect(f.heapSize).toBeLessThanOrEqual(prev)
      prev = f.heapSize
    }
  })

  it("кадри порівняння несуть compareChild; обміну — пару swapA/swapB", () => {
    const cmp = trace.frames.find((f) => f.phase === "compare")!
    expect(cmp.compareChild).not.toBeNull()
    const swap = trace.frames.find((f) => f.phase === "swap")!
    expect(swap.swapA).not.toBeNull()
    expect(swap.swapB).not.toBeNull()
  })
})

describe("buildHeapSortTrace — напрям впливає на лістинг і результат", () => {
  it("min-купа (desc): [13,12,11,7,6,5], 16 / 13, лістинг MIN_HEAP_CODE", () => {
    const trace = buildHeapSortTrace(HEAP_INTRO, "desc")
    expect(trace.result.sorted).toEqual([...HEAP_INTRO_SORTED_DESC])
    expect(trace.result.comparisons).toBe(16)
    expect(trace.result.swaps).toBe(13)
    expect(trace.code).toBe(MIN_HEAP_CODE)
  })
})

describe("лістинги коду", () => {
  it("max-купа порівнює '>', min-купа — '<'; обидва мають heapify і дві фази", () => {
    expect(MAX_HEAP_CODE.some((l) => l.includes("a[l] > a[largest]"))).toBe(true)
    expect(MIN_HEAP_CODE.some((l) => l.includes("a[l] < a[smallest]"))).toBe(true)
    for (const code of [MAX_HEAP_CODE, MIN_HEAP_CODE]) {
      expect(code.some((l) => l.includes("def heapify"))).toBe(true)
      expect(code.some((l) => l.includes("for end in range"))).toBe(true)
      expect(code.length).toBe(19)
    }
  })
})
