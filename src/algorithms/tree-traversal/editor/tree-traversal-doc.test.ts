import { describe, it, expect } from "vitest"
import { treeTraversalCodec } from "@/algorithms/tree-traversal/editor/tree-traversal-doc"
import type { TreeTraversalDoc } from "@/store/tree-traversal-store"

const INTRO: TreeTraversalDoc = {
  levels: [1, 2, 3, 4, 5],
  order: "preorder",
}

const WITH_HOLES: TreeTraversalDoc = {
  levels: [1, 2, null, 3, null, 4],
  order: "postorder",
}

describe("treeTraversalCodec: round-trip", () => {
  it("JSON туди-назад зберігає документ", () => {
    expect(treeTraversalCodec.fromJSON(treeTraversalCodec.toJSON(INTRO))).toEqual(INTRO)
  })

  it("hash (base64url) туди-назад зберігає документ", () => {
    expect(treeTraversalCodec.decodeHash(treeTraversalCodec.encodeHash(INTRO))).toEqual(INTRO)
  })

  it("зберігає дірки (null) у рівневому списку", () => {
    const back = treeTraversalCodec.fromJSON(treeTraversalCodec.toJSON(WITH_HOLES))
    expect(back.levels).toEqual([1, 2, null, 3, null, 4])
    expect(back.order).toBe("postorder")
  })

  it("усі три порядки серіалізуються без втрат", () => {
    for (const order of ["preorder", "inorder", "postorder"] as const) {
      const doc = { ...INTRO, order }
      expect(treeTraversalCodec.fromJSON(treeTraversalCodec.toJSON(doc)).order).toBe(order)
    }
  })

  it("decodeHash на сміттєвому рядку повертає null", () => {
    expect(treeTraversalCodec.decodeHash("не-base64-$$$")).toBeNull()
  })
})

describe("treeTraversalCodec: валідація та санітизація", () => {
  it("кидає на невалідних документах", () => {
    expect(() => treeTraversalCodec.fromJSON("null")).toThrow()
    expect(() => treeTraversalCodec.fromJSON(JSON.stringify({ version: 2 }))).toThrow()
    // levels з нечисловим не-null елементом
    expect(() =>
      treeTraversalCodec.fromJSON(
        JSON.stringify({ version: 1, levels: [1, "x", 3], order: "preorder" }),
      ),
    ).toThrow()
    // невідомий порядок
    expect(() =>
      treeTraversalCodec.fromJSON(
        JSON.stringify({ version: 1, levels: [1, 2, 3], order: "spiral" }),
      ),
    ).toThrow()
  })

  it("округлює значення до цілих при серіалізації", () => {
    const back = treeTraversalCodec.fromJSON(
      treeTraversalCodec.toJSON({ levels: [1.9, null, 3.2], order: "inorder" }),
    )
    expect(back.levels).toEqual([2, null, 3])
  })
})
