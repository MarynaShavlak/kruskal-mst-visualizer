import { describe, it, expect } from "vitest"
import { buildGreedyTrace, buildBruteTrace } from "@/lib/knapsackAltTrace"
import {
  KNAPSACK_CLASSIC,
  KNAPSACK_CLASSIC_OPTIMAL,
  KNAPSACK_CLASSIC_GREEDY,
  KNAPSACK_SMALL,
  KNAPSACK_SMALL_OPTIMAL,
} from "@/lib/exampleKnapsack"

describe("buildGreedyTrace — контрприклад", () => {
  it("класичний: жадібний 160 < оптимум 220; узяті П1, П2", () => {
    const { result, frames } = buildGreedyTrace(KNAPSACK_CLASSIC)
    expect(result.greedyValue).toBe(KNAPSACK_CLASSIC_GREEDY)
    expect(result.optimal).toBe(KNAPSACK_CLASSIC_OPTIMAL)
    expect(result.chosen).toEqual([0, 1])
    expect(result.steps.map((s) => s.taken)).toEqual([true, true, false])
    expect(frames[0].sub.kind).toBe("init")
    expect(frames[frames.length - 1].sub.kind).toBe("done")
    // init + 3 предмети + done
    expect(frames.length).toBe(1 + 3 + 1)
  })

  it("накопичена вартість не спадає вздовж кадрів", () => {
    const { frames } = buildGreedyTrace(KNAPSACK_CLASSIC)
    let prev = -1
    for (const f of frames) {
      expect(f.total).toBeGreaterThanOrEqual(prev)
      prev = f.total
    }
  })
})

describe("buildBruteTrace — повний перебір", () => {
  it("класичний: перебір 8 підмножин, найкраща {П2,П3}=220", () => {
    const { result, frames } = buildBruteTrace(KNAPSACK_CLASSIC)
    expect(result.subsets.length).toBe(8) // 2³
    expect(result.bestValue).toBe(KNAPSACK_CLASSIC_OPTIMAL)
    expect(result.bestCombo).toEqual([1, 2])
    expect(result.subsets[result.bestIndex].value).toBe(220)
    expect(frames.length).toBe(1 + 8 + 1)
    expect(frames[frames.length - 1].sub.kind).toBe("done")
  })

  it("малий: найкраща {П1,П3}=18", () => {
    const { result } = buildBruteTrace(KNAPSACK_SMALL)
    expect(result.bestValue).toBe(KNAPSACK_SMALL_OPTIMAL)
    expect(result.bestCombo).toEqual([0, 2])
  })

  it("bestValue лідера не спадає вздовж кадрів", () => {
    const { frames } = buildBruteTrace(KNAPSACK_CLASSIC)
    let prev = -1
    for (const f of frames) {
      expect(f.bestValue).toBeGreaterThanOrEqual(prev)
      prev = f.bestValue
    }
  })

  it("підмножина-перевищення місткості позначена fits=false", () => {
    const { result } = buildBruteTrace(KNAPSACK_CLASSIC)
    // {П1,П2,П3} важить 60 > 50
    const full = result.subsets.find((s) => s.combo.length === 3)
    expect(full?.weight).toBe(60)
    expect(full?.fits).toBe(false)
  })
})
