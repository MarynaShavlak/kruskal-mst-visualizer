import { describe, it, expect, beforeEach } from "vitest"
import { useInterpolationSearchStore } from "@/store/interpolation-search-store"
import {
  IP_DEMO1,
  IP_DEMO2,
  IP_CLUSTERED,
} from "@/lib/exampleInterpolationSearch"
import { interpolationSearch, isSorted } from "@/lib/interpolationSearch"

const get = () => useInterpolationSearchStore.getState()

describe("interpolation-search-store", () => {
  beforeEach(() => get().loadDemo1())

  it("стартовий стан — демо 1, ціль 15, відсортований", () => {
    expect(get().values).toEqual([...IP_DEMO1.values])
    expect(get().target).toBe(15)
    expect(isSorted(get().values)).toBe(true)
  })

  it("addValue вставляє так, щоб масив лишився відсортованим", () => {
    const before = get().values.length
    get().addValue()
    expect(get().values.length).toBe(before + 1)
    expect(isSorted(get().values)).toBe(true)
  })

  it("setTarget санітизує ціль до цілого", () => {
    get().setTarget(7.8)
    expect(get().target).toBe(7)
  })

  it("sortValues упорядковує масив", () => {
    get().setValues([5, 1, 4, 2, 8, 3])
    expect(isSorted(get().values)).toBe(false)
    get().sortValues()
    expect(get().values).toEqual([1, 2, 3, 4, 5, 8])
  })

  it("removeValue прибирає елемент за індексом", () => {
    get().removeValue(0)
    expect(get().values).toEqual([3, 5, 7, 9, 11, 13, 15, 17, 19])
  })

  it("clear спорожнює масив", () => {
    get().clear()
    expect(get().values).toEqual([])
  })

  it("пресети завантажують відсортовані масиви + ціль", () => {
    get().loadDemo2()
    expect(get().values).toEqual([...IP_DEMO2.values])
    expect(get().target).toBe(IP_DEMO2.target)
    get().loadClustered()
    expect(get().values).toEqual([...IP_CLUSTERED.values])
    expect(get().target).toBe(IP_CLUSTERED.target)
    get().loadRandom(123)
    expect(get().values.length).toBe(12)
    expect(isSorted(get().values)).toBe(true)
  })

  it("toDoc/loadDoc — round-trip; пошук працює тим самим ядром", () => {
    const doc = get().toDoc()
    get().clear()
    get().loadDoc(doc)
    expect(interpolationSearch(get().values, get().target)).toBe(7)
  })
})
