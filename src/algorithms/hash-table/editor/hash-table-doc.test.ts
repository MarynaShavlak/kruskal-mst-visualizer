import { describe, it, expect } from "vitest"
import { hashTableCodec } from "@/algorithms/hash-table/editor/hash-table-doc"
import type { HashTableDoc } from "@/store/hash-table-store"

const CLASSIC: HashTableDoc = {
  ops: [
    { kind: "insert", key: "apple", value: 10 },
    { kind: "insert", key: "banana", value: 30 },
    { kind: "get", key: "apple" },
    { kind: "delete", key: "banana" },
  ],
  capacity: 5,
  hashFn: "sum",
  strategy: "linear",
}

describe("hashTableCodec: round-trip", () => {
  it("JSON туди-назад зберігає документ", () => {
    const back = hashTableCodec.fromJSON(hashTableCodec.toJSON(CLASSIC))
    expect(back).toEqual(CLASSIC)
  })

  it("hash (base64url) туди-назад зберігає документ", () => {
    const back = hashTableCodec.decodeHash(hashTableCodec.encodeHash(CLASSIC))
    expect(back).toEqual(CLASSIC)
  })

  it("get/delete не тягнуть value у Doc після декодування", () => {
    const back = hashTableCodec.fromJSON(hashTableCodec.toJSON(CLASSIC))!
    expect(back.ops[2]).toEqual({ kind: "get", key: "apple" })
    expect(back.ops[3]).toEqual({ kind: "delete", key: "banana" })
  })

  it("decodeHash на сміттєвому рядку повертає null", () => {
    expect(hashTableCodec.decodeHash("не-base64-$$$")).toBeNull()
  })
})

describe("hashTableCodec: валідація та санітизація", () => {
  it("кидає на невалідних документах", () => {
    expect(() => hashTableCodec.fromJSON("null")).toThrow()
    expect(() => hashTableCodec.fromJSON(JSON.stringify({ version: 2 }))).toThrow()
    // невалідний kind у операції
    expect(() =>
      hashTableCodec.fromJSON(
        JSON.stringify({ version: 1, ops: [["nope", "a", 0]], capacity: 5, hashFn: "sum" }),
      ),
    ).toThrow()
    // дробова місткість
    expect(() =>
      hashTableCodec.fromJSON(
        JSON.stringify({ version: 1, ops: [], capacity: 1.5, hashFn: "sum" }),
      ),
    ).toThrow()
    // невідома хеш-функція
    expect(() =>
      hashTableCodec.fromJSON(
        JSON.stringify({ version: 1, ops: [], capacity: 5, hashFn: "md5" }),
      ),
    ).toThrow()
    // невідома стратегія
    expect(() =>
      hashTableCodec.fromJSON(
        JSON.stringify({ version: 1, ops: [], capacity: 5, hashFn: "sum", strategy: "cuckoo" }),
      ),
    ).toThrow()
  })

  it("погані хеш-функції (firstChar/zero) серіалізуються без втрат", () => {
    for (const fn of ["firstChar", "zero"] as const) {
      const doc = { ...CLASSIC, hashFn: fn }
      expect(hashTableCodec.fromJSON(hashTableCodec.toJSON(doc)).hashFn).toBe(fn)
    }
  })

  it("санітизує місткість до цілого ≥ 1; відсутня стратегія → chaining", () => {
    const doc = hashTableCodec.fromJSON(
      JSON.stringify({ version: 1, ops: [], capacity: 5, hashFn: "sum" }),
    )
    expect(doc.capacity).toBe(5)
    expect(doc.strategy).toBe("chaining") // зворотна сумісність зі старими посиланнями
  })
})
