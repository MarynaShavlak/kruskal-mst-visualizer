import { describe, it, expect } from "vitest"
import {
  bstSteps,
  runBst,
  isValidBst,
  type BstOp,
} from "@/lib/binarySearchTree"
import { traverse, treeHeight } from "@/lib/treeTraversal"
import {
  BST_INTRO_OPS,
  BST_INTRO_ORDERS,
  BST_INTRO_STATS,
  BST_DEGENERATE_OPS,
  BST_BALANCED_OPS,
  BST_DELETE_CASES_OPS,
} from "@/lib/exampleBinarySearchTree"

describe("runBst (головний приклад)", () => {
  const run = runBst(BST_INTRO_OPS)

  it("будує коректне ДДП (інваріант ліворуч<вузол<праворуч)", () => {
    expect(isValidBst(run.tree)).toBe(true)
  })

  it("фінальне дерево після видалення 7: preorder/inorder як у конспекті", () => {
    expect(traverse(run.tree, "preorder")).toEqual([...BST_INTRO_ORDERS.preorder])
    expect(traverse(run.tree, "inorder")).toEqual([...BST_INTRO_ORDERS.inorder])
  })

  it("центровий обхід завжди відсортований (властивість ДДП)", () => {
    const io = traverse(run.tree, "inorder")
    expect([...io]).toEqual([...io].sort((a, b) => a - b))
  })

  it("підсумок — еталон (6 вузлів / висота 2 / 15 порівнянь)", () => {
    expect(run.size).toBe(BST_INTRO_STATS.size)
    expect(run.height).toBe(BST_INTRO_STATS.height)
    expect(run.comparisons).toBe(BST_INTRO_STATS.comparisons)
  })

  it("вердикти операцій: 7 вставок, знайдено, видалено", () => {
    expect(run.perOp.map((p) => p.result)).toEqual([
      "inserted", "inserted", "inserted", "inserted", "inserted", "inserted", "inserted",
      "found", "deleted",
    ])
  })
})

describe("властивість ДДП: центровий обхід = відсортовано", () => {
  it("на випадкових скриптах вставок дерево лишається валідним і сортує", () => {
    const seeds = [3, 9, 12, 5, 1, 8, 6, 11, 2, 7]
    const ops: BstOp[] = seeds.map((k) => ({ kind: "insert", key: k }))
    const run = runBst(ops)
    expect(isValidBst(run.tree)).toBe(true)
    expect(traverse(run.tree, "inorder")).toEqual([...seeds].sort((a, b) => a - b))
  })

  it("повторна вставка наявного ключа — no-op (набір унікальних ключів)", () => {
    const run = runBst([
      { kind: "insert", key: 5 },
      { kind: "insert", key: 5 },
      { kind: "insert", key: 5 },
    ])
    expect(run.size).toBe(1)
    expect(run.perOp.map((p) => p.result)).toEqual(["inserted", "exists", "exists"])
  })
})

describe("пошук", () => {
  it("знаходить наявний і не знаходить відсутній ключ", () => {
    const run = runBst([
      { kind: "insert", key: 5 },
      { kind: "insert", key: 3 },
      { kind: "insert", key: 8 },
      { kind: "search", key: 3 },
      { kind: "search", key: 9 },
    ])
    expect(run.perOp[3].result).toBe("found")
    expect(run.perOp[4].result).toBe("missing")
  })
})

describe("видалення — усі три випадки", () => {
  const run = runBst(BST_DELETE_CASES_OPS)

  it("лишається валідним ДДП після трьох видалень", () => {
    expect(isValidBst(run.tree)).toBe(true)
  })

  it("delete лист / один нащадок / два нащадки — усі 'deleted'", () => {
    const deletes = run.perOp.filter((p) => p.op.kind === "delete")
    expect(deletes.map((p) => p.result)).toEqual(["deleted", "deleted", "deleted"])
  })

  it("журнал містить події для кожного випадку (leaf / one-child / two-children)", () => {
    const { events } = bstSteps(BST_DELETE_CASES_OPS)
    const cases = events
      .filter((e) => e.kind === "unlink")
      .map((e) => e.deleteCase)
    expect(cases).toContain("leaf")
    expect(cases).toContain("one-child")
    expect(cases).toContain("two-children")
  })

  it("видалення вузла з двома дітьми замінює його на наступник (replace + succ_scan)", () => {
    const { events } = bstSteps(BST_DELETE_CASES_OPS)
    expect(events.some((e) => e.kind === "succ_scan")).toBe(true)
    expect(events.some((e) => e.kind === "replace")).toBe(true)
  })

  it("видалення відсутнього ключа → missing, дерево не змінюється", () => {
    const before = runBst([
      { kind: "insert", key: 5 },
      { kind: "insert", key: 3 },
    ])
    const after = runBst([
      { kind: "insert", key: 5 },
      { kind: "insert", key: 3 },
      { kind: "delete", key: 99 },
    ])
    expect(after.perOp[2].result).toBe("missing")
    expect(traverse(after.tree, "inorder")).toEqual(traverse(before.tree, "inorder"))
  })

  it("видалення кореня з двома дітьми зберігає інваріант", () => {
    const run = runBst([
      { kind: "insert", key: 5 },
      { kind: "insert", key: 3 },
      { kind: "insert", key: 8 },
      { kind: "insert", key: 7 },
      { kind: "insert", key: 9 },
      { kind: "delete", key: 5 },
    ])
    expect(isValidBst(run.tree)).toBe(true)
    expect(traverse(run.tree, "inorder")).toEqual([3, 7, 8, 9])
  })

  it("видалення до порожнього дерева", () => {
    const run = runBst([
      { kind: "insert", key: 5 },
      { kind: "delete", key: 5 },
    ])
    expect(run.size).toBe(0)
    expect(run.tree.root).toBeNull()
    expect(treeHeight(run.tree)).toBe(-1)
  })
})

describe("збалансоване проти виродженого (та сама п'ятірка ключів)", () => {
  it("вироджене (1,2,3,4,5): висота 4, пошук 5 = 5 порівнянь", () => {
    const run = runBst(BST_DEGENERATE_OPS)
    expect(run.height).toBe(4)
    expect(isValidBst(run.tree)).toBe(true)
  })

  it("збалансоване (3,2,4,1,5): висота 2 — коротший шлях", () => {
    const run = runBst(BST_BALANCED_OPS)
    expect(run.height).toBe(2)
  })

  it("вироджене дорожче за збалансоване на пошуку того самого ключа", () => {
    const deg = bstSteps(BST_DEGENERATE_OPS)
    const bal = bstSteps(BST_BALANCED_OPS)
    expect(deg.comparisons).toBeGreaterThan(bal.comparisons)
  })
})
