import { describe, expect, it } from "vitest"
import { kmpStringSearchCodec } from "@/algorithms/kmp-string-search/editor/kmp-string-search-doc"
import type { KmpStringSearchDoc } from "@/store/kmp-string-search-store"

const doc: KmpStringSearchDoc = { text: "ABABDABACDABABCABAB", pattern: "ABABCABAB" }

describe("kmpStringSearchCodec", () => {
  it("JSON round-trip зберігає текст і шаблон", () => {
    const json = kmpStringSearchCodec.toJSON(doc)
    expect(kmpStringSearchCodec.fromJSON(json)).toEqual(doc)
  })

  it("hash round-trip (base64url) зберігає документ", () => {
    const hash = kmpStringSearchCodec.encodeHash(doc)
    expect(kmpStringSearchCodec.decodeHash(hash)).toEqual(doc)
  })

  it("зберігає юнікод і пробіли (конспект «алг»)", () => {
    const d: KmpStringSearchDoc = { text: "Цей алгоритм", pattern: "алг" }
    expect(kmpStringSearchCodec.decodeHash(kmpStringSearchCodec.encodeHash(d))).toEqual(d)
  })

  it("невалідний hash → null", () => {
    expect(kmpStringSearchCodec.decodeHash("***not-base64***")).toBeNull()
  })

  it("JSON без поля text → помилка", () => {
    expect(() => kmpStringSearchCodec.fromJSON('{"version":1,"pattern":"x"}')).toThrow()
  })
})
