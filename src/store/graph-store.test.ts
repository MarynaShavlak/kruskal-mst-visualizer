import { describe, it, expect, beforeEach } from "vitest"
import { useGraphStore } from "@/store/graph-store"
import { buildGraph } from "@/lib/graph"

const s = () => useGraphStore.getState()

describe("graph-store", () => {
  beforeEach(() => {
    s().clear()
  })

  it("addVertexAt додає вершину з позицією та канонічним ім'ям", () => {
    expect(s().addVertexAt(100, 200)).toBe("A")
    expect(s().graph.vertices).toContain("A")
    expect(s().positions.A).toEqual({ x: 100, y: 200 })
    expect(s().addVertexAt(0, 0)).toBe("B")
  })

  it("connect додає ребро; відхиляє петлі/дублі/невалідну вагу", () => {
    s().addVertexAt(0, 0)
    s().addVertexAt(0, 0)
    expect(s().connect("A", "B", 5)).toBe(true)
    expect(s().graph.edges).toHaveLength(1)
    expect(s().connect("A", "B", 9)).toBe(false) // дубль
    expect(s().connect("A", "A", 1)).toBe(false) // петля
    expect(s().connect("A", "B", 0)).toBe(false) // невалідна вага
  })

  it("removeVertex прибирає вершину, позицію та інцидентні ребра", () => {
    s().loadDoc({
      graph: buildGraph([["A", "B", 1]]),
      positions: { A: { x: 1, y: 1 }, B: { x: 2, y: 2 } },
    })
    s().removeVertex("A")
    expect(s().graph.vertices).toEqual(["B"])
    expect(s().positions.A).toBeUndefined()
    expect(s().graph.edges).toHaveLength(0)
  })

  it("setEdgeWeight оновлює вагу; loadExample повертає еталон", () => {
    s().loadDoc({
      graph: buildGraph([["A", "B", 1]]),
      positions: { A: { x: 0, y: 0 }, B: { x: 0, y: 0 } },
    })
    s().setEdgeWeight("A|B", 7)
    expect(s().graph.edges[0].weight).toBe(7)
    s().loadExample()
    expect(s().graph.vertices).toHaveLength(7)
  })
})
