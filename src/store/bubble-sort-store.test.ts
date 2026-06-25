import { describe, it, expect, beforeEach } from "vitest"
import { useBubbleSortStore } from "@/store/bubble-sort-store"
import {
  BUBBLE_INTRO,
  BUBBLE_BEST,
  BUBBLE_WORST,
} from "@/lib/exampleBubbleSort"
import { bubbleSort } from "@/lib/bubbleSort"
import { describeArrayCore } from "@/store/array-core-contract"

const get = () => useBubbleSortStore.getState()

describeArrayCore("bubble-sort-store", () => get(), () => get().loadIntro())

describe("bubble-sort-store", () => {
  beforeEach(() => get().loadIntro())

  it("стартовий стан — головний приклад [5,1,4,2,8,3]", () => {
    expect(get().values).toEqual([...BUBBLE_INTRO])
  })

  it("removeValue прибирає елемент за індексом", () => {
    get().removeValue(0)
    expect(get().values).toEqual([1, 4, 2, 8, 3])
  })

  it("пресети завантажуються", () => {
    get().loadBest()
    expect(get().values).toEqual([...BUBBLE_BEST])
    get().loadWorst()
    expect(get().values).toEqual([...BUBBLE_WORST])
    get().loadRandom(123)
    expect(get().values.length).toBe(8)
  })

  it("toDoc/loadDoc — round-trip; масив сортується тим самим ядром", () => {
    get().loadWorst()
    const doc = get().toDoc()
    get().clear()
    get().loadDoc(doc)
    expect(bubbleSort(get().values)).toEqual([1, 2, 3, 4, 5, 6])
  })
})
