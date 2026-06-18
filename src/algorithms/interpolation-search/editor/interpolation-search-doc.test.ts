import { describe, it, expect } from "vitest"
import { interpolationSearchCodec } from "@/algorithms/interpolation-search/editor/interpolation-search-doc"
import type { InterpolationSearchDoc } from "@/store/interpolation-search-store"

const DOC: InterpolationSearchDoc = {
  values: [1, 3, 5, 7, 9, 11, 14, 16, 18, 20, 22, 25, 28, 30],
  target: 25,
}

describe("interpolationSearchCodec: round-trip", () => {
  it("JSON туди-назад зберігає документ (масив + ціль)", () => {
    expect(interpolationSearchCodec.fromJSON(interpolationSearchCodec.toJSON(DOC))).toEqual(DOC)
  })

  it("hash (base64url) туди-назад зберігає документ", () => {
    expect(interpolationSearchCodec.decodeHash(interpolationSearchCodec.encodeHash(DOC))).toEqual(DOC)
  })

  it("decodeHash на сміттєвому рядку повертає null", () => {
    expect(interpolationSearchCodec.decodeHash("не-base64-$$$")).toBeNull()
  })
})

describe("interpolationSearchCodec: валідація та санітизація", () => {
  it("кидає на невалідних документах", () => {
    expect(() => interpolationSearchCodec.fromJSON("null")).toThrow()
    expect(() => interpolationSearchCodec.fromJSON(JSON.stringify({ version: 2 }))).toThrow()
    expect(() =>
      interpolationSearchCodec.fromJSON(JSON.stringify({ version: 1, values: "ні", target: 1 })),
    ).toThrow()
    expect(() =>
      interpolationSearchCodec.fromJSON(JSON.stringify({ version: 1, values: [1, 2], target: "ні" })),
    ).toThrow()
  })

  it("санітизує значення й ціль (цілі)", () => {
    const doc = interpolationSearchCodec.fromJSON(
      JSON.stringify({ version: 1, values: [1, 2.9, 10], target: 4.6 }),
    )
    expect(doc.values).toEqual([1, 2, 10])
    expect(doc.target).toBe(4)
  })
})
