import { describe, it, expect, beforeEach } from "vitest"
import { useSelectionSortStore } from "@/store/selection-sort-store"
import {
  SELECTION_INTRO,
  SELECTION_BEST,
  SELECTION_WORST,
} from "@/lib/exampleSelectionSort"
import { selectionSort } from "@/lib/selectionSort"
import { describeArrayCore } from "@/store/array-core-contract"

const get = () => useSelectionSortStore.getState()

describeArrayCore("selection-sort-store", () => get(), () => get().loadIntro())

describe("selection-sort-store", () => {
  beforeEach(() => get().loadIntro())

  it("стартовий стан — головний приклад [5,3,8,4,2,7]", () => {
    expect(get().values).toEqual([...SELECTION_INTRO])
  })

  it("removeValue прибирає елемент за індексом", () => {
    get().removeValue(0)
    expect(get().values).toEqual([3, 8, 4, 2, 7])
  })

  it("пресети завантажуються", () => {
    get().loadBest()
    expect(get().values).toEqual([...SELECTION_BEST])
    get().loadWorst()
    expect(get().values).toEqual([...SELECTION_WORST])
    get().loadRandom(123)
    expect(get().values.length).toBe(8)
  })

  it("toDoc/loadDoc — round-trip; масив сортується тим самим ядром", () => {
    get().loadWorst()
    const doc = get().toDoc()
    get().clear()
    get().loadDoc(doc)
    expect(selectionSort(get().values)).toEqual([1, 2, 3, 4, 5, 6])
  })
})
