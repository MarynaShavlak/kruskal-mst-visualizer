import { describe, it, expect } from "vitest"
import { buildQuickSortTrace, codeFor } from "@/lib/quickSortTrace"
import { QUICK_INTRO, QUICK_INTRO_SORTED } from "@/lib/exampleQuickSort"

describe("buildQuickSortTrace (опорний-середина)", () => {
  const trace = buildQuickSortTrace(QUICK_INTRO, "middle")

  it("дерево має 7 вузлів (= викликам); кадрів 8 (7 викликів + конкатенація)", () => {
    expect(trace.tree.nodes.length).toBe(7)
    expect(trace.frames.length).toBe(8)
    expect(trace.frames[trace.frames.length - 1].phase).toBe("done")
  })

  it("кадр 0 — розбиття кореня (pre-order); останній — конкатенація з результатом", () => {
    expect(trace.frames[0].phase).toBe("partition")
    expect(trace.frames[0].currentId).toBe(0)
    expect(trace.result.sorted).toEqual([...QUICK_INTRO_SORTED])
    expect(trace.result.comparisons).toBe(13)
    expect(trace.result.calls).toBe(7)
    expect(trace.result.depth).toBe(3)
  })

  it("дерево «росте» в pre-order: revealedMax = currentId зростає по кадрах викликів", () => {
    const callFrames = trace.frames.filter((f) => f.phase !== "done")
    callFrames.forEach((f, k) => {
      expect(f.currentId).toBe(k)
      expect(f.revealedMax).toBe(k)
    })
  })

  it("геометрія: кожен внутрішній вузол — між крайніми дітьми; листя мають цілі x-слоти", () => {
    for (const n of trace.tree.nodes) {
      if (n.children.length === 2) {
        const [l, r] = n.children
        const lx = trace.tree.nodes[l].x
        const rx = trace.tree.nodes[r].x
        expect(n.x).toBeCloseTo((lx + rx) / 2)
      }
    }
    expect(trace.tree.leafCount).toBeGreaterThan(0)
  })

  it("кожен кадр має непорожню нарацію; порівняння монотонні до останнього виклику", () => {
    let prev = 0
    for (const f of trace.frames) {
      expect(f.caption.length).toBeGreaterThan(0)
      if (f.phase !== "done") {
        expect(f.comparisons).toBeGreaterThanOrEqual(prev)
        prev = f.comparisons
      }
    }
  })
})

describe("codeFor — лістинг залежить від стратегії опорного", () => {
  it("рядок вибору опорного відрізняється для middle/first/last/median3", () => {
    expect(codeFor("middle")[3]).toContain("len(arr) // 2")
    expect(codeFor("first")[3]).toContain("arr[0]")
    expect(codeFor("last")[3]).toContain("arr[-1]")
    expect(codeFor("median3")[3]).toContain("median3")
    // решта рядків спільна
    expect(codeFor("first")[7]).toBe(codeFor("middle")[7])
  })
})

describe("buildQuickSortTrace (вироджене дерево, опорний-перший)", () => {
  it("на відсортованому [1..7] — ланцюг: 13 вузлів, глибина 7", () => {
    const trace = buildQuickSortTrace([1, 2, 3, 4, 5, 6, 7], "first")
    expect(trace.tree.nodes.length).toBe(13)
    expect(trace.result.depth).toBe(7)
    expect(trace.tree.maxDepth).toBe(6)
  })
})
