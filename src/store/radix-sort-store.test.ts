import { describe, it, expect, beforeEach } from "vitest"
import { useRadixSortStore } from "@/store/radix-sort-store"
import {
  RADIX_INTRO,
  RADIX_EQUAL,
  RADIX_DUPLICATES,
  RADIX_BIG,
} from "@/lib/exampleRadixSort"
import { radixSort } from "@/lib/radixSort"
import { describeArrayCore } from "@/store/array-core-contract"

const get = () => useRadixSortStore.getState()

describeArrayCore("radix-sort-store", () => get(), () => get().loadIntro())

describe("radix-sort-store", () => {
  beforeEach(() => get().loadIntro())

  it("стартовий стан — головний приклад [3,89,67,254,9,21,185,4,62]", () => {
    expect(get().values).toEqual([...RADIX_INTRO])
  })

  it("removeValue прибирає елемент за індексом", () => {
    get().removeValue(0)
    expect(get().values).toEqual([89, 67, 254, 9, 21, 185, 4, 62])
  })

  it("пресети завантажуються", () => {
    get().loadEqual()
    expect(get().values).toEqual([...RADIX_EQUAL])
    get().loadDuplicates()
    expect(get().values).toEqual([...RADIX_DUPLICATES])
    get().loadBig()
    expect(get().values).toEqual([...RADIX_BIG])
    get().loadRandom(123)
    expect(get().values.length).toBe(8)
  })

  it("toDoc/loadDoc — round-trip; масив сортується тим самим ядром", () => {
    get().loadDuplicates()
    const doc = get().toDoc()
    get().clear()
    get().loadDoc(doc)
    expect(radixSort(get().values)).toEqual([12, 12, 31, 41, 52, 52])
  })
})
