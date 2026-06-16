import { describe, it, expect } from "vitest"
import { buildKnapsackTrace } from "@/lib/knapsackTrace"
import { knapsackDp, reconstructItems, knapsackDpTable } from "@/lib/knapsack"
import {
  KNAPSACK_SMALL,
  KNAPSACK_SMALL_OPTIMAL,
  KNAPSACK_SMALL_CHOSEN,
  KNAPSACK_CLASSIC,
  KNAPSACK_CLASSIC_OPTIMAL,
  KNAPSACK_CLASSIC_CHOSEN,
  arrays,
} from "@/lib/exampleKnapsack"

describe("buildKnapsackTrace: результат збігається з чистим ядром", () => {
  it("малий інстанс: best=18, набір {П1, П3}", () => {
    const { result } = buildKnapsackTrace(KNAPSACK_SMALL)
    expect(result.best).toBe(KNAPSACK_SMALL_OPTIMAL)
    expect(result.chosen).toEqual(KNAPSACK_SMALL_CHOSEN)
    expect(result.operations).toBe(4 * 5) // (n+1)·(W+1)
    expect(result.bruteSubsets).toBe(8) // 2³
  })

  it("класичний інстанс: best=220, набір {П2, П3}", () => {
    const { result } = buildKnapsackTrace(KNAPSACK_CLASSIC)
    expect(result.best).toBe(KNAPSACK_CLASSIC_OPTIMAL)
    expect(result.chosen).toEqual(KNAPSACK_CLASSIC_CHOSEN)
    const { weights, values } = arrays(KNAPSACK_CLASSIC)
    expect(result.best).toBe(knapsackDp(weights, values, KNAPSACK_CLASSIC.capacity))
  })
})

describe("buildKnapsackTrace: структура кадрів", () => {
  it("починається з init, завершується done; індекси послідовні", () => {
    const { trace } = buildKnapsackTrace(KNAPSACK_SMALL)
    const frames = trace.frames
    expect(frames[0].sub.kind).toBe("init")
    expect(frames[0].phase).toBe("fill")
    const last = frames[frames.length - 1]
    expect(last.sub.kind).toBe("done")
    expect(last.phase).toBe("done")
    frames.forEach((f, i) => expect(f.i).toBe(i))
  })

  it("filled не спадає вздовж кадрів і доходить до (n+1)·(W+1)", () => {
    const { trace, result } = buildKnapsackTrace(KNAPSACK_SMALL)
    let prev = -1
    for (const f of trace.frames) {
      expect(f.filled).toBeGreaterThanOrEqual(prev)
      prev = f.filled
    }
    expect(prev).toBe(result.operations)
  })

  it("є рівно (n+1)·(W+1) кадрів-клітинок", () => {
    const { trace, result } = buildKnapsackTrace(KNAPSACK_SMALL)
    const cellFrames = trace.frames.filter((f) => f.sub.kind === "cell")
    expect(cellFrames.length).toBe(result.operations)
  })

  it("клітинка K[3][3] — гілка skip із take=12, skip=16, value=16", () => {
    const { trace } = buildKnapsackTrace(KNAPSACK_SMALL)
    const cell = trace.frames.find(
      (f) => f.sub.kind === "cell" && f.sub.row === 3 && f.sub.col === 3,
    )
    expect(cell).toBeDefined()
    if (cell?.sub.kind !== "cell") throw new Error("unreachable")
    expect(cell.sub.cellKind).toBe("skip")
    expect(cell.sub.take).toBe(12)
    expect(cell.sub.skip).toBe(16)
    expect(cell.sub.value).toBe(16)
  })

  it("кожен кадр-клітинка несе значення з таблиці ДП", () => {
    const { trace } = buildKnapsackTrace(KNAPSACK_SMALL)
    const { weights, values } = arrays(KNAPSACK_SMALL)
    const table = knapsackDpTable(weights, values, KNAPSACK_SMALL.capacity)
    for (const f of trace.frames) {
      if (f.sub.kind === "cell") {
        expect(f.sub.value).toBe(table[f.sub.row][f.sub.col])
      }
    }
  })

  it("фаза backtrack відновлює той самий набір, що й reconstructItems", () => {
    const { trace, result } = buildKnapsackTrace(KNAPSACK_SMALL)
    const btTaken = trace.frames
      .filter((f) => f.sub.kind === "bt-row" && f.sub.taken)
      .map((f) => (f.sub.kind === "bt-row" ? f.sub.row - 1 : -1))
      .sort((a, b) => a - b)
    expect(btTaken).toEqual([...result.chosen])

    const { weights } = arrays(KNAPSACK_SMALL)
    const table = knapsackDpTable(
      weights,
      KNAPSACK_SMALL.items.map((it) => it.value),
      KNAPSACK_SMALL.capacity,
    )
    expect(btTaken).toEqual(reconstructItems(table, weights, KNAPSACK_SMALL.capacity))
  })

  it("останній кадр backtrack-фази несе повний обраний набір", () => {
    const { trace, result } = buildKnapsackTrace(KNAPSACK_SMALL)
    const done = trace.frames[trace.frames.length - 1]
    expect(done.chosen).toEqual([...result.chosen])
  })
})
