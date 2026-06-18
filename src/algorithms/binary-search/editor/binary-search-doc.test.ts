import { describe, it, expect } from "vitest"
import { binarySearchCodec } from "@/algorithms/binary-search/editor/binary-search-doc"
import type { BinarySearchDoc } from "@/store/binary-search-store"

const DOC: BinarySearchDoc = {
  values: [1, 3, 5, 8, 10, 12, 15, 18, 20, 22, 24],
  target: 15,
}

describe("binarySearchCodec: round-trip", () => {
  it("JSON туди-назад зберігає документ (масив + ціль)", () => {
    expect(binarySearchCodec.fromJSON(binarySearchCodec.toJSON(DOC))).toEqual(DOC)
  })

  it("hash (base64url) туди-назад зберігає документ", () => {
    expect(binarySearchCodec.decodeHash(binarySearchCodec.encodeHash(DOC))).toEqual(DOC)
  })

  it("decodeHash на сміттєвому рядку повертає null", () => {
    expect(binarySearchCodec.decodeHash("не-base64-$$$")).toBeNull()
  })
})

describe("binarySearchCodec: валідація та санітизація", () => {
  it("кидає на невалідних документах", () => {
    expect(() => binarySearchCodec.fromJSON("null")).toThrow()
    expect(() => binarySearchCodec.fromJSON(JSON.stringify({ version: 2 }))).toThrow()
    expect(() =>
      binarySearchCodec.fromJSON(JSON.stringify({ version: 1, values: "ні", target: 1 })),
    ).toThrow()
    expect(() =>
      binarySearchCodec.fromJSON(JSON.stringify({ version: 1, values: [1, 2], target: "ні" })),
    ).toThrow()
  })

  it("санітизує значення й ціль (цілі)", () => {
    const doc = binarySearchCodec.fromJSON(
      JSON.stringify({ version: 1, values: [1, 2.9, 10], target: 4.6 }),
    )
    expect(doc.values).toEqual([1, 2, 10])
    expect(doc.target).toBe(4)
  })
})
