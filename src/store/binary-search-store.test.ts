import { describe, it, expect, beforeEach } from "vitest"
import { useBinarySearchStore } from "@/store/binary-search-store"
import {
  BS_INTRO,
  BS_DUPLICATES,
  BS_ABSENT,
} from "@/lib/exampleBinarySearch"
import { binarySearch, isSorted } from "@/lib/binarySearch"

const get = () => useBinarySearchStore.getState()

describe("binary-search-store", () => {
  beforeEach(() => get().loadIntro())

  it("стартовий стан — головний приклад, ціль 15, відсортований", () => {
    expect(get().values).toEqual([...BS_INTRO.values])
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
    expect(get().values).toEqual([3, 5, 8, 10, 12, 15, 18, 20, 22, 24])
  })

  it("clear спорожнює масив (ціль лишається)", () => {
    get().clear()
    expect(get().values).toEqual([])
  })

  it("пресети завантажують відсортовані масиви + ціль", () => {
    get().loadDuplicates()
    expect(get().values).toEqual([...BS_DUPLICATES.values])
    expect(get().target).toBe(BS_DUPLICATES.target)
    get().loadAbsent()
    expect(get().values).toEqual([...BS_ABSENT.values])
    expect(get().target).toBe(11)
    get().loadRandom(123)
    expect(get().values.length).toBe(11)
    expect(isSorted(get().values)).toBe(true)
  })

  it("toDoc/loadDoc — round-trip; пошук працює тим самим ядром", () => {
    const doc = get().toDoc()
    get().clear()
    get().loadDoc(doc)
    expect(binarySearch(get().values, get().target)).toBe(6)
  })
})
