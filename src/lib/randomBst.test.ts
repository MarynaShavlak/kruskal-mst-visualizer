import { describe, it, expect } from "vitest"
import { randomBst } from "@/lib/randomBst"

describe("randomBst", () => {
  it("детермінований за seed", () => {
    expect(randomBst({ seed: 42 })).toEqual(randomBst({ seed: 42 }))
  })

  it("різні seed зазвичай дають різні скрипти", () => {
    expect(randomBst({ seed: 1 })).not.toEqual(randomBst({ seed: 2 }))
  })

  it("count унікальних вставок + search present + search absent + delete", () => {
    const ops = randomBst({ seed: 7, count: 7 })
    const inserts = ops.filter((o) => o.kind === "insert")
    expect(inserts.length).toBe(7)
    const keys = inserts.map((o) => o.key)
    expect(new Set(keys).size).toBe(keys.length) // унікальні
    const searches = ops.filter((o) => o.kind === "search")
    const deletes = ops.filter((o) => o.kind === "delete")
    expect(searches.length).toBe(2)
    expect(deletes.length).toBe(1)
    expect(keys).toContain(searches[0].key) // наявний
    expect(keys).not.toContain(searches[1].key) // відсутній
    expect(keys).toContain(deletes[0].key) // наявний
  })

  it("кламп кількості до [1, 15]", () => {
    expect(randomBst({ seed: 1, count: 100 }).filter((o) => o.kind === "insert").length).toBe(15)
    expect(randomBst({ seed: 1, count: 0 }).filter((o) => o.kind === "insert").length).toBe(1)
  })
})
