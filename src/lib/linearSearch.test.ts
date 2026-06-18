import { describe, it, expect } from "vitest"
import {
  linearSearch,
  existsInList,
  findAll,
  linearSearchSentinel,
  linearSearchSteps,
  countComparisons,
  caseAnalysis,
} from "@/lib/linearSearch"
import {
  LS_MAIN,
  LS_BEST,
  LS_WORST,
  LS_ABSENT,
  LS_DUPLICATES,
  LS_SORTED,
} from "@/lib/exampleLinearSearch"

const MAIN = [5, 3, 8, 1, 4]
const DUPLICATES = [4, 8, 3, 8, 1, 8]
const SORTED = [1, 3, 5, 7, 9, 11]
const ALL_EQUAL = [7, 7, 7, 7]
const WITH_NEG = [3, -2, 0, -5, 8, -2, 1]
const INSTANCES = [MAIN, DUPLICATES, SORTED, ALL_EQUAL, WITH_NEG, [42], [2, 1]]

const expectedIndex = (arr: number[], x: number) => arr.indexOf(x)

describe("linearSearch / existsInList — індекс або існування", () => {
  it("повертає правильний індекс або -1 (звірка з indexOf)", () => {
    for (const arr of INSTANCES) {
      for (const x of new Set(arr)) {
        expect(linearSearch(arr, x)).toBe(expectedIndex(arr, x))
      }
      for (const x of [999, -999]) expect(linearSearch(arr, x)).toBe(-1)
    }
  })

  it("приклади з конспекту", () => {
    expect(linearSearch(SORTED, 7)).toBe(3)
    expect(existsInList(SORTED, 7)).toBe(true)
    expect(existsInList(SORTED, 2)).toBe(false)
    expect(linearSearch(LS_MAIN.values, LS_MAIN.target)).toBe(2)
  })

  it("еталонні випадки: найкращий / гірший / відсутній", () => {
    expect(linearSearch(LS_BEST.values, LS_BEST.target)).toBe(0)
    expect(linearSearch(LS_WORST.values, LS_WORST.target)).toBe(4)
    expect(linearSearch(LS_ABSENT.values, LS_ABSENT.target)).toBe(-1)
  })
})

describe("findAll — усі входження", () => {
  it("повертає всі індекси збігів (звірка зі списковим включенням)", () => {
    for (const arr of INSTANCES) {
      for (const x of new Set([...arr, 999])) {
        const expected = arr.flatMap((v, i) => (v === x ? [i] : []))
        expect(findAll(arr, x)).toEqual(expected)
      }
    }
  })

  it("дублікати: перший збіг — індекс 1; усі входження — [1,3,5]", () => {
    expect(linearSearch(LS_DUPLICATES.values, LS_DUPLICATES.target)).toBe(1)
    expect(findAll(LS_DUPLICATES.values, LS_DUPLICATES.target)).toEqual([1, 3, 5])
    expect(existsInList(LS_DUPLICATES.values, LS_DUPLICATES.target)).toBe(true)
  })

  it("усі однакові → всі індекси; відсутній → []", () => {
    expect(findAll(ALL_EQUAL, 7)).toEqual([0, 1, 2, 3])
    expect(findAll(MAIN, 99)).toEqual([])
  })
})

describe("linearSearchSentinel — той самий індекс, що й базовий", () => {
  it("збігається з linearSearch на всіх інстансах (вкл. відсутні)", () => {
    for (const arr of INSTANCES) {
      for (const x of new Set([...arr, 999, -999])) {
        expect(linearSearchSentinel(arr, x)).toBe(linearSearch(arr, x))
      }
    }
    expect(linearSearchSentinel([], 5)).toBe(-1)
  })

  it("не змінює вхідний масив", () => {
    const arr = [...MAIN]
    linearSearchSentinel(arr, 999)
    expect(arr).toEqual(MAIN)
  })
})

describe("countComparisons — еталон коректності з README", () => {
  it("найкращий = 1, знайдено = індекс+1, відсутній = n", () => {
    expect(countComparisons(MAIN, 5)).toBe(1) // спереду
    expect(countComparisons(MAIN, 8)).toBe(3) // індекс 2
    expect(countComparisons(MAIN, 4)).toBe(5) // у кінці
    expect(countComparisons(MAIN, 7)).toBe(5) // відсутній → повний скан
  })

  it("загальний інваріант: знайдено → індекс+1; відсутній → n", () => {
    for (const arr of INSTANCES) {
      for (const x of new Set(arr)) {
        expect(countComparisons(arr, x)).toBe(arr.indexOf(x) + 1)
      }
      expect(countComparisons(arr, 999)).toBe(arr.length)
    }
  })

  it("еталонні підсумки", () => {
    expect(countComparisons(LS_MAIN.values, LS_MAIN.target)).toBe(3)
    expect(countComparisons(LS_SORTED.values, LS_SORTED.target)).toBe(4)
    expect(countComparisons(LS_DUPLICATES.values, LS_DUPLICATES.target)).toBe(2)
  })
})

describe("linearSearchSteps — журнал подій узгоджений", () => {
  it("result, лічильник перевірок і типи подій", () => {
    for (const arr of INSTANCES) {
      for (const x of new Set([...arr, 999])) {
        const { result, events } = linearSearchSteps(arr, x)
        expect(result).toBe(expectedIndex(arr, x))
        expect(events[0].kind).toBe("init")
        expect(events[events.length - 1].kind).toBe("final")
        expect(events[events.length - 1].result).toBe(result)
        expect(events[0].array).toEqual(arr) // масив не змінювався
        // кількість перевірок = події probe + (1 якщо found)
        const probes = events.filter((e) => e.kind === "probe").length
        const founds = events.filter((e) => e.kind === "found").length
        expect(founds).toBe(result >= 0 ? 1 : 0)
        expect(events[events.length - 1].comparisons).toBe(probes + founds)
        // рівно один вердикт: found XOR not_found
        const verdicts = events
          .map((e) => e.kind)
          .filter((k) => k === "found" || k === "not_found")
        expect(verdicts.length).toBe(1)
        // лічильник не спадає
        const counts = events.map((e) => e.comparisons)
        expect(counts).toEqual([...counts].sort((a, b) => a - b))
      }
    }
  })

  it("головний приклад: 5 подій (init, probe, probe, found, final)", () => {
    const { events, result } = linearSearchSteps(MAIN, 8)
    expect(result).toBe(2)
    expect(events.map((e) => e.kind)).toEqual([
      "init",
      "probe",
      "probe",
      "found",
      "final",
    ])
  })

  it("не змінює вхідний масив", () => {
    const arr = [...MAIN]
    linearSearchSteps(arr, 8)
    expect(arr).toEqual(MAIN)
  })

  it("крайові: порожній масив → -1, події init/not_found/final", () => {
    const { result, events } = linearSearchSteps([], 5)
    expect(result).toBe(-1)
    expect(events[0].kind).toBe("init")
    expect(events.some((e) => e.kind === "not_found")).toBe(true)
    expect(events[events.length - 1].kind).toBe("final")
  })
})

describe("caseAnalysis — аналіз випадків (головний акцент)", () => {
  it("MAIN n=5: best 1, worst 5, absent 5, average 3", () => {
    expect(caseAnalysis(MAIN)).toEqual({ n: 5, best: 1, worst: 5, absent: 5, average: 3 })
  })

  it("порожній масив → усі нулі", () => {
    expect(caseAnalysis([])).toEqual({ n: 0, best: 0, worst: 0, absent: 0, average: 0 })
  })
})
