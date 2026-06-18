import { describe, it, expect } from "vitest"
import { insertionSortCodec } from "@/algorithms/insertion-sort/editor/insertion-sort-doc"
import type { InsertionSortDoc } from "@/store/insertion-sort-store"

const DOC: InsertionSortDoc = { values: [5, 2, 4, 6, 1, 3] }

describe("insertionSortCodec: round-trip", () => {
  it("JSON туди-назад зберігає документ", () => {
    expect(insertionSortCodec.fromJSON(insertionSortCodec.toJSON(DOC))).toEqual(DOC)
  })

  it("hash (base64url) туди-назад зберігає документ", () => {
    expect(insertionSortCodec.decodeHash(insertionSortCodec.encodeHash(DOC))).toEqual(DOC)
  })

  it("decodeHash на сміттєвому рядку повертає null", () => {
    expect(insertionSortCodec.decodeHash("не-base64-$$$")).toBeNull()
  })
})

describe("insertionSortCodec: валідація та санітизація", () => {
  it("кидає на невалідних документах", () => {
    expect(() => insertionSortCodec.fromJSON("null")).toThrow()
    expect(() => insertionSortCodec.fromJSON(JSON.stringify({ version: 2 }))).toThrow()
    expect(() =>
      insertionSortCodec.fromJSON(JSON.stringify({ version: 1, values: "ні" })),
    ).toThrow()
  })

  it("санітизує значення (цілі ≥0)", () => {
    const doc = insertionSortCodec.fromJSON(
      JSON.stringify({ version: 1, values: [-3, 2.9, 10] }),
    )
    expect(doc.values).toEqual([0, 2, 10])
  })
})
