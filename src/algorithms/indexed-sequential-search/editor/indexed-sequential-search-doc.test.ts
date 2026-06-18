import { describe, it, expect } from "vitest"
import { indexedSequentialSearchCodec } from "@/algorithms/indexed-sequential-search/editor/indexed-sequential-search-doc"
import type { IndexedSequentialSearchDoc } from "@/store/indexed-sequential-search-store"

const DOC: IndexedSequentialSearchDoc = {
  values: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25],
  target: 15,
  step: 4,
}

describe("indexedSequentialSearchCodec: round-trip", () => {
  it("JSON туди-назад зберігає документ (масив + ціль + крок)", () => {
    expect(indexedSequentialSearchCodec.fromJSON(indexedSequentialSearchCodec.toJSON(DOC))).toEqual(DOC)
  })

  it("hash (base64url) туди-назад зберігає документ", () => {
    expect(indexedSequentialSearchCodec.decodeHash(indexedSequentialSearchCodec.encodeHash(DOC))).toEqual(DOC)
  })

  it("decodeHash на сміттєвому рядку повертає null", () => {
    expect(indexedSequentialSearchCodec.decodeHash("не-base64-$$$")).toBeNull()
  })
})

describe("indexedSequentialSearchCodec: валідація та санітизація", () => {
  it("кидає на невалідних документах", () => {
    expect(() => indexedSequentialSearchCodec.fromJSON("null")).toThrow()
    expect(() => indexedSequentialSearchCodec.fromJSON(JSON.stringify({ version: 2 }))).toThrow()
    expect(() =>
      indexedSequentialSearchCodec.fromJSON(JSON.stringify({ version: 1, values: "ні", target: 1, step: 4 })),
    ).toThrow()
    expect(() =>
      indexedSequentialSearchCodec.fromJSON(JSON.stringify({ version: 1, values: [1, 2], target: "ні", step: 4 })),
    ).toThrow()
    expect(() =>
      indexedSequentialSearchCodec.fromJSON(JSON.stringify({ version: 1, values: [1, 2], target: 1, step: "ні" })),
    ).toThrow()
  })

  it("санітизує значення, ціль (цілі) і крок (≥1)", () => {
    const doc = indexedSequentialSearchCodec.fromJSON(
      JSON.stringify({ version: 1, values: [1, 2.9, 10], target: 4.6, step: 0 }),
    )
    expect(doc.values).toEqual([1, 2, 10])
    expect(doc.target).toBe(4)
    expect(doc.step).toBe(1)
  })
})
