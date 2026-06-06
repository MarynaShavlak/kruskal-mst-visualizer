import { describe, it, expect } from "vitest"
import { buildGraph, emptyGraph } from "@/lib/graph"
import { analyzeGraph } from "@/lib/graphAnalysis"
import { referenceGraph } from "@/lib/exampleGraph"

describe("analyzeGraph", () => {
  it("порожній граф — нуль компонент, не зв'язний", () => {
    const a = analyzeGraph(emptyGraph())
    expect(a.vertexCount).toBe(0)
    expect(a.edgeCount).toBe(0)
    expect(a.componentCount).toBe(0)
    expect(a.isConnected).toBe(false)
  })

  it("еталон — зв'язний, одна компонента", () => {
    const a = analyzeGraph(referenceGraph())
    expect(a.vertexCount).toBe(7)
    expect(a.edgeCount).toBe(11)
    expect(a.componentCount).toBe(1)
    expect(a.isConnected).toBe(true)
  })

  it("дві компоненти", () => {
    const a = analyzeGraph(
      buildGraph([
        ["A", "B", 1],
        ["C", "D", 2],
      ]),
    )
    expect(a.componentCount).toBe(2)
    expect(a.isConnected).toBe(false)
    expect(a.components.map((c) => [...c].sort())).toEqual(
      expect.arrayContaining([
        ["A", "B"],
        ["C", "D"],
      ]),
    )
  })

  it("ізольована вершина — окрема компонента", () => {
    const a = analyzeGraph(buildGraph([["A", "B", 1]], ["Z"]))
    expect(a.componentCount).toBe(2)
    expect(a.isConnected).toBe(false)
  })
})
