import { describe, it, expect } from "vitest"
import {
  binarySearch,
  binarySearchRecursive,
  lowerBound,
  upperBound,
  isSorted,
  binarySearchSteps,
  countSteps,
  caseAnalysis,
} from "@/lib/binarySearch"
import {
  BS_INTRO,
  BS_CONSPECT,
  BS_FOUR_STEPS,
  BS_BEST,
  BS_ABSENT,
  BS_DUPLICATES,
} from "@/lib/exampleBinarySearch"

const MAIN = [1, 3, 5, 8, 10, 12, 15, 18, 20, 22, 24]
const DUP = [1, 2, 2, 2, 3, 4]
const SORTED_INSTANCES = [MAIN, DUP, [2, 3, 4, 10, 40], [7, 7, 7, 7], [42], [], [1, 5]]

const ref = (arr: number[], x: number) => arr.indexOf(x)

describe("binarySearch — індекс або -1 на відсортованих", () => {
  it("приклади з конспекту", () => {
    expect(binarySearch(MAIN, 15)).toBe(6)
    expect(binarySearch(BS_CONSPECT.values, 10)).toBe(3)
    expect(binarySearch(MAIN, 18)).toBe(7)
    expect(binarySearch(MAIN, 12)).toBe(5)
    expect(binarySearch(MAIN, 11)).toBe(-1) // відсутній
  })

  it("кожне наявне значення знаходиться; завідомо відсутні → -1", () => {
    for (const arr of SORTED_INSTANCES) {
      for (const x of new Set(arr)) {
        // при дублікатах binary_search дає ЯКИЙСЬ індекс збігу
        expect(arr[binarySearch(arr, x)]).toBe(x)
      }
      for (const x of [999, -999]) expect(binarySearch(arr, x)).toBe(-1)
    }
  })

  it("без дублікатів збігається з indexOf", () => {
    for (const x of MAIN) expect(binarySearch(MAIN, x)).toBe(ref(MAIN, x))
  })
})

describe("binarySearchRecursive — дослівно той самий результат", () => {
  it("збігається з binarySearch на всіх інстансах", () => {
    for (const arr of SORTED_INSTANCES) {
      for (const x of new Set([...arr, 999, -999])) {
        expect(binarySearchRecursive(arr, x)).toBe(binarySearch(arr, x))
      }
    }
  })
})

describe("lowerBound / upperBound (bisect) — дублікати", () => {
  it("DUPLICATES [1,2,2,2,3,4], x=2: lower 1, upper 4, count 3", () => {
    expect(lowerBound(DUP, 2)).toBe(1)
    expect(upperBound(DUP, 2)).toBe(4)
    expect(upperBound(DUP, 2) - lowerBound(DUP, 2)).toBe(3)
  })

  it("межі для відсутнього = точка вставки (lower == upper)", () => {
    expect(lowerBound(MAIN, 11)).toBe(5) // вставити 11 перед 12 (arr[5]=12)
    expect(upperBound(MAIN, 11)).toBe(5)
  })

  it("узгодженість: lowerBound <= upperBound; для наявного arr[lower] == x", () => {
    for (const arr of SORTED_INSTANCES) {
      for (const x of new Set(arr)) {
        const lo = lowerBound(arr, x)
        expect(lo).toBeLessThanOrEqual(upperBound(arr, x))
        expect(arr[lo]).toBe(x)
      }
    }
  })
})

describe("isSorted — передумова коректності", () => {
  it("розпізнає відсортовані / невідсортовані", () => {
    expect(isSorted(MAIN)).toBe(true)
    expect(isSorted(DUP)).toBe(true)
    expect(isSorted([3, 1, 2])).toBe(false)
    expect(isSorted([])).toBe(true)
    expect(isSorted([5])).toBe(true)
  })
})

describe("countSteps — еталон коректності з README", () => {
  it("INTRO 15 → 3 кроки; 18 → 4; 12 → 1 (найкращий); 11 → 4 (відсутній)", () => {
    expect(countSteps(MAIN, 15)).toBe(3)
    expect(countSteps(MAIN, 18)).toBe(4)
    expect(countSteps(MAIN, 12)).toBe(1)
    expect(countSteps(MAIN, 11)).toBe(4)
  })

  it("гірший випадок не перевищує ⌊log2 n⌋ + 1", () => {
    const worst = Math.floor(Math.log2(MAIN.length)) + 1
    for (const x of [...MAIN, 0, 100, 11, 13]) {
      expect(countSteps(MAIN, x)).toBeLessThanOrEqual(worst)
    }
  })
})

describe("binarySearchSteps — журнал подій узгоджений", () => {
  it("result, лічильник кроків, типи подій", () => {
    for (const arr of SORTED_INSTANCES) {
      for (const x of new Set([...arr, 999])) {
        const { result, events } = binarySearchSteps(arr, x)
        // при дублікатах — якийсь збіг; інакше indexOf
        if (result >= 0) expect(arr[result]).toBe(x)
        else expect(arr.includes(x)).toBe(false)
        expect(events[0].kind).toBe("init")
        expect(events[events.length - 1].kind).toBe("final")
        expect(events[events.length - 1].result).toBe(result)
        expect(events[0].array).toEqual(arr)
        const probes = events.filter((e) => e.kind === "probe").length
        const founds = events.filter((e) => e.kind === "found").length
        expect(founds).toBe(result >= 0 ? 1 : 0)
        expect(events[events.length - 1].steps).toBe(probes + founds)
        const verdicts = events
          .map((e) => e.kind)
          .filter((k) => k === "found" || k === "not_found")
        expect(verdicts.length).toBe(1)
        const counts = events.map((e) => e.steps)
        expect(counts).toEqual([...counts].sort((a, b) => a - b))
      }
    }
  })

  it("INTRO 15: probe lt/gt/eq + рішення right/left/found", () => {
    const { events } = binarySearchSteps(MAIN, 15)
    const probes = events.filter((e) => e.kind === "probe" || e.kind === "found")
    expect(probes.map((e) => e.mid)).toEqual([5, 8, 6])
    expect(probes.map((e) => e.compare)).toEqual(["lt", "gt", "eq"])
    expect(probes.map((e) => e.decision)).toEqual(["right", "left", "found"])
  })

  it("крайові: порожній масив → -1 (init, not_found, final)", () => {
    const { result, events } = binarySearchSteps([], 5)
    expect(result).toBe(-1)
    expect(events.map((e) => e.kind)).toEqual(["init", "not_found", "final"])
  })

  it("не змінює вхідний масив", () => {
    const arr = [...MAIN]
    binarySearchSteps(arr, 15)
    expect(arr).toEqual(MAIN)
  })
})

describe("caseAnalysis — аналіз випадків", () => {
  it("MAIN n=11: best 1, worst ⌊log2 11⌋+1=4, linear 11", () => {
    expect(caseAnalysis(MAIN)).toEqual({ n: 11, best: 1, worst: 4, linear: 11 })
  })

  it("порожній → нулі", () => {
    expect(caseAnalysis([])).toEqual({ n: 0, best: 0, worst: 0, linear: 0 })
  })

  it("еталонні інстанси сходяться зі своїми кроками", () => {
    expect(countSteps(BS_INTRO.values, BS_INTRO.target)).toBe(3)
    expect(countSteps(BS_FOUR_STEPS.values, BS_FOUR_STEPS.target)).toBe(4)
    expect(countSteps(BS_BEST.values, BS_BEST.target)).toBe(1)
    expect(countSteps(BS_ABSENT.values, BS_ABSENT.target)).toBe(4)
    expect(binarySearch(BS_DUPLICATES.values, BS_DUPLICATES.target)).toBe(2)
  })
})
