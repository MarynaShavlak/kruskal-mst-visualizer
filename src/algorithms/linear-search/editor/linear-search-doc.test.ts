import { describe, it, expect } from "vitest"
import { linearSearchCodec } from "@/algorithms/linear-search/editor/linear-search-doc"
import type { LinearSearchDoc } from "@/store/linear-search-store"

const DOC: LinearSearchDoc = { values: [5, 3, 8, 1, 4], target: 8 }

describe("linearSearchCodec: round-trip", () => {
  it("JSON туди-назад зберігає документ (масив + ціль)", () => {
    expect(linearSearchCodec.fromJSON(linearSearchCodec.toJSON(DOC))).toEqual(DOC)
  })

  it("hash (base64url) туди-назад зберігає документ", () => {
    expect(linearSearchCodec.decodeHash(linearSearchCodec.encodeHash(DOC))).toEqual(DOC)
  })

  it("decodeHash на сміттєвому рядку повертає null", () => {
    expect(linearSearchCodec.decodeHash("не-base64-$$$")).toBeNull()
  })
})

describe("linearSearchCodec: валідація та санітизація", () => {
  it("кидає на невалідних документах", () => {
    expect(() => linearSearchCodec.fromJSON("null")).toThrow()
    expect(() => linearSearchCodec.fromJSON(JSON.stringify({ version: 2 }))).toThrow()
    expect(() =>
      linearSearchCodec.fromJSON(JSON.stringify({ version: 1, values: "ні", target: 1 })),
    ).toThrow()
    expect(() =>
      linearSearchCodec.fromJSON(JSON.stringify({ version: 1, values: [1, 2], target: "ні" })),
    ).toThrow()
  })

  it("санітизує значення й ціль (цілі, дозволяє від'ємні)", () => {
    const doc = linearSearchCodec.fromJSON(
      JSON.stringify({ version: 1, values: [-3, 2.9, 10], target: 4.6 }),
    )
    expect(doc.values).toEqual([-3, 2, 10])
    expect(doc.target).toBe(4)
  })
})
