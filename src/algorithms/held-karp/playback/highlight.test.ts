import { describe, expect, it } from "vitest"
import {
  activeEdge,
  cellCommitFrames,
  closingCandidates,
  fmt,
  framePath,
  subsetMembers,
} from "@/algorithms/held-karp/playback/highlight"
import { buildHeldKarpTrace } from "@/lib/heldKarpTrace"
import { TSP_DEMO_OPTIMAL_TOUR, tspDemoInstance } from "@/lib/exampleTsp"

const run = buildHeldKarpTrace(tspDemoInstance())
const { result } = run
const frames = run.trace.frames

describe("subsetMembers", () => {
  it("розкладає бітмаску в індекси за зростанням", () => {
    expect(subsetMembers(0b10101, 5)).toEqual([0, 2, 4])
    expect(subsetMembers(0, 5)).toEqual([])
    expect(subsetMembers((1 << 5) - 1, 5)).toEqual([0, 1, 2, 3, 4])
  })
})

describe("fmt", () => {
  it("дві цифри після коми", () => {
    expect(fmt(0)).toBe("0.00")
    expect(fmt(16.746578)).toBe("16.75")
  })
})

describe("framePath", () => {
  it("на фінальному кадрі — оптимальний тур (замкнений)", () => {
    const done = frames[frames.length - 1]
    expect(done.sub.kind).toBe("done")
    expect(framePath(done, result)).toEqual(result.path)
    expect(result.path).toEqual(TSP_DEMO_OPTIMAL_TOUR)
  })

  it("на кадрі кандидата — шлях блоку від старту до поточного кінця", () => {
    const cand = frames.find((f) => f.sub.kind === "candidate")
    if (!cand) throw new Error("очікувався кадр кандидата")
    const path = framePath(cand, result)
    expect(path).not.toBeNull()
    expect(path?.[0]).toBe(result.start)
    expect(path?.[path.length - 1]).toBe(cand.end)
  })

  it("на службових кадрах (level-open) маршрут не малюється", () => {
    const lvl = frames.find((f) => f.sub.kind === "level-open")
    if (!lvl) throw new Error("очікувався level-open")
    expect(framePath(lvl, result)).toBeNull()
  })
})

describe("activeEdge", () => {
  it("на базовому кадрі — ребро start→j", () => {
    const base = frames.find((f) => f.sub.kind === "base")
    if (!base || base.sub.kind !== "base") throw new Error("очікувався base")
    expect(activeEdge(base, result.start)).toEqual([result.start, base.sub.end])
  })

  it("на фінальному кадрі активного ребра немає", () => {
    const done = frames[frames.length - 1]
    expect(activeEdge(done, result.start)).toBeNull()
  })
})

describe("closingCandidates", () => {
  it("по одному на кінець (n−1), мінімум збігається з оптимумом", () => {
    const cc = closingCandidates(result)
    expect(cc).toHaveLength(result.names.length - 1)
    const min = Math.min(...cc.map((c) => c.total))
    expect(min).toBeCloseTo(result.cost, 10)
    for (const c of cc) expect(c.total).toBeCloseTo(c.blockCost + c.edge, 10)
  })
})

describe("cellCommitFrames", () => {
  it("один кадр-фіксація на кожну комірку, зростають монотонно", () => {
    const cf = cellCommitFrames(frames)
    expect(cf).toHaveLength(result.cells.length)
    for (let i = 1; i < cf.length; i++) expect(cf[i]).toBeGreaterThan(cf[i - 1])
    // Перша фіксація — найперший базовий кадр.
    const firstBase = frames.findIndex((f) => f.sub.kind === "base")
    expect(cf[0]).toBe(firstBase)
  })
})
