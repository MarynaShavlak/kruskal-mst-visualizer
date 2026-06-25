import { describe, it, expect } from "vitest"
import { heapSortCodec } from "@/algorithms/heap-sort/editor/heap-sort-doc"
import { HEAP_INTRO } from "@/lib/exampleHeapSort"

describe("heapSortCodec", () => {
  const doc = { values: [...HEAP_INTRO] }

  it("JSON round-trip зберігає значення", () => {
    const json = heapSortCodec.toJSON(doc)
    expect(heapSortCodec.fromJSON(json)).toEqual(doc)
  })

  it("URL-хеш round-trip зберігає значення", () => {
    const hash = heapSortCodec.encodeHash(doc)
    expect(heapSortCodec.decodeHash(hash)).toEqual(doc)
  })

  it("значення санітизуються до цілих ≥ 0 при завантаженні", () => {
    const json = JSON.stringify({ version: 1, values: [3.9, -4, 7] })
    expect(heapSortCodec.fromJSON(json)).toEqual({ values: [3, 0, 7] })
  })

  it("невалідний хеш → null", () => {
    expect(heapSortCodec.decodeHash("@@@не-base64@@@")).toBeNull()
  })
})
