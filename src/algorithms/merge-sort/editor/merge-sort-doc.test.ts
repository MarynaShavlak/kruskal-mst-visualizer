import { describe, it, expect } from "vitest"
import { mergeSortCodec } from "@/algorithms/merge-sort/editor/merge-sort-doc"
import type { MergeSortDoc } from "@/store/merge-sort-store"

const DOC: MergeSortDoc = { values: [8, 4, 6, 2, 7, 1, 5, 3] }

describe("mergeSortCodec: round-trip", () => {
  it("JSON туди-назад зберігає документ", () => {
    expect(mergeSortCodec.fromJSON(mergeSortCodec.toJSON(DOC))).toEqual(DOC)
  })

  it("hash (base64url) туди-назад зберігає документ", () => {
    expect(mergeSortCodec.decodeHash(mergeSortCodec.encodeHash(DOC))).toEqual(DOC)
  })

  it("decodeHash на сміттєвому рядку повертає null", () => {
    expect(mergeSortCodec.decodeHash("не-base64-$$$")).toBeNull()
  })
})

describe("mergeSortCodec: валідація та санітизація", () => {
  it("кидає на невалідних документах", () => {
    expect(() => mergeSortCodec.fromJSON("null")).toThrow()
    expect(() => mergeSortCodec.fromJSON(JSON.stringify({ version: 2 }))).toThrow()
    expect(() =>
      mergeSortCodec.fromJSON(JSON.stringify({ version: 1, values: "ні" })),
    ).toThrow()
  })

  it("санітизує значення (цілі ≥0)", () => {
    const doc = mergeSortCodec.fromJSON(
      JSON.stringify({ version: 1, values: [-3, 2.9, 10] }),
    )
    expect(doc.values).toEqual([0, 2, 10])
  })
})
