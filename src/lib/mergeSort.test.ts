import { describe, it, expect } from "vitest"
import {
  merge,
  mergeSort,
  mergeSortBottomUp,
  mergeSteps,
  mergeSortSteps,
  mergeSortBottomUpSteps,
  buildTree,
  countOperations,
  isSorted,
} from "@/lib/mergeSort"
import {
  MERGE_INTRO,
  MERGE_INTRO_SORTED,
  MERGE_CONSPECT,
  MERGE_SORTED,
  MERGE_REVERSED,
  MERGE_DUPLICATES,
  MERGE_DEMO_LEFT,
  MERGE_DEMO_RIGHT,
} from "@/lib/exampleMergeSort"

describe("mergeSort (низхідна, з конспекту)", () => {
  it("сортує головний приклад [8,4,6,2,7,1,5,3] → [1..8]", () => {
    expect(mergeSort(MERGE_INTRO)).toEqual([...MERGE_INTRO_SORTED])
  })

  it("не змінює вхідний масив", () => {
    const input = [...MERGE_INTRO]
    mergeSort(input)
    expect(input).toEqual([...MERGE_INTRO])
  })

  it("крайові випадки: порожній, один елемент, дублікати, конспект, зворотний", () => {
    expect(mergeSort([])).toEqual([])
    expect(mergeSort([42])).toEqual([42])
    expect(mergeSort(MERGE_DUPLICATES)).toEqual([1, 1, 2, 3, 3, 3])
    expect(mergeSort(MERGE_CONSPECT)).toEqual([2, 3, 4, 5, 8])
    expect(mergeSort(MERGE_REVERSED)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })
})

describe("merge / mergeSteps (злиття двома вказівниками)", () => {
  it("зливає дві відсортовані половини стабільно", () => {
    expect(merge([2, 4, 6, 8], [1, 3, 5, 7])).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect(merge(MERGE_DEMO_LEFT, MERGE_DEMO_RIGHT)).toEqual([2, 3, 4, 5, 8])
  })

  it("корінь INTRO: merge([2,4,6,8],[1,3,5,7]) = 7 порівнянь, 8 кроків", () => {
    const { merged, steps, comparisons } = mergeSteps([2, 4, 6, 8], [1, 3, 5, 7])
    expect(merged).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect(comparisons).toBe(7)
    expect(steps.length).toBe(8) // 7 порівнянь + 1 доливання залишку
    // останній знімок merged = повний результат
    expect(steps[steps.length - 1].merged).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it("нестроге <= робить злиття стабільним (рівні голови → беремо з лівої)", () => {
    const { steps } = mergeSteps([1, 1], [1])
    // перший крок: left[0]=1 <= right[0]=1 → беремо з лівої
    expect(steps[0].took).toBe("left")
  })
})

describe("mergeSortBottomUp (вихідна, ітеративна)", () => {
  it("дає той самий результат, що й низхідна, для всіх прикладів", () => {
    for (const arr of [MERGE_INTRO, MERGE_CONSPECT, MERGE_SORTED, MERGE_REVERSED, MERGE_DUPLICATES]) {
      expect(mergeSortBottomUp(arr)).toEqual(mergeSort(arr))
    }
  })

  it("крайові випадки", () => {
    expect(mergeSortBottomUp([])).toEqual([])
    expect(mergeSortBottomUp([7])).toEqual([7])
  })
})

describe("countOperations — еталон коректності з README", () => {
  it("INTRO [8,4,6,2,7,1,5,3]: низхідна 17/24/7/глибина 3 (збалансоване, степінь 2)", () => {
    expect(countOperations(MERGE_INTRO, "topDown")).toEqual({
      comparisons: 17, appends: 24, merges: 7, depth: 3,
    })
  })

  it("INTRO: вихідна (bottom-up) дає ТІ САМІ числа (розмір — степінь двійки)", () => {
    expect(countOperations(MERGE_INTRO, "bottomUp")).toEqual({
      comparisons: 17, appends: 24, merges: 7, depth: 3,
    })
  })

  it("SORTED [1..8] не адаптивна: усі поділи/злиття, 12/24/7/глибина 3", () => {
    expect(countOperations(MERGE_SORTED, "topDown")).toEqual({
      comparisons: 12, appends: 24, merges: 7, depth: 3,
    })
  })

  it("REVERSED [8..1]: дерево так само збалансоване — НЕМАЄ деградації (12/24/7/3)", () => {
    expect(countOperations(MERGE_REVERSED, "topDown")).toEqual({
      comparisons: 12, appends: 24, merges: 7, depth: 3,
    })
  })

  it("CONSPECT [5,3,8,4,2] (не степінь 2): низхідна 8/12/4/3, вихідна 6/13/4/3", () => {
    expect(countOperations(MERGE_CONSPECT, "topDown")).toEqual({
      comparisons: 8, appends: 12, merges: 4, depth: 3,
    })
    expect(countOperations(MERGE_CONSPECT, "bottomUp")).toEqual({
      comparisons: 6, appends: 13, merges: 4, depth: 3,
    })
  })

  it("глибина = ⌈log₂n⌉ для степенів двійки", () => {
    expect(countOperations([1, 2], "topDown").depth).toBe(1)
    expect(countOperations([1, 2, 3, 4], "topDown").depth).toBe(2)
    expect(countOperations(MERGE_INTRO, "topDown").depth).toBe(3)
  })
})

describe("mergeSortSteps — журнал подій і дерево рекурсії", () => {
  const { result, events } = mergeSortSteps(MERGE_INTRO)

  it("сортує правильно й завершується подією final", () => {
    expect(result).toEqual([...MERGE_INTRO_SORTED])
    expect(events[events.length - 1].kind).toBe("final")
  })

  it("для INTRO: 7 поділів, 8 базових, 7 злить (+ final = 23 події)", () => {
    const count = (k: string) => events.filter((e) => e.kind === k).length
    expect(count("split")).toBe(7)
    expect(count("base")).toBe(8)
    expect(count("merge")).toBe(7)
    expect(events.length).toBe(23)
  })

  it("buildTree: 15 вузлів (8 листків + 7 внутрішніх), корінь без батька", () => {
    const { nodes, root } = buildTree(events)
    expect(nodes.size).toBe(15)
    expect(nodes.get(root)?.parent).toBeNull()
    const leaves = [...nodes.values()].filter((n) => n.isBase).length
    expect(leaves).toBe(8)
    // у внутрішніх вузлів заповнено result (злиття) і двоє дітей
    const rootNode = nodes.get(root)!
    expect(rootNode.children.length).toBe(2)
    expect(rootNode.result).toEqual([...MERGE_INTRO_SORTED])
  })

  it("ids у pre-order: split-події з'являються у зростаючому порядку id", () => {
    let maxSeen = -1
    for (const e of events) {
      if (e.kind === "split" || e.kind === "base") {
        expect(e.node).toBe(maxSeen + 1)
        maxSeen = e.node
      }
    }
  })
})

describe("mergeSortBottomUpSteps — проходи", () => {
  it("INTRO: 3 проходи ширини 1,2,4; результат відсортовано", () => {
    const { result, passes } = mergeSortBottomUpSteps(MERGE_INTRO)
    expect(result).toEqual([...MERGE_INTRO_SORTED])
    expect(passes.map((p) => p.width)).toEqual([1, 2, 4])
    // у перший прохід — 4 злиття пар одинарних пробіжок
    expect(passes[0].merges.length).toBe(4)
  })

  it("CONSPECT (не степінь 2): поодинокий хвіст без пари не зливається", () => {
    const { passes } = mergeSortBottomUpSteps(MERGE_CONSPECT)
    // n=5: прохід ширини 1 → пари (0,1),(2,3); елемент [4] без пари → лише 2 злиття
    expect(passes[0].merges.length).toBe(2)
  })
})

describe("isSorted", () => {
  it("розпізнає відсортовані та невідсортовані масиви", () => {
    expect(isSorted([1, 2, 3])).toBe(true)
    expect(isSorted([1, 3, 2])).toBe(false)
    expect(isSorted([])).toBe(true)
    expect(isSorted([5])).toBe(true)
  })
})
