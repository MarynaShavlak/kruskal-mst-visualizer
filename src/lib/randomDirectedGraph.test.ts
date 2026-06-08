import { describe, it, expect } from "vitest"
import { randomDirectedGraph } from "@/lib/randomDirectedGraph"
import { floydWarshall, hasNegativeCycle } from "@/lib/floydWarshall"
import { toDistMatrix } from "@/lib/directedGraph"

describe("randomDirectedGraph", () => {
  it("детермінований за seed", () => {
    const a = randomDirectedGraph({ vertexCount: 7, seed: 42 })
    const b = randomDirectedGraph({ vertexCount: 7, seed: 42 })
    expect(b.edges.map((e) => e.id)).toEqual(a.edges.map((e) => e.id))
    expect(b.edges.map((e) => e.weight)).toEqual(a.edges.map((e) => e.weight))
  })

  it("точна кількість вершин, без петель, ваги — додатні цілі", () => {
    const g = randomDirectedGraph({ vertexCount: 6, seed: 7 })
    expect(g.vertices).toHaveLength(6)
    for (const e of g.edges) {
      expect(e.from).not.toBe(e.to)
      expect(Number.isInteger(e.weight)).toBe(true)
      expect(e.weight).toBeGreaterThan(0)
    }
  })

  it("додатні ваги ⇒ від'ємних циклів немає на 30 сидах", () => {
    for (let seed = 1; seed <= 30; seed++) {
      const g = randomDirectedGraph({ vertexCount: 8, seed })
      const dist = floydWarshall(toDistMatrix(g).dist)
      expect(hasNegativeCycle(dist)).toBe(false)
    }
  })
})
