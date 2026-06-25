import { describe, it, expect } from "vitest"
import { heapNodeRole, barHeightPct, type HeapNodeState } from "@/algorithms/heap-sort/playback/highlight"

const base: HeapNodeState = {
  heapSize: 6,
  siftNode: null,
  compareChild: null,
  swapA: null,
  swapB: null,
  isExtract: false,
  sortedAll: false,
}

describe("heapNodeRole", () => {
  it("фінал — усе відсортовано", () => {
    const s = { ...base, sortedAll: true }
    expect(heapNodeRole(0, s)).toBe("sorted")
    expect(heapNodeRole(5, s)).toBe("sorted")
  })

  it("індекси поза купою — відсортовані", () => {
    const s = { ...base, heapSize: 4 }
    expect(heapNodeRole(4, s)).toBe("sorted")
    expect(heapNodeRole(5, s)).toBe("sorted")
    expect(heapNodeRole(3, s)).toBe("heap")
  })

  it("корінь у спокої — root; решта купи — heap", () => {
    expect(heapNodeRole(0, base)).toBe("root")
    expect(heapNodeRole(3, base)).toBe("heap")
  })

  it("просіювання: батько — sift (кільце), дитина — compare (жовта)", () => {
    const s = { ...base, siftNode: 1, compareChild: 4 }
    expect(heapNodeRole(1, s)).toBe("sift")
    expect(heapNodeRole(4, s)).toBe("compare")
  })

  it("обмін: обидва елементи пари — swap (червоні)", () => {
    const s = { ...base, siftNode: 1, swapA: 1, swapB: 4 }
    expect(heapNodeRole(1, s)).toBe("swap")
    expect(heapNodeRole(4, s)).toBe("swap")
  })

  it("extract: корінь і нова межа — extract (фіолетові), решта поза купою — sorted", () => {
    const s = { ...base, heapSize: 5, isExtract: true, swapA: 0, swapB: 5 }
    expect(heapNodeRole(0, s)).toBe("extract")
    expect(heapNodeRole(5, s)).toBe("extract") // показуємо ДО межі купи
    // інший уже відсортований елемент (поза купою, не з пари) — sorted
    expect(heapNodeRole(0, { ...s, heapSize: 5, swapA: 0, swapB: 4 })).toBe("extract")
  })
})

describe("barHeightPct", () => {
  it("частка від максимуму, не менша за мінімум", () => {
    expect(barHeightPct(10, 10)).toBe(100)
    expect(barHeightPct(5, 10)).toBe(50)
    expect(barHeightPct(0, 10)).toBe(8)
    expect(barHeightPct(1, 0)).toBe(8)
  })
})
