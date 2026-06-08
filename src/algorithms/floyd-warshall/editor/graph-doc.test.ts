import { describe, it, expect } from "vitest"
import { decodeHash, encodeHash, fromJSON, toJSON } from "./graph-doc"
import { buildDirectedGraph } from "@/lib/directedGraph"
import type { DirectedGraphDoc } from "@/store/directed-graph-store"

function sampleDoc(): DirectedGraphDoc {
  return {
    graph: buildDirectedGraph([
      ["P", "Q", 4],
      ["Q", "R", -2], // від'ємна вага
      ["R", "S", 0], // нульова вага
      ["P", "S", 10],
    ]),
    positions: {
      P: { x: 60, y: 220 },
      Q: { x: 240, y: 70 },
      R: { x: 440, y: 70 },
      S: { x: 600, y: 220 },
    },
  }
}

describe("graph-doc (Флойд–Воршал)", () => {
  it("JSON round-trip зберігає напрям, від'ємні й нульові ваги", () => {
    const doc = sampleDoc()
    const back = fromJSON(toJSON(doc))
    expect(back.graph.edges.map((e) => [e.from, e.to, e.weight])).toEqual([
      ["P", "Q", 4],
      ["Q", "R", -2],
      ["R", "S", 0],
      ["P", "S", 10],
    ])
    expect(back.positions.Q).toEqual({ x: 240, y: 70 })
  })

  it("hash round-trip відновлює документ", () => {
    const doc = sampleDoc()
    const decoded = decodeHash(encodeHash(doc))
    expect(decoded).not.toBeNull()
    expect(decoded?.graph.edges).toHaveLength(4)
    expect(decoded?.graph.vertices).toEqual(["P", "Q", "R", "S"])
  })

  it("невалідний хеш дає null, а не виняток", () => {
    expect(decodeHash("не-base64!!!")).toBeNull()
  })
})
