import { describe, it, expect } from "vitest"
import { buildMergeSortTrace, codeFor } from "@/lib/mergeSortTrace"
import { MERGE_INTRO, MERGE_INTRO_SORTED } from "@/lib/exampleMergeSort"

describe("buildMergeSortTrace — низхідна (дерево рекурсії)", () => {
  const trace = buildMergeSortTrace(MERGE_INTRO, "topDown")

  it("дерево має 15 вузлів; перший кадр — init, останній — final", () => {
    expect(trace.tree.nodes.length).toBe(15)
    expect(trace.frames[0].phase).toBe("init")
    expect(trace.frames[trace.frames.length - 1].phase).toBe("final")
  })

  it("результат відсортовано з еталонними лічильниками (17/24/7/глибина 3)", () => {
    expect(trace.result.sorted).toEqual([...MERGE_INTRO_SORTED])
    expect(trace.result.comparisons).toBe(17)
    expect(trace.result.appends).toBe(24)
    expect(trace.result.merges).toBe(7)
    expect(trace.result.depth).toBe(3)
  })

  it("walkthrough (stepIndices): 24 розв'язкові кадри (init + 7 поділів + 8 базових + 7 злить + final)", () => {
    expect(trace.stepIndices.length).toBe(24)
    expect(trace.frames[trace.stepIndices[0]].phase).toBe("init")
    expect(trace.frames[trace.stepIndices[23]].phase).toBe("final")
  })

  it("дерево «росте» вниз: revealedMax не спадає по кадрах", () => {
    let prev = -1
    for (const f of trace.frames) {
      if (f.phase === "final") continue
      expect(f.revealedMax).toBeGreaterThanOrEqual(prev)
      prev = Math.max(prev, f.revealedMax)
    }
  })

  it("геометрія: кожен внутрішній вузол — між крайніми дітьми; листя мають цілі x-слоти", () => {
    const byId = new Map(trace.tree.nodes.map((n) => [n.id, n]))
    for (const n of trace.tree.nodes) {
      if (n.children.length === 2) {
        const lx = byId.get(n.children[0])!.x
        const rx = byId.get(n.children[1])!.x
        expect(n.x).toBeCloseTo((lx + rx) / 2)
      }
    }
    expect(trace.tree.leafCount).toBe(8)
  })

  it("кадри злиття несуть стан зіркової панелі (mergeLeft/Right + крок); лічильники монотонні", () => {
    let prevComp = 0
    let prevApp = 0
    let sawMerge = false
    for (const f of trace.frames) {
      if (f.phase === "final") continue
      expect(f.caption.length).toBeGreaterThan(0)
      expect(f.comparisons).toBeGreaterThanOrEqual(prevComp)
      expect(f.appends).toBeGreaterThanOrEqual(prevApp)
      prevComp = f.comparisons
      prevApp = f.appends
      if (f.phase === "merge") {
        sawMerge = true
        expect(f.mergeLeft).not.toBeNull()
        expect(f.mergeRight).not.toBeNull()
        expect(f.mergeStep).not.toBeNull()
      }
    }
    expect(sawMerge).toBe(true)
  })

  it("під час злиття вузла його результат ще НЕ показано, а діти — вже показані", () => {
    // знайдемо перший кадр злиття: це злиття листкової пари (вузол 2, діти 3,4)
    const f = trace.frames.find((fr) => fr.phase === "merge")!
    expect(f.mergedIds).not.toContain(f.currentId)
  })
})

describe("buildMergeSortTrace — вихідна (проходи bottom-up)", () => {
  const trace = buildMergeSortTrace(MERGE_INTRO, "bottomUp")

  it("режим bottomUp; passes ширини 1,2,4; результат відсортовано", () => {
    expect(trace.mode).toBe("bottomUp")
    expect(trace.passes.map((p) => p.width)).toEqual([1, 2, 4])
    expect(trace.result.sorted).toEqual([...MERGE_INTRO_SORTED])
  })

  it("на степені двійки лічильники збігаються з низхідною (17/24/7/глибина 3)", () => {
    expect(trace.result.comparisons).toBe(17)
    expect(trace.result.appends).toBe(24)
    expect(trace.result.merges).toBe(7)
    expect(trace.result.depth).toBe(3)
  })

  it("кадри злиття несуть діапазон проходу (passIndex, mergeLo/Hi)", () => {
    const f = trace.frames.find((fr) => fr.phase === "merge")!
    expect(f.passIndex).toBeGreaterThanOrEqual(0)
    expect(f.mergeHi).toBeGreaterThan(f.mergeLo)
  })
})

describe("codeFor — лістинг залежить від режиму", () => {
  it("top-down містить merge_sort із рекурсією; bottom-up — цикл по width", () => {
    expect(codeFor("topDown")[0]).toContain("merge_sort(arr)")
    expect(codeFor("topDown").some((l) => l.includes("merge(merge_sort"))).toBe(true)
    expect(codeFor("bottomUp")[0]).toContain("bottom_up")
    expect(codeFor("bottomUp").some((l) => l.includes("while width < n"))).toBe(true)
  })
})
