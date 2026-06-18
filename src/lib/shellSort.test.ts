import { describe, it, expect } from "vitest"
import {
  shellSort,
  shellSortWithGaps,
  shellSortSteps,
  gapsShell,
  gapsKnuth,
  gapsCiura,
  gapsFor,
  countOperations,
  isSorted,
} from "@/lib/shellSort"
import {
  SHELL_INTRO,
  SHELL_INTRO_SORTED,
  SHELL_CONSPECT,
  SHELL_SORTED,
  SHELL_REVERSED,
  SHELL_DUPLICATES,
  SHELL_BIG,
} from "@/lib/exampleShellSort"

describe("shellSort (базова, gap = n//2)", () => {
  it("сортує головний приклад [8,5,3,7,6,1,4,2] → [1..8]", () => {
    expect(shellSort(SHELL_INTRO)).toEqual([...SHELL_INTRO_SORTED])
  })

  it("не змінює вхідний масив", () => {
    const input = [...SHELL_INTRO]
    shellSort(input)
    expect(input).toEqual([...SHELL_INTRO])
  })

  it("крайові випадки", () => {
    expect(shellSort([])).toEqual([])
    expect(shellSort([42])).toEqual([42])
    expect(shellSort(SHELL_CONSPECT)).toEqual([2, 3, 4, 5, 8])
    expect(shellSort(SHELL_REVERSED)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect(shellSort(SHELL_DUPLICATES)).toEqual([2, 2, 3, 3, 4, 4])
  })
})

describe("послідовності проміжків", () => {
  it("gapsShell(8) = [4,2,1]; gapsKnuth(8) = [4,1]; gapsCiura(8) = [4,1]", () => {
    expect(gapsShell(8)).toEqual([4, 2, 1])
    expect(gapsKnuth(8)).toEqual([4, 1])
    expect(gapsCiura(8)).toEqual([4, 1])
  })

  it("Кнут — спадні члени 3k+1 < n", () => {
    expect(gapsKnuth(20)).toEqual([13, 4, 1])
    expect(gapsKnuth(50)).toEqual([40, 13, 4, 1])
  })

  it("Ciura — табличні значення < n, спадно", () => {
    expect(gapsCiura(24)).toEqual([23, 10, 4, 1])
  })

  it("усі послідовності закінчуються на 1 (для n ≥ 2) і спадні", () => {
    for (const seq of ["shell", "knuth", "ciura"] as const) {
      const g = gapsFor(seq, 16)
      expect(g[g.length - 1]).toBe(1)
      for (let i = 1; i < g.length; i++) expect(g[i]).toBeLessThan(g[i - 1])
    }
  })

  it("shellSortWithGaps дає той самий результат для всіх послідовностей", () => {
    for (const arr of [SHELL_INTRO, SHELL_REVERSED, SHELL_BIG, SHELL_CONSPECT]) {
      const want = [...arr].sort((a, b) => a - b)
      for (const seq of ["shell", "knuth", "ciura"] as const) {
        expect(shellSortWithGaps(arr, gapsFor(seq, arr.length))).toEqual(want)
      }
    }
  })
})

describe("countOperations — еталон коректності з README", () => {
  it("INTRO Шелла [4,2,1]: 23 порівняння / 11 зсувів / 3 фази", () => {
    expect(countOperations(SHELL_INTRO, gapsShell(8))).toEqual({
      comparisons: 23, shifts: 11, gapPhases: 3,
    })
  })

  it("INTRO Кнута [4,1]: 20 / 13 / 2; Ciura так само 20 / 13 / 2", () => {
    expect(countOperations(SHELL_INTRO, gapsKnuth(8))).toEqual({
      comparisons: 20, shifts: 13, gapPhases: 2,
    })
    expect(countOperations(SHELL_INTRO, gapsCiura(8))).toEqual({
      comparisons: 20, shifts: 13, gapPhases: 2,
    })
  })

  it("SORTED [1..8] адаптивне: 0 зсувів (Шелла 17/0/3)", () => {
    expect(countOperations(SHELL_SORTED, gapsShell(8))).toEqual({
      comparisons: 17, shifts: 0, gapPhases: 3,
    })
  })

  it("REVERSED — багато зсувів (Шелла 22/12/3)", () => {
    expect(countOperations(SHELL_REVERSED, gapsShell(8))).toEqual({
      comparisons: 22, shifts: 12, gapPhases: 3,
    })
  })

  it("BIG (24 елем.): послідовності помітно різняться (Шелла 146/83, Кнута 105/61, Ciura 100/53 — Ciura найкраща)", () => {
    expect(countOperations(SHELL_BIG, gapsShell(24))).toMatchObject({ comparisons: 146, shifts: 83 })
    expect(countOperations(SHELL_BIG, gapsKnuth(24))).toMatchObject({ comparisons: 105, shifts: 61 })
    expect(countOperations(SHELL_BIG, gapsCiura(24))).toMatchObject({ comparisons: 100, shifts: 53 })
  })
})

describe("shellSortSteps — журнал подій", () => {
  const { sorted, events } = shellSortSteps(SHELL_INTRO, gapsShell(8))

  it("сортує правильно; перша подія init, остання final", () => {
    expect(sorted).toEqual([...SHELL_INTRO_SORTED])
    expect(events[0].kind).toBe("init")
    expect(events[events.length - 1].kind).toBe("final")
  })

  it("для INTRO Шелла: 76 подій (1 init + 3 gap_start + 17 i_start + 23 compare + 11 shift + 17 insert + 3 gap_end + 1 final)", () => {
    const count = (k: string) => events.filter((e) => e.kind === k).length
    expect(events.length).toBe(76)
    expect(count("gap_start")).toBe(3)
    expect(count("i_start")).toBe(17)
    expect(count("compare")).toBe(23)
    expect(count("shift")).toBe(11)
    expect(count("insert")).toBe(17)
    expect(count("gap_end")).toBe(3)
  })

  it("gap_start несе підпослідовності з кроком gap (для gap=4 → 4 групи по 2)", () => {
    const first = events.find((e) => e.kind === "gap_start")!
    expect(first.gap).toBe(4)
    expect(first.groups?.length).toBe(4)
    expect(first.groups?.[0]).toEqual([0, 4])
  })

  it("shift зсуває на gap позицій (shiftedTo = shiftedFrom + gap)", () => {
    for (const e of events) {
      if (e.kind === "shift") {
        expect(e.shiftedTo).toBe((e.shiftedFrom ?? 0) + (e.gap ?? 0))
      }
    }
  })
})

describe("isSorted", () => {
  it("розпізнає відсортовані та невідсортовані масиви", () => {
    expect(isSorted([1, 2, 3])).toBe(true)
    expect(isSorted([3, 1, 2])).toBe(false)
    expect(isSorted([])).toBe(true)
  })
})
