import { describe, it, expect } from "vitest"
import { knapsackCodec } from "@/algorithms/knapsack/editor/knapsack-doc"
import type { KnapsackDoc } from "@/store/knapsack-store"

const CLASSIC: KnapsackDoc = {
  items: [
    { name: "П1", weight: 10, value: 60 },
    { name: "П2", weight: 20, value: 100 },
    { name: "П3", weight: 30, value: 120 },
  ],
  capacity: 50,
}

describe("knapsackCodec: round-trip", () => {
  it("JSON туди-назад зберігає документ", () => {
    const back = knapsackCodec.fromJSON(knapsackCodec.toJSON(CLASSIC))
    expect(back).toEqual(CLASSIC)
  })

  it("hash (base64url) туди-назад зберігає документ", () => {
    const back = knapsackCodec.decodeHash(knapsackCodec.encodeHash(CLASSIC))
    expect(back).toEqual(CLASSIC)
  })

  it("decodeHash на сміттєвому рядку повертає null", () => {
    expect(knapsackCodec.decodeHash("не-base64-$$$")).toBeNull()
  })
})

describe("knapsackCodec: валідація та санітизація", () => {
  it("кидає на невалідних документах", () => {
    expect(() => knapsackCodec.fromJSON("null")).toThrow()
    expect(() => knapsackCodec.fromJSON(JSON.stringify({ version: 2 }))).toThrow()
    expect(() =>
      knapsackCodec.fromJSON(JSON.stringify({ version: 1, items: "ні", capacity: 5 })),
    ).toThrow()
    expect(() =>
      knapsackCodec.fromJSON(
        JSON.stringify({ version: 1, items: [], capacity: 1.5 }),
      ),
    ).toThrow()
  })

  it("санітизує ваги (≥1), вартості (≥0) і місткість (≥0)", () => {
    const wire = JSON.stringify({
      version: 1,
      items: [["X", 0, -5]],
      capacity: -3,
    })
    const doc = knapsackCodec.fromJSON(wire)
    expect(doc.items[0]).toEqual({ name: "X", weight: 1, value: 0 })
    expect(doc.capacity).toBe(0)
  })
})
