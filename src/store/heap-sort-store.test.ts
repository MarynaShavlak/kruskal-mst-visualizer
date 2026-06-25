import { describe, it, expect, beforeEach } from "vitest"
import { useHeapSortStore } from "@/store/heap-sort-store"
import {
  HEAP_INTRO,
  HEAP_SORTED,
  HEAP_REVERSED,
  HEAP_DUPLICATES,
} from "@/lib/exampleHeapSort"
import { heapSort } from "@/lib/heapSort"
import { describeArrayCore } from "@/store/array-core-contract"

const get = () => useHeapSortStore.getState()

describeArrayCore("heap-sort-store", () => get(), () => get().loadIntro())

describe("heap-sort-store", () => {
  beforeEach(() => get().loadIntro())

  it("стартовий стан — головний приклад [12,11,13,5,6,7]", () => {
    expect(get().values).toEqual([...HEAP_INTRO])
  })

  it("removeValue прибирає елемент за індексом", () => {
    get().removeValue(0)
    expect(get().values).toEqual([11, 13, 5, 6, 7])
  })

  it("пресети завантажуються", () => {
    get().loadSorted()
    expect(get().values).toEqual([...HEAP_SORTED])
    get().loadReversed()
    expect(get().values).toEqual([...HEAP_REVERSED])
    get().loadDuplicates()
    expect(get().values).toEqual([...HEAP_DUPLICATES])
    get().loadRandom(123)
    expect(get().values.length).toBe(10)
  })

  it("toDoc/loadDoc — round-trip; масив сортується тим самим ядром", () => {
    get().loadDuplicates()
    const doc = get().toDoc()
    get().clear()
    get().loadDoc(doc)
    expect(heapSort(get().values, "asc")).toEqual([1, 2, 2, 4, 4, 4])
  })
})
