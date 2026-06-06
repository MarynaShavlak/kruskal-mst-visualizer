import { describe, it, expect } from "vitest"
import { kruskalDsu } from "@/lib/kruskalDsu"
import { kruskalHasPath } from "@/lib/kruskalHasPath"
import { referenceGraph } from "@/lib/exampleGraph"
import {
  colorByRoot,
  componentRoots,
  edgeStatuses,
} from "@/features/playback/highlight"

describe("componentRoots", () => {
  it("на init-кадрі кожна вершина — свій корінь (DSU)", () => {
    const g = referenceGraph()
    const { trace } = kruskalDsu(g)
    expect(new Set(componentRoots(g, trace.frames[0]).values()).size).toBe(7)
  })

  it("на останньому кадрі — одна компонента (DSU)", () => {
    const g = referenceGraph()
    const { trace } = kruskalDsu(g)
    const last = trace.frames[trace.frames.length - 1]
    expect(new Set(componentRoots(g, last).values()).size).toBe(1)
  })

  it("наївна версія (без dsu-знімка) теж дає одну компоненту в кінці", () => {
    const g = referenceGraph()
    const { trace } = kruskalHasPath(g)
    const last = trace.frames[trace.frames.length - 1]
    expect(last.dsu).toBeUndefined()
    expect(new Set(componentRoots(g, last).values()).size).toBe(1)
  })

  it("colorByRoot дає колір кожній вершині", () => {
    const g = referenceGraph()
    const { trace } = kruskalDsu(g)
    const colors = colorByRoot(componentRoots(g, trace.frames[0]))
    for (const v of g.vertices) expect(colors.get(v)).toMatch(/^#/)
  })
})

describe("edgeStatuses", () => {
  it("на останньому кадрі еталона — 6 ребер у МОД", () => {
    const g = referenceGraph()
    const { trace } = kruskalDsu(g)
    const st = edgeStatuses(trace, trace.frames[trace.frames.length - 1])
    const accepted = [...st.values()].filter((s) => s === "accepted").length
    expect(accepted).toBe(6)
  })
})
