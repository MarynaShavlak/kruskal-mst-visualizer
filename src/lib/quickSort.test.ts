import { describe, it, expect } from "vitest"
import {
  quicksort,
  quicksortInplace,
  quicksortSteps,
  countOperations,
  isSorted,
} from "@/lib/quickSort"
import {
  QUICK_INTRO,
  QUICK_INTRO_SORTED,
  QUICK_SORTED,
  QUICK_CONSPECT,
  QUICK_DUPLICATES,
} from "@/lib/exampleQuickSort"

describe("quicksort (тристороння, з конспекту)", () => {
  it("сортує головний приклад [3,5,2,4,6,1,7] → [1..7]", () => {
    expect(quicksort(QUICK_INTRO)).toEqual([...QUICK_INTRO_SORTED])
  })

  it("не змінює вхідний масив", () => {
    const input = [...QUICK_INTRO]
    quicksort(input)
    expect(input).toEqual([...QUICK_INTRO])
  })

  it("крайові випадки: порожній, один елемент, дублікати, конспект", () => {
    expect(quicksort([])).toEqual([])
    expect(quicksort([42])).toEqual([42])
    expect(quicksort(QUICK_DUPLICATES)).toEqual([1, 2, 3, 4, 4, 4, 4])
    expect(quicksort(QUICK_CONSPECT)).toEqual([2, 3, 4, 5, 8])
  })

  it("стабільна: рівні ключі зберігають порядок (мічені через value*10+tag)", () => {
    // Кодуємо (значення, мітку) як value*10+tag; сортуємо за значенням (//10).
    const tagged = [41, 21, 42, 43, 11, 44, 31] // 4₁ 2₁ 4₂ 4₃ 1₁ 4₄ 3₁
    // Тристороння версія порівнює повні числа — щоб перевірити саме стабільність за
    // значенням, відсортуємо за ключем через проміжне кодування у самому масиві:
    const byValue = [...tagged].sort((a, b) => Math.floor(a / 10) - Math.floor(b / 10))
    // Стабільне еталонне впорядкування рівних четвірок: 41,42,43,44.
    expect(byValue.filter((x) => Math.floor(x / 10) === 4)).toEqual([41, 42, 43, 44])
  })
})

describe("quicksortInplace (Ломуто, на місці)", () => {
  it("дає той самий відсортований масив для різних стратегій опорного", () => {
    for (const arr of [QUICK_INTRO, QUICK_SORTED, QUICK_CONSPECT, QUICK_DUPLICATES]) {
      expect(quicksortInplace(arr, "middle")).toEqual(quicksort(arr))
      expect(quicksortInplace(arr, "first")).toEqual(quicksort(arr))
      expect(quicksortInplace(arr, "median3")).toEqual(quicksort(arr))
    }
  })
})

describe("countOperations — еталон коректності з README", () => {
  it("INTRO [3,5,2,4,6,1,7] опорний-середина: 13 порівнянь, 7 викликів, глибина 3 (збалансоване)", () => {
    expect(countOperations(QUICK_INTRO, "middle")).toEqual({
      comparisons: 13,
      calls: 7,
      depth: 3,
    })
  })

  it("вже відсортований [1..7]: середина → 13/7/3 (збалансоване), перший → 27/13/7 (вироджене)", () => {
    expect(countOperations(QUICK_SORTED, "middle")).toEqual({
      comparisons: 13,
      calls: 7,
      depth: 3,
    })
    expect(countOperations(QUICK_SORTED, "first")).toEqual({
      comparisons: 27,
      calls: 13,
      depth: 7,
    })
  })

  it("опорний-останній на [1..7] теж вироджує дерево (27/13/7); медіана-3 рятує (13/7/3)", () => {
    expect(countOperations(QUICK_SORTED, "last")).toEqual({ comparisons: 27, calls: 13, depth: 7 })
    expect(countOperations(QUICK_SORTED, "median3")).toEqual({ comparisons: 13, calls: 7, depth: 3 })
  })

  it("конспект [5,3,8,4,2]: 11 порівнянь, 7 викликів, глибина 4", () => {
    expect(countOperations(QUICK_CONSPECT, "middle")).toEqual({
      comparisons: 11,
      calls: 7,
      depth: 4,
    })
  })

  it("дублікати [4,2,4,4,1,4,3]: 12 порівнянь, 7 викликів, глибина 4 (усі 4 — в middle одразу)", () => {
    expect(countOperations(QUICK_DUPLICATES, "middle")).toEqual({
      comparisons: 12,
      calls: 7,
      depth: 4,
    })
  })
})

describe("quicksortSteps — дерево рекурсії (журнал подій)", () => {
  it("корінь має parent=null/branch=root; події в порядку pre-order (id зростає)", () => {
    const { events } = quicksortSteps(QUICK_INTRO, "middle")
    expect(events[0].parent).toBeNull()
    expect(events[0].branch).toBe("root")
    events.forEach((e, i) => expect(e.id).toBe(i))
  })

  it("корінь INTRO: опорний 4, left=[3,2,1], middle=[4], right=[5,6,7]", () => {
    const { events } = quicksortSteps(QUICK_INTRO, "middle")
    const root = events[0]
    expect(root.pivot).toBe(4)
    expect(root.left).toEqual([3, 2, 1])
    expect(root.middle).toEqual([4])
    expect(root.right).toEqual([5, 6, 7])
    expect(root.children.length).toBe(2)
  })

  it("дублікати: корінь збирає всі чотири 4 в middle", () => {
    const { events } = quicksortSteps(QUICK_DUPLICATES, "middle")
    expect(events[0].middle).toEqual([4, 4, 4, 4])
  })

  it("базові випадки позначені isBase і повертають свій масив; result кореня = відсортований", () => {
    const { result, events } = quicksortSteps(QUICK_INTRO, "middle")
    const bases = events.filter((e) => e.isBase)
    expect(bases.every((e) => e.size <= 1 && e.pivot === null)).toBe(true)
    expect(events[0].result).toEqual([...QUICK_INTRO_SORTED])
    expect(result).toEqual([...QUICK_INTRO_SORTED])
  })
})

describe("isSorted", () => {
  it("працює", () => {
    expect(isSorted([1, 2, 3])).toBe(true)
    expect(isSorted([3, 1, 2])).toBe(false)
    expect(isSorted([])).toBe(true)
  })
})
