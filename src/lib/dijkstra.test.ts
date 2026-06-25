import { describe, it, expect } from "vitest"
import { buildGraph } from "@/lib/graph"
import {
  buildDijkstraTrace,
  dijkstra,
  shortestPath,
  weightedNeighbors,
} from "@/lib/dijkstra"

// Еталонний зважений граф із README:
// A-B 5, A-C 10, B-D 3, C-D 2, D-E 4  →  від A: {A:0, B:5, C:10, D:8, E:12}
const example = buildGraph([
  ["A", "B", 5],
  ["A", "C", 10],
  ["B", "D", 3],
  ["C", "D", 2],
  ["D", "E", 4],
])

describe("dijkstra — прогін", () => {
  it("еталонні відстані від A", () => {
    const r = dijkstra(example, "A")
    expect(r.distances).toEqual({ A: 0, B: 5, C: 10, D: 8, E: 12 })
  })

  it("порядок остаточного опрацювання вершин", () => {
    const r = dijkstra(example, "A")
    expect(r.order).toEqual(["A", "B", "D", "C", "E"])
    expect(r.reachedCount).toBe(5)
  })

  it("відновлення найкоротших шляхів за prev", () => {
    const r = dijkstra(example, "A")
    expect(shortestPath(r, "E")).toEqual(["A", "B", "D", "E"]) // 12
    expect(shortestPath(r, "C")).toEqual(["A", "C"]) // 10 (пряме коротше/рівне)
    expect(shortestPath(r, "A")).toEqual(["A"])
  })

  it("старт за замовчуванням — найменша вершина; сусіди впорядковані", () => {
    expect(dijkstra(example).start).toBe("A")
    expect(weightedNeighbors(example, "D").map((x) => x.to)).toEqual([
      "B",
      "C",
      "E",
    ])
  })

  it("недосяжні вершини мають відстань Infinity", () => {
    const g = buildGraph([["A", "B", 2]], ["Z"]) // Z ізольована
    const r = dijkstra(g, "A")
    expect(r.distances).toEqual({ A: 0, B: 2, Z: Infinity })
    expect(r.reachedCount).toBe(2)
    expect(shortestPath(r, "Z")).toEqual([])
  })

  it("порожній граф не падає", () => {
    const r = dijkstra(buildGraph([]))
    expect(r.distances).toEqual({})
    expect(r.order).toEqual([])
  })
})

describe("dijkstra — trace", () => {
  it("останній кадр повторює відстані прогону", () => {
    const run = dijkstra(example, "A")
    const { trace } = buildDijkstraTrace(example, "A")
    const last = trace.frames[trace.frames.length - 1]
    expect(last.sub).toBe("done")
    expect(last.distances).toEqual(run.distances)
    expect(trace.result.distances).toEqual(run.distances)
  })

  it("перший кадр — ініціалізація (start=0, решта ∞)", () => {
    const { trace } = buildDijkstraTrace(example, "A")
    expect(trace.frames[0].sub).toBe("init")
    expect(trace.frames[0].distances.A).toBe(0)
    expect(trace.frames[0].distances.B).toBe(Infinity)
  })

  it("кожна досяжна вершина має кадр select", () => {
    const { trace } = buildDijkstraTrace(example, "A")
    const selected = trace.frames
      .filter((f) => f.sub === "select")
      .map((f) => f.current)
    expect(selected).toEqual(["A", "B", "D", "C", "E"])
  })

  it("relax-кадр позначає покращені вершини", () => {
    const { trace } = buildDijkstraTrace(example, "A")
    const firstRelax = trace.frames.find((f) => f.sub === "relax")
    expect(firstRelax?.current).toBe("A")
    expect(firstRelax?.updated).toEqual(["B", "C"])
  })
})
