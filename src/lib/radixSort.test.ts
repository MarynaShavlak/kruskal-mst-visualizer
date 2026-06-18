import { describe, it, expect } from "vitest"
import {
  radixSort,
  radixSortBuckets,
  radixSortSteps,
  countingSort,
  countingSortSteps,
  countOperations,
  maxDigits,
  digitAt,
  isSorted,
} from "@/lib/radixSort"
import {
  RADIX_INTRO,
  RADIX_INTRO_SORTED,
  RADIX_EQUAL,
  RADIX_DUPLICATES,
  RADIX_BIG,
} from "@/lib/exampleRadixSort"

describe("radixSort / radixSortBuckets (базова + наочна)", () => {
  it("сортує головний приклад [3,89,67,254,9,21,185,4,62]", () => {
    expect(radixSort(RADIX_INTRO)).toEqual([...RADIX_INTRO_SORTED])
    expect(radixSortBuckets(RADIX_INTRO)).toEqual([...RADIX_INTRO_SORTED])
  })

  it("обидві версії дають той самий результат, що й sorted()", () => {
    for (const arr of [RADIX_INTRO, RADIX_EQUAL, RADIX_DUPLICATES, RADIX_BIG]) {
      const want = [...arr].sort((a, b) => a - b)
      expect(radixSort(arr)).toEqual(want)
      expect(radixSortBuckets(arr)).toEqual(want)
    }
  })

  it("не змінює вхідний масив", () => {
    const input = [...RADIX_INTRO]
    radixSort(input)
    radixSortBuckets(input)
    expect(input).toEqual([...RADIX_INTRO])
  })

  it("крайові випадки", () => {
    expect(radixSort([])).toEqual([])
    expect(radixSort([42])).toEqual([42])
    expect(radixSort([0, 0, 0])).toEqual([0, 0, 0])
    expect(radixSortBuckets(RADIX_BIG)).toEqual([4, 7, 9, 23, 1000000])
  })

  it("countingSort стабільно сортує за одним розрядом (на місці)", () => {
    const arr = [...RADIX_INTRO]
    countingSort(arr, 1)
    expect(arr).toEqual([21, 62, 3, 254, 4, 185, 67, 89, 9])
  })
})

describe("digitAt / maxDigits", () => {
  it("digitAt бере цифру потрібного розряду", () => {
    expect(digitAt(254, 0)).toBe(4)
    expect(digitAt(254, 1)).toBe(5)
    expect(digitAt(254, 2)).toBe(2)
    expect(digitAt(3, 2)).toBe(0) // 003
  })

  it("maxDigits = кількість розрядних проходів", () => {
    expect(maxDigits(RADIX_INTRO)).toBe(3)
    expect(maxDigits(RADIX_EQUAL)).toBe(2)
    expect(maxDigits(RADIX_BIG)).toBe(7)
    expect(maxDigits([])).toBe(0)
    expect(maxDigits([0, 0])).toBe(0)
  })
})

describe("countOperations — еталон коректності з README", () => {
  it("INTRO: 3 проходи / 27 розкладань / 0 порівнянь", () => {
    expect(countOperations(RADIX_INTRO)).toEqual({
      passes: 3, distributions: 27, comparisons: 0,
    })
  })

  it("EQUAL: 2 проходи / 16 розкладань", () => {
    expect(countOperations(RADIX_EQUAL)).toMatchObject({ passes: 2, distributions: 16 })
  })

  it("DUPLICATES: 2 проходи / 12 розкладань", () => {
    expect(countOperations(RADIX_DUPLICATES)).toMatchObject({ passes: 2, distributions: 12 })
  })

  it("BIG: велике d → 7 проходів / 35 розкладань (обмеження radix)", () => {
    expect(countOperations(RADIX_BIG)).toMatchObject({ passes: 7, distributions: 35 })
  })

  it("порозрядне НЕ порівнює елементи — comparisons завжди 0", () => {
    for (const arr of [RADIX_INTRO, RADIX_EQUAL, RADIX_DUPLICATES, RADIX_BIG]) {
      expect(countOperations(arr).comparisons).toBe(0)
    }
  })
})

describe("radixSortSteps — журнал подій (модель кошиків)", () => {
  const { sorted, events } = radixSortSteps(RADIX_INTRO)

  it("сортує правильно; перша подія init, остання final", () => {
    expect(sorted).toEqual([...RADIX_INTRO_SORTED])
    expect(events[0].kind).toBe("init")
    expect(events[events.length - 1].kind).toBe("final")
  })

  it("для INTRO: 35 подій (1 init + 3 pass_start + 27 distribute + 3 gather + 1 final)", () => {
    const count = (k: string) => events.filter((e) => e.kind === k).length
    expect(events.length).toBe(35)
    expect(count("pass_start")).toBe(3)
    expect(count("distribute")).toBe(27)
    expect(count("gather")).toBe(3)
  })

  it("pass_start несе цифру поточного розряду кожного елемента", () => {
    const first = events.find((e) => e.kind === "pass_start")!
    expect(first.position).toBe(1)
    expect(first.digits).toEqual([3, 9, 7, 4, 9, 1, 5, 4, 2])
  })

  it("distribute кладе фішку в кошик за її цифрою; масив після одиниць — еталон", () => {
    const firstDist = events.find((e) => e.kind === "distribute")!
    expect(firstDist.value).toBe(3)
    expect(firstDist.bucket).toBe(3)
    expect(firstDist.buckets?.[3]).toEqual([3])
    const firstGather = events.find((e) => e.kind === "gather")!
    expect(firstGather.array).toEqual([21, 62, 3, 254, 4, 185, 67, 89, 9])
  })

  it("кошиків завжди 10", () => {
    for (const e of events) {
      if (e.buckets) expect(e.buckets.length).toBe(10)
    }
  })
})

describe("countingSortSteps — внутрішня кухня (один розряд)", () => {
  const cs = countingSortSteps(RADIX_INTRO, 1)

  it("фази count → префіксні суми → стабільний output (еталон README)", () => {
    expect(cs.digits).toEqual([3, 9, 7, 4, 9, 1, 5, 4, 2])
    expect(cs.freq).toEqual([0, 1, 1, 1, 2, 1, 0, 1, 0, 2])
    expect(cs.prefix).toEqual([0, 1, 2, 3, 5, 6, 6, 7, 7, 9])
    expect(cs.output).toEqual([21, 62, 3, 254, 4, 185, 67, 89, 9])
  })

  it("builds: побудова з кінця масиву (size кроків)", () => {
    expect(cs.builds.length).toBe(RADIX_INTRO.length)
    expect(cs.builds[0].i).toBe(RADIX_INTRO.length - 1)
    expect(cs.builds[cs.builds.length - 1].i).toBe(0)
  })
})

describe("isSorted", () => {
  it("розпізнає відсортовані та невідсортовані масиви", () => {
    expect(isSorted([1, 2, 3])).toBe(true)
    expect(isSorted([3, 1, 2])).toBe(false)
    expect(isSorted([])).toBe(true)
  })
})
