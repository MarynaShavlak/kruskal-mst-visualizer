import { describe, expect, it } from "vitest"
import { rabinKarpStringSearchCodec } from "@/algorithms/rabin-karp-string-search/editor/rabin-karp-string-search-doc"
import type { RabinKarpStringSearchDoc } from "@/store/rabin-karp-string-search-store"

const doc: RabinKarpStringSearchDoc = { text: "Being a developer is not easy", pattern: "developer" }

describe("rabinKarpStringSearchCodec", () => {
  it("JSON round-trip зберігає текст і шаблон", () => {
    const json = rabinKarpStringSearchCodec.toJSON(doc)
    expect(rabinKarpStringSearchCodec.fromJSON(json)).toEqual(doc)
  })

  it("hash round-trip (base64url) зберігає документ", () => {
    const hash = rabinKarpStringSearchCodec.encodeHash(doc)
    expect(rabinKarpStringSearchCodec.decodeHash(hash)).toEqual(doc)
  })

  it("зберігає юнікод і пробіли", () => {
    const d: RabinKarpStringSearchDoc = { text: "for a jar of jam", pattern: "jar" }
    expect(rabinKarpStringSearchCodec.decodeHash(rabinKarpStringSearchCodec.encodeHash(d))).toEqual(d)
  })

  it("невалідний hash → null", () => {
    expect(rabinKarpStringSearchCodec.decodeHash("***not-base64***")).toBeNull()
  })

  it("JSON без поля text → помилка", () => {
    expect(() => rabinKarpStringSearchCodec.fromJSON('{"version":1,"pattern":"x"}')).toThrow()
  })
})
