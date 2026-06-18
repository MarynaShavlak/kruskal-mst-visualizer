import { describe, it, expect, beforeEach } from "vitest"
import { useLinearSearchStore } from "@/store/linear-search-store"
import {
  LS_MAIN,
  LS_DUPLICATES,
  LS_SORTED,
} from "@/lib/exampleLinearSearch"
import { linearSearch } from "@/lib/linearSearch"

const get = () => useLinearSearchStore.getState()

describe("linear-search-store", () => {
  beforeEach(() => get().loadMain())

  it("стартовий стан — головний приклад [5,3,8,1,4], ціль 8", () => {
    expect(get().values).toEqual([...LS_MAIN.values])
    expect(get().target).toBe(8)
  })

  it("addValue додає одне ціле", () => {
    const before = get().values.length
    get().addValue()
    expect(get().values.length).toBe(before + 1)
    expect(Number.isInteger(get().values[before])).toBe(true)
  })

  it("updateValue санітизує до цілого (дозволяє від'ємні)", () => {
    get().updateValue(0, -5)
    expect(get().values[0]).toBe(-5)
    get().updateValue(0, 7.9)
    expect(get().values[0]).toBe(7)
  })

  it("setTarget санітизує ціль до цілого", () => {
    get().setTarget(3.7)
    expect(get().target).toBe(3)
  })

  it("removeValue прибирає елемент за індексом", () => {
    get().removeValue(0)
    expect(get().values).toEqual([3, 8, 1, 4])
  })

  it("setValues замінює весь масив із санітизацією", () => {
    get().setValues([3, -1, 2.5])
    expect(get().values).toEqual([3, -1, 2])
  })

  it("clear спорожнює масив (ціль лишається)", () => {
    get().clear()
    expect(get().values).toEqual([])
  })

  it("пресети завантажуються разом із ціллю", () => {
    get().loadDuplicates()
    expect(get().values).toEqual([...LS_DUPLICATES.values])
    expect(get().target).toBe(LS_DUPLICATES.target)
    get().loadSorted()
    expect(get().values).toEqual([...LS_SORTED.values])
    expect(get().target).toBe(LS_SORTED.target)
    get().loadRandom(123)
    expect(get().values.length).toBe(7)
  })

  it("toDoc/loadDoc — round-trip; пошук працює тим самим ядром", () => {
    get().loadDuplicates()
    const doc = get().toDoc()
    get().clear()
    get().loadDoc(doc)
    expect(linearSearch(get().values, get().target)).toBe(1)
  })
})
