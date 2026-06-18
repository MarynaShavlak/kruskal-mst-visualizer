import { describe, it, expect } from "vitest"
import { radixSortCodec } from "@/algorithms/radix-sort/editor/radix-sort-doc"
import type { RadixSortDoc } from "@/store/radix-sort-store"

const DOC: RadixSortDoc = { values: [3, 89, 67, 254, 9, 21, 185, 4, 62] }

describe("radixSortCodec: round-trip", () => {
  it("JSON туди-назад зберігає документ", () => {
    expect(radixSortCodec.fromJSON(radixSortCodec.toJSON(DOC))).toEqual(DOC)
  })

  it("hash (base64url) туди-назад зберігає документ", () => {
    expect(radixSortCodec.decodeHash(radixSortCodec.encodeHash(DOC))).toEqual(DOC)
  })

  it("decodeHash на сміттєвому рядку повертає null", () => {
    expect(radixSortCodec.decodeHash("не-base64-$$$")).toBeNull()
  })
})

describe("radixSortCodec: валідація та санітизація", () => {
  it("кидає на невалідних документах", () => {
    expect(() => radixSortCodec.fromJSON("null")).toThrow()
    expect(() => radixSortCodec.fromJSON(JSON.stringify({ version: 2 }))).toThrow()
    expect(() =>
      radixSortCodec.fromJSON(JSON.stringify({ version: 1, values: "ні" })),
    ).toThrow()
  })

  it("санітизує значення (невід'ємні цілі)", () => {
    const doc = radixSortCodec.fromJSON(
      JSON.stringify({ version: 1, values: [-3, 2.9, 10] }),
    )
    expect(doc.values).toEqual([0, 2, 10])
  })
})
