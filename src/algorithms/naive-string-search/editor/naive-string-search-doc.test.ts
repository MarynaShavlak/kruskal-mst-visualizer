import { describe, expect, it } from "vitest"
import { naiveStringSearchCodec } from "@/algorithms/naive-string-search/editor/naive-string-search-doc"
import type { NaiveStringSearchDoc } from "@/store/naive-string-search-store"

const doc: NaiveStringSearchDoc = { text: "ABABDABACDABABCABAB", pattern: "ABABCABAB" }

describe("naiveStringSearchCodec", () => {
  it("JSON round-trip зберігає текст і шаблон", () => {
    const json = naiveStringSearchCodec.toJSON(doc)
    expect(naiveStringSearchCodec.fromJSON(json)).toEqual(doc)
  })

  it("hash round-trip (base64url) зберігає документ", () => {
    const hash = naiveStringSearchCodec.encodeHash(doc)
    expect(naiveStringSearchCodec.decodeHash(hash)).toEqual(doc)
  })

  it("зберігає юнікод і пробіли (HELLO WORLD)", () => {
    const d: NaiveStringSearchDoc = { text: "HELLO WORLD", pattern: "WORLD" }
    expect(naiveStringSearchCodec.decodeHash(naiveStringSearchCodec.encodeHash(d))).toEqual(d)
  })

  it("невалідний hash → null", () => {
    expect(naiveStringSearchCodec.decodeHash("***not-base64***")).toBeNull()
  })

  it("JSON без поля text → помилка", () => {
    expect(() => naiveStringSearchCodec.fromJSON('{"version":1,"pattern":"x"}')).toThrow()
  })
})
