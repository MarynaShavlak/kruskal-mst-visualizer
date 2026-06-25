import { describe, it, expect, beforeEach } from "vitest"
import { useInsertionSortStore } from "@/store/insertion-sort-store"
import {
  INSERTION_INTRO,
  INSERTION_BEST,
  INSERTION_WORST,
} from "@/lib/exampleInsertionSort"
import { insertionSort } from "@/lib/insertionSort"
import { describeArrayCore } from "@/store/array-core-contract"

const get = () => useInsertionSortStore.getState()

describeArrayCore("insertion-sort-store", () => get(), () => get().loadIntro())

describe("insertion-sort-store", () => {
  beforeEach(() => get().loadIntro())

  it("стартовий стан — головний приклад [5,2,4,6,1,3]", () => {
    expect(get().values).toEqual([...INSERTION_INTRO])
  })

  it("removeValue прибирає елемент за індексом", () => {
    get().removeValue(0)
    expect(get().values).toEqual([2, 4, 6, 1, 3])
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
