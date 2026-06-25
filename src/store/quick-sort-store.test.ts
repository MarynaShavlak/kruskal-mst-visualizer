import { describe, it, expect, beforeEach } from "vitest"
import { useQuickSortStore } from "@/store/quick-sort-store"
import {
  QUICK_INTRO,
  QUICK_SORTED,
  QUICK_DUPLICATES,
} from "@/lib/exampleQuickSort"
import { quicksort } from "@/lib/quickSort"
import { describeArrayCore } from "@/store/array-core-contract"

const get = () => useQuickSortStore.getState()

describeArrayCore("quick-sort-store", () => get(), () => get().loadIntro())

describe("quick-sort-store", () => {
  beforeEach(() => get().loadIntro())

  it("стартовий стан — головний приклад [3,5,2,4,6,1,7]", () => {
    expect(get().values).toEqual([...QUICK_INTRO])
  })

  it("removeValue прибирає елемент за індексом", () => {
    get().removeValue(0)
    expect(get().values).toEqual([5, 2, 4, 6, 1, 7])
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
