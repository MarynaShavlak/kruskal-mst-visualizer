import { describe, it, expect, beforeEach } from "vitest"
import { useBstStore } from "@/store/bst-store"
import {
  BST_INTRO_OPS,
  BST_DEGENERATE_OPS,
  BST_BALANCED_OPS,
} from "@/lib/exampleBinarySearchTree"

const get = () => useBstStore.getState()

describe("bst-store", () => {
  beforeEach(() => get().loadIntro())

  it("стартовий стан — класичний еталон із конспекту", () => {
    expect(get().ops).toEqual(BST_INTRO_OPS)
  })

  it("addOp додає insert; addOp('search'/'delete') додають відповідний вид", () => {
    const n = get().ops.length
    get().addOp()
    expect(get().ops[n].kind).toBe("insert")
    get().addOp("search")
    expect(get().ops[n + 1].kind).toBe("search")
    get().addOp("delete")
    expect(get().ops[n + 2].kind).toBe("delete")
  })

  it("updateOp санітизує kind (недозволений → insert) і key (ціле)", () => {
    get().updateOp(0, { key: 12.9 })
    expect(get().ops[0]).toEqual({ kind: "insert", key: 12 })
    get().updateOp(1, { kind: "bogus" as never })
    expect(get().ops[1].kind).toBe("insert")
    get().updateOp(2, { kind: "search" })
    expect(get().ops[2].kind).toBe("search")
  })

  it("removeOp прибирає операцію за індексом", () => {
    const before = get().ops.length
    get().removeOp(0)
    expect(get().ops.length).toBe(before - 1)
    expect(get().ops[0].key).toBe(3) // друга операція еталона — insert 3
  })

  it("clear лишає порожній скрипт", () => {
    get().clear()
    expect(get().ops).toEqual([])
  })

  it("пресети завантажуються (вироджений / збалансований)", () => {
    get().loadDegenerate()
    expect(get().ops).toEqual(BST_DEGENERATE_OPS)
    get().loadBalanced()
    expect(get().ops).toEqual(BST_BALANCED_OPS)
  })

  it("випадковий пресет детермінований за seed", () => {
    get().loadRandom(123)
    const a = get().ops
    get().loadIntro()
    get().loadRandom(123)
    expect(get().ops).toEqual(a)
  })

  it("toDoc/loadDoc — round-trip", () => {
    get().loadBalanced()
    const doc = get().toDoc()
    get().clear()
    get().loadDoc(doc)
    expect(get().ops).toEqual(BST_BALANCED_OPS)
  })
})
