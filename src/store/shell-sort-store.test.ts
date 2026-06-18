import { describe, it, expect, beforeEach } from "vitest"
import { useShellSortStore } from "@/store/shell-sort-store"
import {
  SHELL_INTRO,
  SHELL_SORTED,
  SHELL_REVERSED,
  SHELL_DUPLICATES,
} from "@/lib/exampleShellSort"
import { shellSort } from "@/lib/shellSort"

const get = () => useShellSortStore.getState()

describe("shell-sort-store", () => {
  beforeEach(() => get().loadIntro())

  it("стартовий стан — головний приклад [8,5,3,7,6,1,4,2]", () => {
    expect(get().values).toEqual([...SHELL_INTRO])
  })

  it("addValue додає одне ціле", () => {
    const before = get().values.length
    get().addValue()
    expect(get().values.length).toBe(before + 1)
    expect(Number.isInteger(get().values[before])).toBe(true)
  })

  it("updateValue санітизує до цілого ≥ 0", () => {
    get().updateValue(0, -5)
    expect(get().values[0]).toBe(0)
    get().updateValue(0, 7.9)
    expect(get().values[0]).toBe(7)
  })

  it("removeValue прибирає елемент за індексом", () => {
    get().removeValue(0)
    expect(get().values).toEqual([5, 3, 7, 6, 1, 4, 2])
  })

  it("setValues замінює весь масив із санітизацією", () => {
    get().setValues([3, -1, 2.5])
    expect(get().values).toEqual([3, 0, 2])
  })

  it("clear спорожнює масив", () => {
    get().clear()
    expect(get().values).toEqual([])
  })

  it("пресети завантажуються", () => {
    get().loadSorted()
    expect(get().values).toEqual([...SHELL_SORTED])
    get().loadReversed()
    expect(get().values).toEqual([...SHELL_REVERSED])
    get().loadDuplicates()
    expect(get().values).toEqual([...SHELL_DUPLICATES])
    get().loadRandom(123)
    expect(get().values.length).toBe(10)
  })

  it("toDoc/loadDoc — round-trip; масив сортується тим самим ядром", () => {
    get().loadDuplicates()
    const doc = get().toDoc()
    get().clear()
    get().loadDoc(doc)
    expect(shellSort(get().values)).toEqual([2, 2, 3, 3, 4, 4])
  })
})
