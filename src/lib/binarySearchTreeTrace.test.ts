import { describe, it, expect } from "vitest"
import {
  buildBinarySearchTreeTrace,
  codeFor,
  BST_INSERT_CODE,
  BST_SEARCH_CODE,
  BST_DELETE_CODE,
} from "@/lib/binarySearchTreeTrace"
import { traverse } from "@/lib/treeTraversal"
import {
  BST_INTRO_OPS,
  BST_INTRO_ORDERS,
  BST_INTRO_STATS,
} from "@/lib/exampleBinarySearchTree"

describe("buildBinarySearchTreeTrace (головний приклад)", () => {
  const trace = buildBinarySearchTreeTrace(BST_INTRO_OPS)

  it("46 кадрів; перший init, останній done", () => {
    expect(trace.frames.length).toBe(BST_INTRO_STATS.frames)
    expect(trace.frames[0].kind).toBe("init")
    expect(trace.frames[trace.frames.length - 1].kind).toBe("done")
  })

  it("індекс кадру i збігається з позицією у списку", () => {
    trace.frames.forEach((f, i) => expect(f.i).toBe(i))
  })

  it("підсумок — еталон (6 вузлів / висота 2 / 15 порівнянь)", () => {
    expect(trace.result.size).toBe(BST_INTRO_STATS.size)
    expect(trace.result.height).toBe(BST_INTRO_STATS.height)
    expect(trace.result.comparisons).toBe(BST_INTRO_STATS.comparisons)
    expect(traverse(trace.result.tree, "inorder")).toEqual([...BST_INTRO_ORDERS.inorder])
  })

  it("кожен кадр має непорожню нарацію; порівняння монотонні", () => {
    let prev = 0
    for (const f of trace.frames) {
      expect(f.caption.length).toBeGreaterThan(0)
      expect(f.comparisons).toBeGreaterThanOrEqual(prev)
      prev = f.comparisons
    }
  })

  it("кадри compare несуть рішення left/right/equal і активний вузол", () => {
    const compares = trace.frames.filter((f) => f.kind === "compare")
    expect(compares.length).toBeGreaterThan(0)
    for (const f of compares) {
      expect(["left", "right", "equal"]).toContain(f.decision)
      expect(f.activeId).not.toBeNull()
    }
  })

  it("кадр opKind перемикає лістинг коду (insert/search/delete)", () => {
    const insertFrame = trace.frames.find((f) => f.opKind === "insert")!
    const searchFrame = trace.frames.find((f) => f.opKind === "search")!
    const deleteFrame = trace.frames.find((f) => f.opKind === "delete")!
    expect(codeFor(insertFrame.opKind)).toBe(BST_INSERT_CODE)
    expect(codeFor(searchFrame.opKind)).toBe(BST_SEARCH_CODE)
    expect(codeFor(deleteFrame.opKind)).toBe(BST_DELETE_CODE)
  })

  it("пошук 4 проходить шлях 5→3→4 і знаходить (3 порівняння в межах операції)", () => {
    const searchCompares = trace.frames.filter(
      (f) => f.kind === "compare" && f.op?.kind === "search",
    )
    expect(searchCompares.map((f) => f.decision)).toEqual(["left", "right", "equal"])
    expect(trace.frames.some((f) => f.kind === "found")).toBe(true)
  })

  it("видалення 7 (два нащадки) має succ_scan, replace та unlink", () => {
    const del = trace.frames.filter((f) => f.op?.kind === "delete")
    expect(del.some((f) => f.kind === "succ_scan")).toBe(true)
    expect(del.some((f) => f.kind === "replace")).toBe(true)
    expect(del.some((f) => f.kind === "unlink" && f.deleteCase === "two-children")).toBe(true)
  })

  it("знімки дерева зростають при вставках і зменшуються при видаленні", () => {
    const afterInserts = trace.frames.filter((f) => f.kind === "op_done" && f.op?.kind === "insert")
    expect(afterInserts[afterInserts.length - 1].size).toBe(7)
    const done = trace.frames[trace.frames.length - 1]
    expect(done.size).toBe(6) // одне видалення
  })
})

describe("лістинги коду", () => {
  it("insert згадує ліве/праве піддерево; search — рівність; delete — наступник", () => {
    expect(BST_INSERT_CODE.some((l) => l.includes("root.left = insert"))).toBe(true)
    expect(BST_SEARCH_CODE.some((l) => l.includes("key == root.val"))).toBe(true)
    expect(BST_DELETE_CODE.some((l) => l.includes("min_value(root.right)"))).toBe(true)
  })

  it("codeFor(null) → лістинг вставки за замовчуванням", () => {
    expect(codeFor(null)).toBe(BST_INSERT_CODE)
  })
})
