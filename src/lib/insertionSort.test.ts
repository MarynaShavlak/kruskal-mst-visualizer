import { describe, it, expect } from "vitest"
import {
  insertionSort,
  insertionSortBinary,
  insertionSortSteps,
  countOperations,
  isSorted,
  maxComparisons,
} from "@/lib/insertionSort"
import {
  INSERTION_INTRO,
  INSERTION_INTRO_SORTED,
  INSERTION_INTRO_STATS,
  INSERTION_BEST,
  INSERTION_WORST,
} from "@/lib/exampleInsertionSort"
import { randomArray } from "@/lib/randomArray"

describe("insertionSort / insertionSortBinary: коректність", () => {
  it("головний приклад [5,2,4,6,1,3] → [1,2,3,4,5,6]", () => {
    expect(insertionSort(INSERTION_INTRO)).toEqual([...INSERTION_INTRO_SORTED])
    expect(insertionSortBinary(INSERTION_INTRO)).toEqual([...INSERTION_INTRO_SORTED])
  })

  it("не змінює вхідний масив (працює над копією)", () => {
    const input = [...INSERTION_INTRO]
    insertionSort(input)
    insertionSortBinary(input)
    expect(input).toEqual([...INSERTION_INTRO])
  })

  it("обидві версії = Array.prototype.sort на серії випадкових масивів", () => {
    for (let seed = 1; seed <= 30; seed++) {
      const arr = randomArray({ count: 9, seed })
      const expected = [...arr].sort((a, b) => a - b)
      expect(insertionSort(arr)).toEqual(expected)
      expect(insertionSortBinary(arr)).toEqual(expected)
      expect(insertionSortSteps(arr).sorted).toEqual(expected)
      expect(insertionSortSteps(arr, true).sorted).toEqual(expected)
    }
  })

  it("крайові випадки: порожній, одноелементний, усі однакові", () => {
    expect(insertionSort([])).toEqual([])
    expect(insertionSortBinary([])).toEqual([])
    expect(insertionSort([42])).toEqual([42])
    expect(insertionSortBinary([7, 7, 7, 7])).toEqual([7, 7, 7, 7])
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
  it("лінійна на [5,2,4,6,1,3]: 12 порівнянь, 9 зсувів, 5 вставок", () => {
    expect(countOperations(INSERTION_INTRO, false)).toEqual({
      comparisons: INSERTION_INTRO_STATS.comparisons,
      shifts: INSERTION_INTRO_STATS.shifts,
      insertions: INSERTION_INTRO_STATS.insertions,
    })
  })

  it("найкращий випадок [1..6]: лінійна 5/0/5 (адаптивність), бінарна 8/0/5", () => {
    expect(countOperations(INSERTION_BEST, false)).toEqual({
      comparisons: 5,
      shifts: 0,
      insertions: 5,
    })
    expect(countOperations(INSERTION_BEST, true)).toEqual({
      comparisons: 8,
      shifts: 0,
      insertions: 5,
    })
  })

  it("гірший випадок [6..1]: лінійна 15/15, бінарна 11/15 (зсувів стільки ж)", () => {
    expect(countOperations(INSERTION_WORST, false)).toEqual({
      comparisons: 15,
      shifts: 15,
      insertions: 5,
    })
    expect(countOperations(INSERTION_WORST, true)).toEqual({
      comparisons: 11,
      shifts: 15,
      insertions: 5,
    })
  })

  it("бінарна не змінює кількості ЗСУВІВ — лише пошук місця інший", () => {
    for (let seed = 1; seed <= 20; seed++) {
      const arr = randomArray({ count: 10, seed })
      const lin = countOperations(arr, false)
      const bin = countOperations(arr, true)
      expect(bin.shifts).toBe(lin.shifts)
      expect(bin.insertions).toBe(lin.insertions)
    }
  })

  it("лінійна завжди робить рівно n-1 вставок", () => {
    for (let seed = 1; seed <= 20; seed++) {
      const arr = randomArray({ count: 8, seed })
      expect(countOperations(arr, false).insertions).toBe(7)
    }
  })
})

describe("insertionSortSteps: структура журналу (лінійна)", () => {
  it("починається з init, завершується final; масив у final відсортовано", () => {
    const { sorted, events } = insertionSortSteps(INSERTION_INTRO, false)
    expect(events[0].kind).toBe("init")
    expect(events[0].array).toEqual([...INSERTION_INTRO])
    const last = events[events.length - 1]
    expect(last.kind).toBe("final")
    expect(last.array).toEqual([...INSERTION_INTRO_SORTED])
    expect(sorted).toEqual([...INSERTION_INTRO_SORTED])
  })

  it("на [5,2,4,6,1,3] лінійна: 24 події; n-1 take та n-1 insert", () => {
    const { events } = insertionSortSteps(INSERTION_INTRO, false)
    expect(events.length).toBe(24)
    expect(events.filter((e) => e.kind === "take").length).toBe(5)
    expect(events.filter((e) => e.kind === "insert").length).toBe(5)
  })

  it("лічильники зростають монотонно; зсув ⇔ key < compared", () => {
    const { events } = insertionSortSteps(INSERTION_INTRO, false)
    let prevC = 0
    let prevS = 0
    for (const e of events) {
      expect(e.comparisons).toBeGreaterThanOrEqual(prevC)
      expect(e.shifts).toBeGreaterThanOrEqual(prevS)
      prevC = e.comparisons
      prevS = e.shifts
      if (e.kind === "compare") {
        expect(e.shifted).toBe((e.key ?? 0) < e.compared)
      }
    }
  })

  it("стабільність: рівні ключі ніколи не зсувають одне одного", () => {
    const { events } = insertionSortSteps([3, 3, 1, 2, 1], false)
    for (const e of events) {
      if (e.kind === "compare" && e.key === e.compared) {
        expect(e.shifted).toBe(false)
      }
    }
  })

  it("prefixLen не спадає (відсортований префікс лише росте)", () => {
    const { events } = insertionSortSteps(INSERTION_INTRO, false)
    let prev = 0
    for (const e of events) {
      expect(e.prefixLen).toBeGreaterThanOrEqual(prev)
      prev = e.prefixLen
    }
    expect(prev).toBe(INSERTION_INTRO.length)
  })
})

describe("insertionSortSteps: структура журналу (бінарна)", () => {
  it("події probe/shift; кількість probe = порівнянням, shift = зсувам", () => {
    const { events } = insertionSortSteps(INSERTION_WORST, true)
    const probes = events.filter((e) => e.kind === "probe").length
    const shifts = events.filter((e) => e.kind === "shift").length
    const last = events[events.length - 1]
    expect(probes).toBe(last.comparisons)
    expect(shifts).toBe(last.shifts)
    expect(probes).toBe(11)
    expect(shifts).toBe(15)
  })

  it("кожна ітерація має рівно одну подію take та insert", () => {
    const { events } = insertionSortSteps(INSERTION_INTRO, true)
    expect(events.filter((e) => e.kind === "take").length).toBe(5)
    expect(events.filter((e) => e.kind === "insert").length).toBe(5)
    expect(events.some((e) => e.kind === "compare")).toBe(false) // бінарна не дає compare
  })
})
