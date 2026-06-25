import { describe, it, expect, beforeEach } from "vitest"
import { useMergeSortStore } from "@/store/merge-sort-store"
import {
  MERGE_INTRO,
  MERGE_SORTED,
  MERGE_REVERSED,
  MERGE_DUPLICATES,
} from "@/lib/exampleMergeSort"
import { mergeSort } from "@/lib/mergeSort"
import { describeArrayCore } from "@/store/array-core-contract"

const get = () => useMergeSortStore.getState()

describeArrayCore("merge-sort-store", () => get(), () => get().loadIntro())

describe("merge-sort-store", () => {
  beforeEach(() => get().loadIntro())

  it("стартовий стан — головний приклад [8,4,6,2,7,1,5,3]", () => {
    expect(get().values).toEqual([...MERGE_INTRO])
  })

  it("removeValue прибирає елемент за індексом", () => {
    get().removeValue(0)
    expect(get().values).toEqual([4, 6, 2, 7, 1, 5, 3])
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
