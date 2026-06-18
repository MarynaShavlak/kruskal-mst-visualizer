import { describe, it, expect, beforeEach } from "vitest"
import { useIndexedSequentialSearchStore } from "@/store/indexed-sequential-search-store"
import {
  IXS_MAIN,
  IXS_IN_INDEX,
  IXS_RIGHT_ABSENT,
} from "@/lib/exampleIndexedSequentialSearch"
import {
  createIndexTable,
  indexedSequentialSearch,
  isSorted,
} from "@/lib/indexedSequentialSearch"

const get = () => useIndexedSequentialSearchStore.getState()

describe("indexed-sequential-search-store", () => {
  beforeEach(() => get().loadIntro())

  it("стартовий стан — головний приклад, ціль 15, крок 4, відсортований", () => {
    expect(get().values).toEqual([...IXS_MAIN.values])
    expect(get().target).toBe(15)
    expect(get().step).toBe(4)
    expect(isSorted(get().values)).toBe(true)
  })

  it("addValue вставляє зі збереженням порядку", () => {
    const before = get().values.length
    get().addValue()
    expect(get().values.length).toBe(before + 1)
    expect(isSorted(get().values)).toBe(true)
  })

  it("setTarget / setStep санітизують до цілих; крок ≥ 1", () => {
    get().setTarget(7.8)
    expect(get().target).toBe(7)
    get().setStep(3.9)
    expect(get().step).toBe(3)
    get().setStep(0)
    expect(get().step).toBe(1)
    get().setStep(-5)
    expect(get().step).toBe(1)
  })

  it("sortValues упорядковує масив", () => {
    get().setValues([5, 1, 4, 2, 8, 3])
    expect(isSorted(get().values)).toBe(false)
    get().sortValues()
    expect(get().values).toEqual([1, 2, 3, 4, 5, 8])
  })

  it("removeValue / clear", () => {
    get().removeValue(0)
    expect(get().values[0]).toBe(3)
    get().clear()
    expect(get().values).toEqual([])
  })

  it("пресети завантажують відсортовані масиви + ціль + крок", () => {
    get().loadInIndex()
    expect(get().values).toEqual([...IXS_IN_INDEX.values])
    expect(get().target).toBe(IXS_IN_INDEX.target)
    expect(get().step).toBe(IXS_IN_INDEX.step)
    get().loadAbsent()
    expect(get().target).toBe(IXS_RIGHT_ABSENT.target)
    get().loadRandom(123)
    expect(get().values.length).toBe(16)
    expect(isSorted(get().values)).toBe(true)
    expect(get().step).toBeGreaterThanOrEqual(1)
  })

  it("toDoc/loadDoc — round-trip; пошук працює тим самим ядром", () => {
    const doc = get().toDoc()
    get().clear()
    get().loadDoc(doc)
    const table = createIndexTable(get().values, get().step)
    expect(indexedSequentialSearch(get().values, table, get().target)).toBe(7)
  })
})
