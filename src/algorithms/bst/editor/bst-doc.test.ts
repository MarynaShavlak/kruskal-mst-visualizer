import { describe, it, expect } from "vitest"
import { bstCodec } from "@/algorithms/bst/editor/bst-doc"
import type { BstDoc } from "@/store/bst-store"

const DOC: BstDoc = {
  ops: [
    { kind: "insert", key: 5 },
    { kind: "insert", key: 3 },
    { kind: "search", key: 3 },
    { kind: "delete", key: 5 },
  ],
}

describe("bstCodec: round-trip", () => {
  it("JSON туди-назад зберігає документ", () => {
    expect(bstCodec.fromJSON(bstCodec.toJSON(DOC))).toEqual(DOC)
  })

  it("hash (base64url) туди-назад зберігає документ", () => {
    expect(bstCodec.decodeHash(bstCodec.encodeHash(DOC))).toEqual(DOC)
  })

  it("усі три види операцій серіалізуються", () => {
    const back = bstCodec.fromJSON(bstCodec.toJSON(DOC))
    expect(back.ops.map((o) => o.kind)).toEqual(["insert", "insert", "search", "delete"])
  })

  it("decodeHash на сміттєвому рядку повертає null", () => {
    expect(bstCodec.decodeHash("не-base64-$$$")).toBeNull()
  })
})

describe("bstCodec: валідація та санітизація", () => {
  it("кидає на невалідних документах", () => {
    expect(() => bstCodec.fromJSON("null")).toThrow()
    expect(() => bstCodec.fromJSON(JSON.stringify({ version: 2 }))).toThrow()
    expect(() =>
      bstCodec.fromJSON(JSON.stringify({ version: 1, ops: [["nope", 5]] })),
    ).toThrow()
    expect(() =>
      bstCodec.fromJSON(JSON.stringify({ version: 1, ops: [["insert", "x"]] })),
    ).toThrow()
  })

  it("округлює ключі до цілих при серіалізації", () => {
    const back = bstCodec.fromJSON(
      bstCodec.toJSON({ ops: [{ kind: "insert", key: 4.7 }] }),
    )
    expect(back.ops[0].key).toBe(5)
  })
})
