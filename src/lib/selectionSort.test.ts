import { describe, it, expect } from "vitest"
import {
  selectionSort,
  selectionSortStable,
  selectionSortSteps,
  countOperations,
  maxComparisons,
  isSorted,
} from "@/lib/selectionSort"
import {
  SELECTION_INTRO,
  SELECTION_INTRO_SORTED,
  SELECTION_BEST,
  SELECTION_WORST,
  SELECTION_CONSPECT,
} from "@/lib/exampleSelectionSort"

describe("selectionSort (стандартна, обмін)", () => {
  it("сортує головний приклад [5,3,8,4,2,7] → [2,3,4,5,7,8]", () => {
    expect(selectionSort(SELECTION_INTRO)).toEqual([...SELECTION_INTRO_SORTED])
  })

  it("не змінює вхідний масив (працює над копією)", () => {
    const input = [...SELECTION_INTRO]
    selectionSort(input)
    expect(input).toEqual([...SELECTION_INTRO])
  })

  it("вже відсортований / зворотний / порожній / один елемент", () => {
    expect(selectionSort(SELECTION_BEST)).toEqual([1, 2, 3, 4, 5, 6])
    expect(selectionSort(SELECTION_WORST)).toEqual([1, 2, 3, 4, 5, 6])
    expect(selectionSort([])).toEqual([])
    expect(selectionSort([42])).toEqual([42])
  })
})

describe("selectionSortStable (зсув) — той самий порядок значень", () => {
  it("дає ідентичний відсортований масив, що й стандартна версія", () => {
    for (const arr of [SELECTION_INTRO, SELECTION_BEST, SELECTION_WORST, SELECTION_CONSPECT]) {
      expect(selectionSortStable(arr)).toEqual(selectionSort(arr))
    }
  })
})

describe("countOperations — еталон коректності з README", () => {
  it("стандартна: [5,3,8,4,2,7] → 15 порівнянь, 4 обміни, 6 проходів", () => {
    expect(countOperations(SELECTION_INTRO)).toEqual({
      comparisons: 15,
      swaps: 4,
      writes: 0,
      passes: 6,
    })
  })

  it("стабільна: [5,3,8,4,2,7] → ті самі 15 порівнянь, але 14 записів (ціна стабільності)", () => {
    const c = countOperations(SELECTION_INTRO, true)
    expect(c.comparisons).toBe(15)
    expect(c.writes).toBe(14)
    expect(c.swaps).toBe(0)
  })

  it("НЕ адаптивний: порівнянь завжди рівно n(n−1)/2 незалежно від входу", () => {
    for (const arr of [SELECTION_INTRO, SELECTION_BEST, SELECTION_WORST]) {
      expect(countOperations(arr).comparisons).toBe(maxComparisons(arr.length))
    }
  })

  it("найкращий [1..6]: 0 обмінів (мінімум уже на місці); гірший [6..1]: 3 обміни — обидва ≤ n−1", () => {
    expect(countOperations(SELECTION_BEST).swaps).toBe(0)
    expect(countOperations(SELECTION_WORST).swaps).toBe(3)
    expect(countOperations(SELECTION_WORST).swaps).toBeLessThanOrEqual(
      SELECTION_WORST.length - 1,
    )
  })

  it("конспект [5,3,8,4,2]: 10 порівнянь, 3 обміни", () => {
    expect(countOperations(SELECTION_CONSPECT)).toMatchObject({
      comparisons: 10,
      swaps: 3,
      passes: 5,
    })
  })

  it("стабільна робить БІЛЬШЕ записів, ніж стандартна — обмінів (O(n²) проти O(n))", () => {
    expect(countOperations(SELECTION_WORST, true).writes).toBeGreaterThan(
      countOperations(SELECTION_WORST).swaps,
    )
  })
})

describe("selectionSortSteps — журнал подій", () => {
  it("стандартна [5,3,8,4,2,7] дає 29 подій: init → (passStart→compare*→swap)* → final", () => {
    const { sorted, events } = selectionSortSteps(SELECTION_INTRO)
    expect(events.length).toBe(29)
    expect(events[0].kind).toBe("init")
    expect(events[events.length - 1].kind).toBe("final")
    expect(sorted).toEqual([...SELECTION_INTRO_SORTED])
  })

  it("лічильники монотонно не спадають", () => {
    const { events } = selectionSortSteps(SELECTION_INTRO)
    for (let i = 1; i < events.length; i++) {
      expect(events[i].comparisons).toBeGreaterThanOrEqual(events[i - 1].comparisons)
      expect(events[i].swaps).toBeGreaterThanOrEqual(events[i - 1].swaps)
    }
  })

  it("самообмін (min_idx == i) позначено selfSwap і не рахується в обмінах", () => {
    const { events } = selectionSortSteps(SELECTION_INTRO)
    const selfSwaps = events.filter((e) => e.kind === "swap" && e.selfSwap)
    expect(selfSwaps.length).toBe(2) // проходи 1 і 5
  })

  it("стабільна версія: 0 обмінів, writes росте; усі компоненти на місцях", () => {
    const { sorted, events } = selectionSortSteps(SELECTION_INTRO, true)
    const last = events[events.length - 1]
    expect(last.swaps).toBe(0)
    expect(last.writes).toBe(14)
    expect(sorted).toEqual([...SELECTION_INTRO_SORTED])
    expect(events.some((e) => e.kind === "shift")).toBe(true)
    expect(events.some((e) => e.kind === "place")).toBe(true)
  })
})

describe("isSorted / maxComparisons", () => {
  it("isSorted", () => {
    expect(isSorted([1, 2, 3])).toBe(true)
    expect(isSorted([1, 3, 2])).toBe(false)
    expect(isSorted([])).toBe(true)
  })

  it("maxComparisons = n(n−1)/2", () => {
    expect(maxComparisons(6)).toBe(15)
    expect(maxComparisons(1)).toBe(0)
  })
})
