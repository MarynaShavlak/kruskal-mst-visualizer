import { describe, it, expect } from "vitest"
import {
  buildSelectionSortTrace,
  STANDARD_CODE,
  STABLE_CODE,
} from "@/lib/selectionSortTrace"
import { SELECTION_INTRO, SELECTION_INTRO_SORTED } from "@/lib/exampleSelectionSort"

describe("buildSelectionSortTrace (стандартна)", () => {
  const trace = buildSelectionSortTrace(SELECTION_INTRO)

  it("кадри 1:1 з подіями: 29 кадрів, init … done", () => {
    expect(trace.frames.length).toBe(29)
    expect(trace.frames[0].sub.kind).toBe("init")
    expect(trace.frames[trace.frames.length - 1].sub.kind).toBe("done")
    expect(trace.code).toBe(STANDARD_CODE)
  })

  it("кадр 1 — початок проходу 0 (min_idx=0); кадр 2 — порівняння з новим мінімумом", () => {
    expect(trace.frames[1].sub.kind).toBe("passStart")
    const cmp = trace.frames[2].sub
    expect(cmp.kind).toBe("compare")
    if (cmp.kind === "compare") expect(cmp.newMin).toBe(true) // 3 < 5
  })

  it("кадр 7 — обмін наприкінці проходу 0 (мінімум став на місце)", () => {
    const sub = trace.frames[7].sub
    expect(sub.kind).toBe("swap")
    expect(trace.frames[7].placedAt).toBe(0)
    expect(trace.frames[7].sortedTo).toBe(1)
  })

  it("результат збігається з чистим сортуванням", () => {
    expect(trace.result.sorted).toEqual([...SELECTION_INTRO_SORTED])
    expect(trace.result.comparisons).toBe(15)
    expect(trace.result.swaps).toBe(4)
    expect(trace.result.passes).toBe(6)
    expect(trace.result.maxComparisons).toBe(15)
  })

  it("кожен кадр має непорожню нарацію; порівняння монотонні", () => {
    let prev = 0
    for (const f of trace.frames) {
      expect(f.caption.length).toBeGreaterThan(0)
      expect(f.comparisons).toBeGreaterThanOrEqual(prev)
      prev = f.comparisons
    }
  })
})

describe("buildSelectionSortTrace (стабільна)", () => {
  const trace = buildSelectionSortTrace(SELECTION_INTRO, true)

  it("використовує лістинг стабільної версії; 0 обмінів, 14 записів", () => {
    expect(trace.code).toBe(STABLE_CODE)
    expect(trace.result.swaps).toBe(0)
    expect(trace.result.writes).toBe(14)
    expect(trace.result.stable).toBe(true)
  })

  it("має кадри зсуву (з «діркою» та key у руці) і кадри вставки", () => {
    const shift = trace.frames.find((f) => f.sub.kind === "shift")
    expect(shift).toBeDefined()
    expect(shift?.hole).not.toBeNull()
    expect(shift?.keyValue).not.toBeNull()
    expect(trace.frames.some((f) => f.sub.kind === "place")).toBe(true)
  })

  it("сортує так само, як стандартна", () => {
    expect(trace.result.sorted).toEqual([...SELECTION_INTRO_SORTED])
  })
})
