import { describe, it, expect, beforeEach } from "vitest"
import { useMergeSortStore } from "@/store/merge-sort-store"
import {
  MERGE_INTRO,
  MERGE_SORTED,
  MERGE_REVERSED,
  MERGE_DUPLICATES,
} from "@/lib/exampleMergeSort"
import { mergeSort } from "@/lib/mergeSort"

const get = () => useMergeSortStore.getState()

describe("merge-sort-store", () => {
  beforeEach(() => get().loadIntro())

  it("стартовий стан — головний приклад [8,4,6,2,7,1,5,3]", () => {
    expect(get().values).toEqual([...MERGE_INTRO])
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
    expect(get().values).toEqual([4, 6, 2, 7, 1, 5, 3])
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
    expect(get().values).toEqual([...MERGE_SORTED])
    get().loadReversed()
    expect(get().values).toEqual([...MERGE_REVERSED])
    get().loadDuplicates()
    expect(get().values).toEqual([...MERGE_DUPLICATES])
    get().loadRandom(123)
    expect(get().values.length).toBe(8)
  })

  it("toDoc/loadDoc — round-trip; масив сортується тим самим ядром", () => {
    get().loadDuplicates()
    const doc = get().toDoc()
    get().clear()
    get().loadDoc(doc)
    expect(mergeSort(get().values)).toEqual([1, 1, 2, 3, 3, 3])
  })
})
