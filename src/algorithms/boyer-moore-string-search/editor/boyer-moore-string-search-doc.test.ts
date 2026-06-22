import { describe, expect, it } from "vitest"
import { boyerMooreStringSearchCodec } from "@/algorithms/boyer-moore-string-search/editor/boyer-moore-string-search-doc"
import type { BoyerMooreStringSearchDoc } from "@/store/boyer-moore-string-search-store"

const doc: BoyerMooreStringSearchDoc = { text: "Being a developer is not easy", pattern: "developer" }

describe("boyerMooreStringSearchCodec", () => {
  it("JSON round-trip зберігає текст і шаблон", () => {
    const json = boyerMooreStringSearchCodec.toJSON(doc)
    expect(boyerMooreStringSearchCodec.fromJSON(json)).toEqual(doc)
  })

  it("hash round-trip (base64url) зберігає документ", () => {
    const hash = boyerMooreStringSearchCodec.encodeHash(doc)
    expect(boyerMooreStringSearchCodec.decodeHash(hash)).toEqual(doc)
  })

  it("зберігає пробіли (текст конспекту)", () => {
    const d: BoyerMooreStringSearchDoc = { text: "HELLO WORLD", pattern: "WORLD" }
    expect(boyerMooreStringSearchCodec.decodeHash(boyerMooreStringSearchCodec.encodeHash(d))).toEqual(d)
  })

  it("невалідний hash → null", () => {
    expect(boyerMooreStringSearchCodec.decodeHash("***not-base64***")).toBeNull()
  })

  it("JSON без поля text → помилка", () => {
    expect(() => boyerMooreStringSearchCodec.fromJSON('{"version":1,"pattern":"x"}')).toThrow()
  })
})
