import { describe, it, expect } from "vitest"
import { quickSortCodec } from "@/algorithms/quick-sort/editor/quick-sort-doc"
import type { QuickSortDoc } from "@/store/quick-sort-store"

const DOC: QuickSortDoc = { values: [3, 5, 2, 4, 6, 1, 7] }

describe("quickSortCodec: round-trip", () => {
  it("JSON туди-назад зберігає документ", () => {
    expect(quickSortCodec.fromJSON(quickSortCodec.toJSON(DOC))).toEqual(DOC)
  })

  it("hash (base64url) туди-назад зберігає документ", () => {
    expect(quickSortCodec.decodeHash(quickSortCodec.encodeHash(DOC))).toEqual(DOC)
  })

  it("decodeHash на сміттєвому рядку повертає null", () => {
    expect(quickSortCodec.decodeHash("не-base64-$$$")).toBeNull()
  })
})

describe("quickSortCodec: валідація та санітизація", () => {
  it("кидає на невалідних документах", () => {
    expect(() => quickSortCodec.fromJSON("null")).toThrow()
    expect(() => quickSortCodec.fromJSON(JSON.stringify({ version: 2 }))).toThrow()
    expect(() =>
      quickSortCodec.fromJSON(JSON.stringify({ version: 1, values: "ні" })),
    ).toThrow()
  })

  it("санітизує значення (цілі ≥0)", () => {
    const doc = quickSortCodec.fromJSON(
      JSON.stringify({ version: 1, values: [-3, 2.9, 10] }),
    )
    expect(doc.values).toEqual([0, 2, 10])
  })
})
