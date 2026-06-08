import { describe, it, expect } from "vitest"
import { toDistMatrix } from "@/lib/directedGraph"
import { reconstructPath, stepsFromDist } from "@/lib/floydWarshall"
import {
  FLOYD_WARSHALL_CODE,
  buildFloydWarshallTrace,
} from "@/lib/floydWarshallTrace"
import {
  ABCDEF_REFERENCE_DIST,
  PQRS_REFERENCE_DIST,
  abcdefGraph,
  pqrsGraph,
  xyzGraph,
} from "@/lib/exampleDirectedGraph"

describe("buildFloydWarshallTrace — результат", () => {
  it("підсумкова матриця A–F збігається з еталоном і з двигуном", () => {
    const { result } = buildFloydWarshallTrace(abcdefGraph())
    expect(result.dist).toEqual(ABCDEF_REFERENCE_DIST)
    // trace і чистий двигун мають давати однакову dist
    const engine = stepsFromDist(toDistMatrix(abcdefGraph()).dist)
    expect(result.dist).toEqual(engine.dist)
    expect(result.order).toEqual(["A", "B", "C", "D", "E", "F"])
  })

  it("на A–F рівно 5 покращень (по 1 на k=B і 4 на k=C)", () => {
    const { result } = buildFloydWarshallTrace(abcdefGraph())
    expect(result.improvedCount).toBe(5)
    expect(result.hasNegativeCycle).toBe(false)
  })

  it("P–S: матриця збігається, від'ємного циклу немає", () => {
    const { result } = buildFloydWarshallTrace(pqrsGraph())
    expect(result.dist).toEqual(PQRS_REFERENCE_DIST)
    expect(result.hasNegativeCycle).toBe(false)
  })

  it("X–Z: виявлено від'ємний цикл", () => {
    const { result } = buildFloydWarshallTrace(xyzGraph())
    expect(result.hasNegativeCycle).toBe(true)
  })

  it("nxt відновлює шляхи з README (A→B→C→D і P→Q→R→S)", () => {
    const af = buildFloydWarshallTrace(abcdefGraph()).result
    expect(reconstructPath(af.nxt, 0, 3)).toEqual([0, 1, 2, 3])
    const ps = buildFloydWarshallTrace(pqrsGraph()).result
    expect(reconstructPath(ps.nxt, 0, 3)).toEqual([0, 1, 2, 3])
  })
})

describe("buildFloydWarshallTrace — кадри", () => {
  it("перший кадр — init, останній — done з підсумковою матрицею", () => {
    const { trace, result } = buildFloydWarshallTrace(abcdefGraph())
    expect(trace.frames[0].sub.kind).toBe("init")
    const last = trace.frames[trace.frames.length - 1]
    expect(last.sub.kind).toBe("done")
    expect(last.matrix).toEqual(result.dist)
  })

  it("по n кадрів open-k і k-done; n³ кадрів-порівнянь", () => {
    const { trace } = buildFloydWarshallTrace(abcdefGraph())
    const n = trace.order.length // 6
    const count = (kind: string): number =>
      trace.frames.filter((f) => f.sub.kind === kind).length
    expect(count("open-k")).toBe(n)
    expect(count("k-done")).toBe(n)
    expect(count("compare")).toBe(n * n * n)
    expect(count("init")).toBe(1)
    expect(count("done")).toBe(1)
  })

  it("lines і contextLines кадрів — валідні 1-based індекси у code", () => {
    const { trace } = buildFloydWarshallTrace(pqrsGraph())
    for (const f of trace.frames) {
      for (const ln of [...f.lines, ...f.contextLines]) {
        expect(ln).toBeGreaterThanOrEqual(1)
        expect(ln).toBeLessThanOrEqual(FLOYD_WARSHALL_CODE.length)
      }
    }
  })

  it("матриця лише покращується вздовж кадрів (монотонність)", () => {
    const { trace } = buildFloydWarshallTrace(abcdefGraph())
    for (let f = 1; f < trace.frames.length; f++) {
      const prev = trace.frames[f - 1].matrix
      const cur = trace.frames[f].matrix
      for (let i = 0; i < cur.length; i++) {
        for (let j = 0; j < cur.length; j++) {
          expect(cur[i][j]).toBeLessThanOrEqual(prev[i][j])
        }
      }
    }
  })

  it("кадри relaxed=true відповідають загальній к-сті покращень", () => {
    const { trace, result } = buildFloydWarshallTrace(abcdefGraph())
    const relaxed = trace.frames.filter(
      (f) => f.sub.kind === "compare" && f.sub.relaxed,
    ).length
    expect(relaxed).toBe(result.improvedCount)
  })

  it("кадри compare підсвічують рішення (рядки 4–5), без присвоєнь", () => {
    const { trace } = buildFloydWarshallTrace(abcdefGraph())
    for (const f of trace.frames) {
      if (f.sub.kind === "compare") {
        expect([...f.lines].sort((a, b) => a - b)).toEqual([4, 5])
        expect(f.contextLines).toEqual([1, 2, 3])
      }
    }
  })

  it("кожна релаксація має окремий кадр apply (рядки 6–7) одразу за compare", () => {
    const { trace, result } = buildFloydWarshallTrace(abcdefGraph())
    const applies = trace.frames.filter((f) => f.sub.kind === "apply")
    expect(applies).toHaveLength(result.improvedCount)
    trace.frames.forEach((f, idx) => {
      if (f.sub.kind !== "apply") return
      expect([...f.lines].sort((a, b) => a - b)).toEqual([6, 7])
      expect(f.contextLines).toEqual([1, 2, 3])
      // apply завжди йде за своїм compare(relaxed=true)
      const prev = trace.frames[idx - 1]
      expect(prev.sub.kind).toBe("compare")
      if (prev.sub.kind === "compare") expect(prev.sub.relaxed).toBe(true)
    })
  })

  it("на кадрі рішення матриця ще стара, на наступному apply — вже оновлена", () => {
    const { trace } = buildFloydWarshallTrace(abcdefGraph())
    trace.frames.forEach((f, idx) => {
      if (f.sub.kind !== "apply") return
      const [i, j] = f.sub.cell
      const decision = trace.frames[idx - 1]
      // рішення показує попереднє значення, apply — нове (менше)
      expect(decision.matrix[i][j]).toBe(f.sub.from)
      expect(f.matrix[i][j]).toBe(f.sub.to)
      expect(f.sub.to).toBeLessThan(f.sub.from)
    })
  })

  it("improvedThisK скидається на кожному open-k", () => {
    const { trace } = buildFloydWarshallTrace(abcdefGraph())
    for (const f of trace.frames) {
      if (f.sub.kind === "open-k") expect(f.improvedThisK).toEqual([])
    }
  })
})
