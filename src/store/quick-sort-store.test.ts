import { describe, it, expect, beforeEach } from "vitest"
import { useQuickSortStore } from "@/store/quick-sort-store"
import {
  QUICK_INTRO,
  QUICK_SORTED,
  QUICK_DUPLICATES,
} from "@/lib/exampleQuickSort"
import { quicksort } from "@/lib/quickSort"

const get = () => useQuickSortStore.getState()

describe("quick-sort-store", () => {
  beforeEach(() => get().loadIntro())

  it("стартовий стан — головний приклад [3,5,2,4,6,1,7]", () => {
    expect(get().values).toEqual([...QUICK_INTRO])
  })

  it("addValue додає одне ціле", () => {
    const before = get().values.length
    get().addValue()
    expect(get().values.length).toBe(before + 1)
    expect(Number.isInteger(get().values[before])).toBe(true)
  })

  it("updateValue санітизує до цілого ≥ 0", () => {
    get().updateValue(0, -5)
    expect(get().values[0]).toBe(0)
    get().updateValue(0, 7.9)
    expect(get().values[0]).toBe(7)
  })

  it("removeValue прибирає елемент за індексом", () => {
    get().removeValue(0)
    expect(get().values).toEqual([5, 2, 4, 6, 1, 7])
  })

  it("setValues замінює весь масив із санітизацією", () => {
    get().setValues([3, -1, 2.5])
    expect(get().values).toEqual([3, 0, 2])
  })

  it("clear спорожнює масив", () => {
    get().clear()
    expect(get().values).toEqual([])
  })

  it("пресети завантажуються", () => {
    get().loadSorted()
    expect(get().values).toEqual([...QUICK_SORTED])
    get().loadDuplicates()
    expect(get().values).toEqual([...QUICK_DUPLICATES])
    get().loadRandom(123)
    expect(get().values.length).toBe(8)
  })

  it("toDoc/loadDoc — round-trip; масив сортується тим самим ядром", () => {
    get().loadDuplicates()
    const doc = get().toDoc()
    get().clear()
    get().loadDoc(doc)
    expect(quicksort(get().values)).toEqual([1, 2, 3, 4, 4, 4, 4])
  })
})
