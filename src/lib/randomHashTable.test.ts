import { describe, it, expect } from "vitest"
import { randomHashTable } from "@/lib/randomHashTable"

describe("randomHashTable", () => {
  it("детермінований за seed (однаковий seed → однаковий скрипт)", () => {
    expect(randomHashTable({ seed: 42 })).toEqual(randomHashTable({ seed: 42 }))
  })

  it("різні seed зазвичай дають різні скрипти", () => {
    const a = randomHashTable({ seed: 1 })
    const b = randomHashTable({ seed: 2 })
    expect(a).not.toEqual(b)
  })

  it("count вставок різних ключів + влучення + промах", () => {
    const { ops, capacity } = randomHashTable({ seed: 7, count: 6 })
    const inserts = ops.filter((o) => o.kind === "insert")
    expect(inserts.length).toBe(6)
    // ключі вставок унікальні
    const keys = inserts.map((o) => o.key)
    expect(new Set(keys).size).toBe(keys.length)
    // останні дві — get (влучення наявного + промах відсутнього)
    const gets = ops.filter((o) => o.kind === "get")
    expect(gets.length).toBe(2)
    expect(keys).toContain(gets[0].key) // влучення
    expect(keys).not.toContain(gets[1].key) // промах
    expect(capacity).toBeGreaterThanOrEqual(4)
  })
})
