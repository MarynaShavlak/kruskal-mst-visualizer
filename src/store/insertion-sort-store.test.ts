import { describe, it, expect, beforeEach } from "vitest"
import { useInsertionSortStore } from "@/store/insertion-sort-store"
import {
  INSERTION_INTRO,
  INSERTION_BEST,
  INSERTION_WORST,
} from "@/lib/exampleInsertionSort"
import { insertionSort } from "@/lib/insertionSort"

const get = () => useInsertionSortStore.getState()

describe("insertion-sort-store", () => {
  beforeEach(() => get().loadIntro())

  it("стартовий стан — головний приклад [5,2,4,6,1,3]", () => {
    expect(get().values).toEqual([...INSERTION_INTRO])
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
    expect(get().values[0]).toBe(7) // truncate
  })

  it("removeValue прибирає елемент за індексом", () => {
    get().removeValue(0)
    expect(get().values).toEqual([2, 4, 6, 1, 3])
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
    get().loadBest()
    expect(get().values).toEqual([...INSERTION_BEST])
    get().loadWorst()
    expect(get().values).toEqual([...INSERTION_WORST])
    get().loadRandom(123)
    expect(get().values.length).toBe(8)
  })

  it("toDoc/loadDoc — round-trip; масив сортується тим самим ядром", () => {
    get().loadWorst()
    const doc = get().toDoc()
    get().clear()
    get().loadDoc(doc)
    expect(insertionSort(get().values)).toEqual([1, 2, 3, 4, 5, 6])
  })
})
