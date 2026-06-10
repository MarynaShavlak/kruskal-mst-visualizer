import { describe, it, expect } from "vitest"
import { randomTspCities } from "@/lib/randomTsp"

describe("randomTspCities", () => {
  it("детермінований за seed: однаковий seed — однакові міста", () => {
    expect(randomTspCities({ count: 6, seed: 42 })).toEqual(
      randomTspCities({ count: 6, seed: 42 }),
    )
  })

  it("різні seed дають різні інстанси", () => {
    expect(randomTspCities({ count: 6, seed: 1 })).not.toEqual(
      randomTspCities({ count: 6, seed: 2 }),
    )
  })

  it("повертає рівно count міст із канонічними іменами A, B, C…", () => {
    const cities = randomTspCities({ count: 5, seed: 7 })
    expect(cities).toHaveLength(5)
    expect(cities.map((c) => c.name)).toEqual(["A", "B", "C", "D", "E"])
  })

  it("координати — цілі в межах [0, span] і всі різні", () => {
    const span = 20
    const cities = randomTspCities({ count: 8, seed: 3, span })
    for (const c of cities) {
      expect(Number.isInteger(c.x)).toBe(true)
      expect(Number.isInteger(c.y)).toBe(true)
      expect(c.x).toBeGreaterThanOrEqual(0)
      expect(c.x).toBeLessThanOrEqual(span)
      expect(c.y).toBeGreaterThanOrEqual(0)
      expect(c.y).toBeLessThanOrEqual(span)
    }
    const keys = new Set(cities.map((c) => `${c.x},${c.y}`))
    expect(keys.size).toBe(cities.length) // без збігів позицій
  })
})
