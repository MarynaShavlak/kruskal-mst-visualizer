import { describe, it, expect } from "vitest"
import { mergeStateView, halfRole, barHeightPct } from "@/algorithms/merge-sort/playback/highlight"
import { mergeSteps } from "@/lib/mergeSort"

describe("mergeStateView", () => {
  it("стартовий стан (null): курсори на 0, результат порожній", () => {
    const v = mergeStateView([2, 4], [1, 3], null)
    expect(v.leftCursor).toBe(0)
    expect(v.rightCursor).toBe(0)
    expect(v.merged).toEqual([])
    expect(v.left[0].role).toBe("head")
  })

  it("після кроку «беремо з правої»: голова правої — 🟡, остання merged підсвічена", () => {
    const { steps } = mergeSteps([2, 4], [1, 3])
    // перший крок: 2 > 1 → беремо 1 з правої
    const v = mergeStateView([2, 4], [1, 3], steps[0])
    expect(steps[0].took).toBe("right")
    expect(v.right[0].role).toBe("head")
    expect(v.merged[v.merged.length - 1]).toEqual({ value: 1, head: true })
  })

  it("спожиті комірки позначаються до голови", () => {
    const { steps } = mergeSteps([1, 2], [3])
    // крок 2: беремо 2 з лівої (headLeft=1) → комірка 0 спожита
    const v = mergeStateView([1, 2], [3], steps[1])
    expect(v.left[0].role).toBe("spent")
  })

  it("курсор -1, коли половину вичерпано", () => {
    const { steps } = mergeSteps([1], [2, 3])
    // останній крок доливає 3 з правої; ліва давно вичерпана
    const last = steps[steps.length - 1]
    const v = mergeStateView([1], [2, 3], last)
    expect(v.leftCursor).toBe(-1)
  })
})

describe("halfRole / barHeightPct", () => {
  it("halfRole ділить за mid", () => {
    expect(halfRole(0, 2)).toBe("left")
    expect(halfRole(1, 2)).toBe("left")
    expect(halfRole(2, 2)).toBe("right")
  })

  it("barHeightPct масштабує з мінімумом", () => {
    expect(barHeightPct(8, 8)).toBe(100)
    expect(barHeightPct(0, 8)).toBe(8)
    expect(barHeightPct(4, 0)).toBe(8)
  })
})
