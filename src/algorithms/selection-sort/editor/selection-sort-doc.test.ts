import { describe, it, expect } from "vitest"
import { selectionSortCodec } from "@/algorithms/selection-sort/editor/selection-sort-doc"
import type { SelectionSortDoc } from "@/store/selection-sort-store"

const DOC: SelectionSortDoc = { values: [5, 3, 8, 4, 2, 7] }

describe("selectionSortCodec: round-trip", () => {
  it("JSON туди-назад зберігає документ", () => {
    expect(selectionSortCodec.fromJSON(selectionSortCodec.toJSON(DOC))).toEqual(DOC)
  })

  it("hash (base64url) туди-назад зберігає документ", () => {
    expect(selectionSortCodec.decodeHash(selectionSortCodec.encodeHash(DOC))).toEqual(DOC)
  })

  it("decodeHash на сміттєвому рядку повертає null", () => {
    expect(selectionSortCodec.decodeHash("не-base64-$$$")).toBeNull()
  })
})

describe("selectionSortCodec: валідація та санітизація", () => {
  it("кидає на невалідних документах", () => {
    expect(() => selectionSortCodec.fromJSON("null")).toThrow()
    expect(() => selectionSortCodec.fromJSON(JSON.stringify({ version: 2 }))).toThrow()
    expect(() =>
      selectionSortCodec.fromJSON(JSON.stringify({ version: 1, values: "ні" })),
    ).toThrow()
  })

  it("санітизує значення (цілі ≥0)", () => {
    const doc = selectionSortCodec.fromJSON(
      JSON.stringify({ version: 1, values: [-3, 2.9, 10] }),
    )
    expect(doc.values).toEqual([0, 2, 10])
  })
})
