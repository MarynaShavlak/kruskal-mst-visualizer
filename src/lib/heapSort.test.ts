import { describe, it, expect } from "vitest"
import {
  heapSort,
  heapSortSteps,
  countOperations,
  parentOf,
  leftOf,
  rightOf,
  depthOf,
  heapLevels,
  isSorted,
} from "@/lib/heapSort"
import {
  HEAP_INTRO,
  HEAP_INTRO_SORTED_ASC,
  HEAP_INTRO_SORTED_DESC,
  HEAP_INTRO_STATS,
  HEAP_SORTED,
  HEAP_REVERSED,
  HEAP_DUPLICATES,
} from "@/lib/exampleHeapSort"

describe("heapSort — коректність", () => {
  it("еталон конспекту: max-купа (asc) [12,11,13,5,6,7] → [5,6,7,11,12,13]", () => {
    expect(heapSort(HEAP_INTRO, "asc")).toEqual([...HEAP_INTRO_SORTED_ASC])
  })

  it("min-купа (desc) [12,11,13,5,6,7] → [13,12,11,7,6,5]", () => {
    expect(heapSort(HEAP_INTRO, "desc")).toEqual([...HEAP_INTRO_SORTED_DESC])
  })

  it("збігається з рідним сортуванням на різних входах (asc і desc)", () => {
    const inputs = [
      [...HEAP_SORTED],
      [...HEAP_REVERSED],
      [...HEAP_DUPLICATES],
      [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5],
      [42],
      [],
    ]
    for (const arr of inputs) {
      expect(heapSort(arr, "asc")).toEqual([...arr].sort((a, b) => a - b))
      expect(heapSort(arr, "desc")).toEqual([...arr].sort((a, b) => b - a))
    }
  })

  it("не мутує вхід", () => {
    const arr = [...HEAP_INTRO]
    heapSort(arr, "asc")
    expect(arr).toEqual([...HEAP_INTRO])
  })
})

describe("індекси купи (масив як двійкове дерево)", () => {
  it("батько / ліва / права дитина", () => {
    expect(leftOf(0)).toBe(1)
    expect(rightOf(0)).toBe(2)
    expect(parentOf(1)).toBe(0)
    expect(parentOf(2)).toBe(0)
    expect(leftOf(2)).toBe(5)
    expect(rightOf(2)).toBe(6)
    expect(parentOf(6)).toBe(2)
  })

  it("глибина вузла ⌊log₂(i+1)⌋", () => {
    expect(depthOf(0)).toBe(0)
    expect(depthOf(1)).toBe(1)
    expect(depthOf(2)).toBe(1)
    expect(depthOf(3)).toBe(2)
    expect(depthOf(6)).toBe(2)
  })

  it("рівні дерева [[0],[1,2],[3,4,5,6],…]", () => {
    expect(heapLevels(6)).toEqual([[0], [1, 2], [3, 4, 5]])
    expect(heapLevels(7)).toEqual([[0], [1, 2], [3, 4, 5, 6]])
    expect(heapLevels(0)).toEqual([])
  })
})

describe("heapSortSteps — журнал подій", () => {
  it("еталонні лічильники збігаються з HEAP_INTRO_STATS", () => {
    expect(countOperations(HEAP_INTRO, "asc")).toEqual(HEAP_INTRO_STATS.asc)
    expect(countOperations(HEAP_INTRO, "desc")).toEqual(HEAP_INTRO_STATS.desc)
  })

  it("НЕадаптивність: «вже відсортований» потребує не менше роботи, ніж зворотний", () => {
    const sortedCost = countOperations(HEAP_SORTED, "asc")
    const reversedCost = countOperations(HEAP_REVERSED, "asc")
    // Контрінтуїтивно: зростаючий масив — це min-купа, max-купу треба будувати з нуля.
    expect(sortedCost.swaps).toBeGreaterThanOrEqual(reversedCost.swaps)
  })

  it("перша подія init, остання final; розмір купи не зростає", () => {
    const { events } = heapSortSteps(HEAP_INTRO, "asc")
    expect(events[0].kind).toBe("init")
    expect(events[events.length - 1].kind).toBe("final")
    let prev = Infinity
    for (const e of events) {
      if (e.stage === "sort" && e.kind === "extract") {
        expect(e.heapSize).toBeLessThanOrEqual(prev)
        prev = e.heapSize
      }
    }
  })

  it("лічильники монотонні; кінцевий масив відсортований", () => {
    const { sorted, events } = heapSortSteps(HEAP_DUPLICATES, "asc")
    let c = 0
    let s = 0
    for (const e of events) {
      expect(e.comparisons).toBeGreaterThanOrEqual(c)
      expect(e.swaps).toBeGreaterThanOrEqual(s)
      c = e.comparisons
      s = e.swaps
    }
    expect(isSorted(sorted)).toBe(true)
  })
})
