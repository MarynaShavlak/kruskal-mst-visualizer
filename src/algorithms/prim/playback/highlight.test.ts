import { describe, it, expect } from "vitest"
import { referenceGraph } from "@/lib/exampleGraph"
import { buildPrimTrace, type PrimFrame } from "@/lib/primTrace"
import { edgeStatuses, vertexRole } from "@/algorithms/prim/playback/highlight"

const trace = buildPrimTrace(referenceGraph()).trace
const firstWhere = (pred: (f: PrimFrame) => boolean): PrimFrame => {
  const f = trace.frames.find(pred)
  if (!f) throw new Error("кадр не знайдено")
  return f
}

describe("edgeStatuses (граф A–G)", () => {
  it("init: ребра старт-вершини A — кандидати (синій пунктир)", () => {
    const s = edgeStatuses(trace.frames[0])
    expect(s.get("A|D")).toBe("candidate")
    expect(s.get("A|B")).toBe("candidate")
  })

  it("після прийняття ребро потрапляє в дерево (tree)", () => {
    // Перший accept — A–D (5).
    const f = firstWhere((x) => x.sub.kind === "accept")
    expect(f.popped?.id).toBe("A|D")
    expect(edgeStatuses(f).get("A|D")).toBe("tree")
  })

  it("застаріле зняте ребро — poppedSkip; решта застарілих у черзі — stale", () => {
    // Перший skip — застаріле (8, B, C) на кроці 6.
    const f = firstWhere((x) => x.sub.kind === "skip")
    expect(f.popped?.id).toBe("B|C")
    const s = edgeStatuses(f)
    expect(s.get("B|C")).toBe("poppedSkip")
    // (8, F, E) лежить у черзі, обидва кінці в дереві → stale.
    expect(s.get("E|F")).toBe("stale")
    // Прийняті ребра лишаються деревом.
    expect(s.get("A|D")).toBe("tree")
  })
})

describe("vertexRole", () => {
  it("на accept-кадрі приєднана вершина justAdded", () => {
    const f = firstWhere((x) => x.sub.kind === "accept")
    const v = f.addedVertex as string
    expect(vertexRole(f, v).justAdded).toBe(true)
    expect(vertexRole(f, v).inTree).toBe(true)
  })

  it("на skip-кадрі кінець знятого ребра — examining; старт позначений", () => {
    const f = firstWhere((x) => x.sub.kind === "skip")
    expect(vertexRole(f, "C").examining).toBe(true)
    expect(vertexRole(f, "A").isStart).toBe(true)
  })
})
