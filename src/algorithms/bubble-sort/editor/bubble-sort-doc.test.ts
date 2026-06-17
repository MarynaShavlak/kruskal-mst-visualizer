import { describe, it, expect } from "vitest"
import { bubbleSortCodec } from "@/algorithms/bubble-sort/editor/bubble-sort-doc"
import type { BubbleSortDoc } from "@/store/bubble-sort-store"

const DOC: BubbleSortDoc = { values: [5, 1, 4, 2, 8, 3] }

describe("bubbleSortCodec: round-trip", () => {
  it("JSON туди-назад зберігає документ", () => {
    expect(bubbleSortCodec.fromJSON(bubbleSortCodec.toJSON(DOC))).toEqual(DOC)
  })

  it("hash (base64url) туди-назад зберігає документ", () => {
    expect(bubbleSortCodec.decodeHash(bubbleSortCodec.encodeHash(DOC))).toEqual(DOC)
  })

  it("decodeHash на сміттєвому рядку повертає null", () => {
    expect(bubbleSortCodec.decodeHash("не-base64-$$$")).toBeNull()
  })
})

describe("bubbleSortCodec: валідація та санітизація", () => {
  it("кидає на невалідних документах", () => {
    expect(() => bubbleSortCodec.fromJSON("null")).toThrow()
    expect(() => bubbleSortCodec.fromJSON(JSON.stringify({ version: 2 }))).toThrow()
    expect(() =>
      bubbleSortCodec.fromJSON(JSON.stringify({ version: 1, values: "ні" })),
    ).toThrow()
  })

  it("санітизує значення (цілі ≥0)", () => {
    const doc = bubbleSortCodec.fromJSON(
      JSON.stringify({ version: 1, values: [-3, 2.9, 10] }),
    )
    expect(doc.values).toEqual([0, 2, 10])
  })
})
