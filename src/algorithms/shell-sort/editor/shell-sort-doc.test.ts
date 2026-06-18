import { describe, it, expect } from "vitest"
import { shellSortCodec } from "@/algorithms/shell-sort/editor/shell-sort-doc"
import type { ShellSortDoc } from "@/store/shell-sort-store"

const DOC: ShellSortDoc = { values: [8, 5, 3, 7, 6, 1, 4, 2] }

describe("shellSortCodec: round-trip", () => {
  it("JSON туди-назад зберігає документ", () => {
    expect(shellSortCodec.fromJSON(shellSortCodec.toJSON(DOC))).toEqual(DOC)
  })

  it("hash (base64url) туди-назад зберігає документ", () => {
    expect(shellSortCodec.decodeHash(shellSortCodec.encodeHash(DOC))).toEqual(DOC)
  })

  it("decodeHash на сміттєвому рядку повертає null", () => {
    expect(shellSortCodec.decodeHash("не-base64-$$$")).toBeNull()
  })
})

describe("shellSortCodec: валідація та санітизація", () => {
  it("кидає на невалідних документах", () => {
    expect(() => shellSortCodec.fromJSON("null")).toThrow()
    expect(() => shellSortCodec.fromJSON(JSON.stringify({ version: 2 }))).toThrow()
    expect(() =>
      shellSortCodec.fromJSON(JSON.stringify({ version: 1, values: "ні" })),
    ).toThrow()
  })

  it("санітизує значення (цілі ≥0)", () => {
    const doc = shellSortCodec.fromJSON(
      JSON.stringify({ version: 1, values: [-3, 2.9, 10] }),
    )
    expect(doc.values).toEqual([0, 2, 10])
  })
})
