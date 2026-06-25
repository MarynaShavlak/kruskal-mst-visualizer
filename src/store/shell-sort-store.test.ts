import { describe, it, expect, beforeEach } from "vitest"
import { useShellSortStore } from "@/store/shell-sort-store"
import {
  SHELL_INTRO,
  SHELL_SORTED,
  SHELL_REVERSED,
  SHELL_DUPLICATES,
} from "@/lib/exampleShellSort"
import { shellSort } from "@/lib/shellSort"
import { describeArrayCore } from "@/store/array-core-contract"

const get = () => useShellSortStore.getState()

describeArrayCore("shell-sort-store", () => get(), () => get().loadIntro())

describe("shell-sort-store", () => {
  beforeEach(() => get().loadIntro())

  it("стартовий стан — головний приклад [8,5,3,7,6,1,4,2]", () => {
    expect(get().values).toEqual([...SHELL_INTRO])
  })

  it("removeValue прибирає елемент за індексом", () => {
    get().removeValue(0)
    expect(get().values).toEqual([5, 3, 7, 6, 1, 4, 2])
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
