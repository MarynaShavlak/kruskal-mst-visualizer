import { describe, it, expect } from "vitest"
import {
  bubbleSort,
  bubbleSortOptimized,
  bubbleSortSteps,
  countOperations,
  isSorted,
  maxComparisons,
} from "@/lib/bubbleSort"
import {
  BUBBLE_INTRO,
  BUBBLE_INTRO_SORTED,
  BUBBLE_INTRO_STATS,
  BUBBLE_BEST,
  BUBBLE_WORST,
} from "@/lib/exampleBubbleSort"
import { randomArray } from "@/lib/randomArray"

describe("bubbleSort / bubbleSortOptimized: коректність", () => {
  it("головний приклад [5,1,4,2,8,3] → [1,2,3,4,5,8]", () => {
    expect(bubbleSort(BUBBLE_INTRO)).toEqual([...BUBBLE_INTRO_SORTED])
    expect(bubbleSortOptimized(BUBBLE_INTRO)).toEqual([...BUBBLE_INTRO_SORTED])
  })

  it("не змінює вхідний масив (працює над копією)", () => {
    const input = [...BUBBLE_INTRO]
    bubbleSort(input)
    bubbleSortOptimized(input)
    expect(input).toEqual([...BUBBLE_INTRO])
  })

  it("обидві версії дають той самий результат, що й Array.prototype.sort", () => {
    for (let seed = 1; seed <= 30; seed++) {
      const arr = randomArray({ count: 8, seed })
      const expected = [...arr].sort((a, b) => a - b)
      expect(bubbleSort(arr)).toEqual(expected)
      expect(bubbleSortOptimized(arr)).toEqual(expected)
    }
  })

  it("крайові випадки: порожній і одноелементний масиви", () => {
    expect(bubbleSort([])).toEqual([])
    expect(bubbleSortOptimized([])).toEqual([])
    expect(bubbleSort([42])).toEqual([42])
  })
})

describe("isSorted / maxComparisons", () => {
  it("isSorted", () => {
    expect(isSorted([1, 2, 3])).toBe(true)
    expect(isSorted([1, 1, 2])).toBe(true)
    expect(isSorted([2, 1])).toBe(false)
    expect(isSorted([])).toBe(true)
  })

  it("maxComparisons = n(n-1)/2", () => {
    expect(maxComparisons(6)).toBe(15)
    expect(maxComparisons(10)).toBe(45)
    expect(maxComparisons(1)).toBe(0)
  })
})

describe("countOperations: еталонні числа з README", () => {
  it("наївна на [5,1,4,2,8,3]: 15 порівнянь, 7 обмінів, 5 проходів", () => {
    expect(countOperations(BUBBLE_INTRO, false)).toEqual({
      comparisons: BUBBLE_INTRO_STATS.comparisons,
      swaps: BUBBLE_INTRO_STATS.swaps,
      passes: BUBBLE_INTRO_STATS.passes,
    })
  })

  it("найкращий випадок [1..6]: наївна 15/0/5, оптимізована 5/0/1", () => {
    expect(countOperations(BUBBLE_BEST, false)).toEqual({
      comparisons: 15,
      swaps: 0,
      passes: 5,
    })
    expect(countOperations(BUBBLE_BEST, true)).toEqual({
      comparisons: 5,
      swaps: 0,
      passes: 1,
    })
  })

  it("гірший випадок [6..1]: 15 порівнянь і 15 обмінів в обох версіях", () => {
    expect(countOperations(BUBBLE_WORST, false)).toEqual({
      comparisons: 15,
      swaps: 15,
      passes: 5,
    })
    expect(countOperations(BUBBLE_WORST, true)).toEqual({
      comparisons: 15,
      swaps: 15,
      passes: 5,
    })
  })

  it("наївна завжди робить n(n-1)/2 порівнянь незалежно від входу", () => {
    for (let seed = 1; seed <= 20; seed++) {
      const arr = randomArray({ count: 7, seed })
      expect(countOperations(arr, false).comparisons).toBe(maxComparisons(7))
    }
  })
})

describe("bubbleSortSteps: структура журналу", () => {
  it("починається з init, завершується final; масив у final відсортовано", () => {
    const { sorted, events } = bubbleSortSteps(BUBBLE_INTRO, false)
    expect(events[0].kind).toBe("init")
    const last = events[events.length - 1]
    expect(last.kind).toBe("final")
    expect(last.array).toEqual([...BUBBLE_INTRO_SORTED])
    expect(sorted).toEqual([...BUBBLE_INTRO_SORTED])
  })

  it("на [5,1,4,2,8,3] наївна: 22 події (1 init + 15 compare + 5 pass-end + 1 final)", () => {
    const { events } = bubbleSortSteps(BUBBLE_INTRO, false)
    expect(events.length).toBe(22)
    expect(events.filter((e) => e.kind === "compare").length).toBe(15)
    expect(events.filter((e) => e.kind === "pass-end").length).toBe(5)
    expect(events.filter((e) => e.kind === "early-stop").length).toBe(0)
  })

  it("лічильник порівнянь монотонно зростає на 1 щокроку", () => {
    const { events } = bubbleSortSteps(BUBBLE_INTRO, false)
    let comparisons = 0
    for (const e of events) {
      if (e.kind === "compare") comparisons += 1
      expect(e.comparisons).toBe(comparisons)
    }
  })

  it("обмін лише за строгої нерівності (стабільність: рівні не міняються)", () => {
    const { events } = bubbleSortSteps([3, 3, 1, 2], false)
    for (const e of events) {
      if (e.kind === "compare" && e.left === e.right) {
        expect(e.swapped).toBe(false)
      }
    }
  })

  it("оптимізована на [1..6] зупиняється після першого проходу (early-stop)", () => {
    const { events } = bubbleSortSteps(BUBBLE_BEST, true)
    expect(events.filter((e) => e.kind === "pass-end").length).toBe(1)
    expect(events.filter((e) => e.kind === "early-stop").length).toBe(1)
  })

  it("sortedFrom не зростає (хвіст лише росте вліво)", () => {
    const { events } = bubbleSortSteps(BUBBLE_INTRO, false)
    let prev = Infinity
    for (const e of events) {
      expect(e.sortedFrom).toBeLessThanOrEqual(prev)
      prev = e.sortedFrom
    }
    expect(prev).toBe(0)
  })
})
