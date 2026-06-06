import { describe, it, expect } from "vitest"
import { circularLayout, examplePreset, randomPreset } from "@/store/presets"
import { analyzeGraph } from "@/lib/graphAnalysis"

describe("presets", () => {
  it("examplePreset — еталон з позиціями для всіх вершин", () => {
    const d = examplePreset()
    expect(d.graph.vertices).toHaveLength(7)
    expect(d.graph.edges).toHaveLength(11)
    for (const v of d.graph.vertices) expect(d.positions[v]).toBeDefined()
    expect(analyzeGraph(d.graph).isConnected).toBe(true)
  })

  it("randomPreset — зв'язний, з позиціями для всіх вершин", () => {
    const d = randomPreset(3, 9)
    expect(d.graph.vertices).toHaveLength(9)
    expect(analyzeGraph(d.graph).isConnected).toBe(true)
    for (const v of d.graph.vertices) expect(d.positions[v]).toBeDefined()
  })

  it("circularLayout розміщує всі вершини", () => {
    const pos = circularLayout(["A", "B", "C"])
    expect(Object.keys(pos).sort()).toEqual(["A", "B", "C"])
  })
})
