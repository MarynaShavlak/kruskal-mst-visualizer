import { describe, it, expect } from "vitest"
import { HELD_KARP_CODE, buildHeldKarpTrace } from "@/lib/heldKarpTrace"
import { heldKarp } from "@/lib/heldKarp"
import {
  TSP_DEMO_OPTIMAL_LENGTH,
  TSP_DEMO_OPTIMAL_TOUR,
  tspDemoInstance,
  tspDemoMatrix,
} from "@/lib/exampleTsp"

const countKind = (
  frames: ReturnType<typeof buildHeldKarpTrace>["trace"]["frames"],
  kind: string,
): number => frames.filter((f) => f.sub.kind === kind).length

describe("buildHeldKarpTrace — результат", () => {
  it("оптимум збігається з еталоном і з чистим heldKarp", () => {
    const { result } = buildHeldKarpTrace(tspDemoInstance())
    expect(result.cost).toBeCloseTo(TSP_DEMO_OPTIMAL_LENGTH, 9)
    expect(result.path).toEqual(TSP_DEMO_OPTIMAL_TOUR)
    const pure = heldKarp(tspDemoMatrix())
    expect(result.cost).toBeCloseTo(pure.cost, 12)
    expect(result.path).toEqual(pure.path)
  })

  it("рівно 32 підзадачі (4 + 12 + 12 + 4), n²·2ⁿ = 800 операцій", () => {
    const { result } = buildHeldKarpTrace(tspDemoInstance())
    expect(result.cells).toHaveLength(32)
    expect(result.operations).toBe(800)
    const byLevel = (lvl: number): number =>
      result.cells.filter((c) => c.level === lvl).length
    expect(byLevel(2)).toBe(4)
    expect(byLevel(3)).toBe(12)
    expect(byLevel(4)).toBe(12)
    expect(byLevel(5)).toBe(4)
  })

  it("відомі комірки збігаються з трасуванням README", () => {
    const { result } = buildHeldKarpTrace(tspDemoInstance())
    const cell = (subset: number, end: number) =>
      result.cells.find((c) => c.subset === subset && c.end === end)
    // {A,B,C,D}→D = A→C→B→D = 8.82 (індекси A,B,C,D = біти 0..3 = 15; D = 3)
    expect(cell(0b01111, 3)?.cost).toBeCloseTo(8.82, 2)
    // {A,B,C,D,E}→E = A→C→B→D→E = 11.65 (усі 5 = 31; E = 4)
    expect(cell(0b11111, 4)?.cost).toBeCloseTo(11.65, 2)
  })
})

describe("buildHeldKarpTrace — кадри", () => {
  it("перший кадр init, останній done", () => {
    const { trace } = buildHeldKarpTrace(tspDemoInstance())
    expect(trace.frames[0].sub.kind).toBe("init")
    expect(trace.frames[trace.frames.length - 1].sub.kind).toBe("done")
  })

  it("4 кадри бази, 28 кадрів cell-commit (сумарно 32 готові комірки)", () => {
    const { trace } = buildHeldKarpTrace(tspDemoInstance())
    expect(countKind(trace.frames, "base")).toBe(4)
    expect(countKind(trace.frames, "cell-commit")).toBe(28)
    expect(countKind(trace.frames, "level-open")).toBe(3) // рівні 3,4,5
    expect(countKind(trace.frames, "closing-candidate")).toBe(4) // кінці B,C,D,E
    expect(countKind(trace.frames, "init")).toBe(1)
    expect(countKind(trace.frames, "done")).toBe(1)
  })

  it("committedCount монотонний і завершується на 32", () => {
    const { trace } = buildHeldKarpTrace(tspDemoInstance())
    for (let i = 1; i < trace.frames.length; i++) {
      expect(trace.frames[i].committedCount).toBeGreaterThanOrEqual(
        trace.frames[i - 1].committedCount,
      )
    }
    expect(trace.frames[trace.frames.length - 1].committedCount).toBe(32)
  })

  it("lines і contextLines — валідні 1-based індекси у HELD_KARP_CODE", () => {
    const { trace } = buildHeldKarpTrace(tspDemoInstance())
    for (const f of trace.frames) {
      for (const ln of [...f.lines, ...f.contextLines]) {
        expect(ln).toBeGreaterThanOrEqual(1)
        expect(ln).toBeLessThanOrEqual(HELD_KARP_CODE.length)
      }
    }
  })

  it("у кожній комірці рівно один обраний кандидат, і він — найдешевший", () => {
    const { trace } = buildHeldKarpTrace(tspDemoInstance())
    for (const f of trace.frames) {
      if (f.sub.kind !== "cell-commit") continue
      const chosen = f.candidates.filter((c) => c.chosen)
      expect(chosen).toHaveLength(1)
      expect(chosen[0].improved).toBe(true)
      expect(chosen[0].k).toBe(f.sub.bestK)
      expect(chosen[0].total).toBeCloseTo(f.sub.cost, 9)
      const minTotal = Math.min(...f.candidates.map((c) => c.total))
      expect(chosen[0].total).toBeCloseTo(minTotal, 9)
    }
  })

  it("кадри-кандидати посилаються на наявний індекс свого списку", () => {
    const { trace } = buildHeldKarpTrace(tspDemoInstance())
    for (const f of trace.frames) {
      if (f.sub.kind !== "candidate") continue
      expect(f.activeCandidate).toBe(f.sub.index)
      expect(f.candidates[f.sub.index]).toBeDefined()
    }
  })

  it("найкращий тур під час замикання лише покращується і сходиться до оптимуму", () => {
    const { trace, result } = buildHeldKarpTrace(tspDemoInstance())
    const closing = trace.frames.filter((f) => f.sub.kind === "closing-candidate")
    let prev = Infinity
    for (const f of closing) {
      expect(f.bestTour).not.toBeNull()
      expect(f.bestTour!.cost).toBeLessThanOrEqual(prev + 1e-9)
      prev = f.bestTour!.cost
    }
    expect(prev).toBeCloseTo(result.cost, 9)
  })
})
