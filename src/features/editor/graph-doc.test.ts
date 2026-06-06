import { describe, it, expect } from "vitest"
import { buildGraph } from "@/lib/graph"
import {
  decodeHash,
  encodeHash,
  fromJSON,
  toJSON,
} from "@/features/editor/graph-doc"
import type { GraphDoc } from "@/store/graph-store"

const sampleDoc = (): GraphDoc => ({
  graph: buildGraph([
    ["A", "B", 7],
    ["A", "C", 5],
  ]),
  positions: {
    A: { x: 10, y: 20 },
    B: { x: 30, y: 40 },
    C: { x: 50, y: 60 },
  },
})

describe("graph-doc codec", () => {
  it("JSON round-trip зберігає граф і позиції", () => {
    const d = sampleDoc()
    const d2 = fromJSON(toJSON(d))
    expect(d2.graph.edges.map((e) => [e.id, e.weight])).toEqual(
      d.graph.edges.map((e) => [e.id, e.weight]),
    )
    expect([...d2.graph.vertices].sort()).toEqual([...d.graph.vertices].sort())
    expect(d2.positions.A).toEqual({ x: 10, y: 20 })
  })

  it("hash round-trip", () => {
    const d2 = decodeHash(encodeHash(sampleDoc()))
    expect(d2).not.toBeNull()
    expect(d2?.graph.edges).toHaveLength(2)
    expect(d2?.positions.B).toEqual({ x: 30, y: 40 })
  })

  it("decodeHash повертає null на сміття", () => {
    expect(decodeHash("not valid!!")).toBeNull()
    expect(decodeHash("")).toBeNull()
  })

  it("fromJSON відкидає невалідний документ", () => {
    expect(() => fromJSON("{}")).toThrow()
    // петля A-A заборонена моделлю графа
    expect(() =>
      fromJSON(
        '{"version":1,"vertices":["A"],"edges":[["A","A",1]],"positions":{}}',
      ),
    ).toThrow()
  })
})
