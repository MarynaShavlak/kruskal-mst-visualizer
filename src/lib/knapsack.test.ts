import { describe, it, expect } from "vitest"
import {
  knapsackRecursive,
  knapsackBruteForce,
  knapsackGreedy,
  greedySteps,
  knapsackDp,
  knapsackDpTable,
  reconstructItems,
} from "@/lib/knapsack"
import { mulberry32 } from "@/lib/randomGraph"
import {
  KNAPSACK_SMALL,
  KNAPSACK_SMALL_OPTIMAL,
  KNAPSACK_SMALL_CHOSEN,
  KNAPSACK_CLASSIC,
  KNAPSACK_CLASSIC_OPTIMAL,
  KNAPSACK_CLASSIC_CHOSEN,
  KNAPSACK_CLASSIC_GREEDY,
  arrays,
} from "@/lib/exampleKnapsack"

describe("knapsack проти еталона (README / test_core.py)", () => {
  it("класичний інстанс (W=50): усі точні методи дають 220, набір {П2, П3}", () => {
    const { weights, values } = arrays(KNAPSACK_CLASSIC)
    const W = KNAPSACK_CLASSIC.capacity
    const n = weights.length

    expect(knapsackRecursive(W, weights, values, n)).toBe(KNAPSACK_CLASSIC_OPTIMAL)
    const bf = knapsackBruteForce(weights, values, W)
    expect(bf.value).toBe(KNAPSACK_CLASSIC_OPTIMAL)
    expect(bf.combo).toEqual([1, 2])
    expect(knapsackDp(weights, values, W)).toBe(KNAPSACK_CLASSIC_OPTIMAL)

    const table = knapsackDpTable(weights, values, W)
    expect(reconstructItems(table, weights, W)).toEqual(KNAPSACK_CLASSIC_CHOSEN)
  })

  it("малий інстанс (W=4): усі точні методи дають 18, набір {П1, П3}", () => {
    const { weights, values } = arrays(KNAPSACK_SMALL)
    const W = KNAPSACK_SMALL.capacity
    const n = weights.length

    expect(knapsackRecursive(W, weights, values, n)).toBe(KNAPSACK_SMALL_OPTIMAL)
    const bf = knapsackBruteForce(weights, values, W)
    expect(bf.value).toBe(KNAPSACK_SMALL_OPTIMAL)
    expect(bf.combo).toEqual([0, 2])
    expect(knapsackDp(weights, values, W)).toBe(KNAPSACK_SMALL_OPTIMAL)

    const table = knapsackDpTable(weights, values, W)
    expect(reconstructItems(table, weights, W)).toEqual(KNAPSACK_SMALL_CHOSEN)
  })

  it("еталонна таблиця малого інстансу збігається з README", () => {
    const { weights, values } = arrays(KNAPSACK_SMALL)
    const table = knapsackDpTable(weights, values, KNAPSACK_SMALL.capacity)
    expect(table).toEqual([
      [0, 0, 0, 0, 0],
      [0, 6, 6, 6, 6],
      [0, 6, 10, 16, 16],
      [0, 6, 10, 16, 18],
    ])
  })

  it("клітинка K[3][3]: вміщається, але «не брати» перемагає (12 ≤ 16)", () => {
    const { weights, values } = arrays(KNAPSACK_SMALL)
    const table = knapsackDpTable(weights, values, KNAPSACK_SMALL.capacity)
    const take = values[2] + table[2][3 - weights[2]] // 12 + K[2][0] = 12
    const skip = table[2][3] // 16
    expect(take).toBe(12)
    expect(skip).toBe(16)
    expect(table[3][3]).toBe(16) // max(12, 16)
  })
})

describe("жадібний метод — навчальний контрприклад", () => {
  it("класичний інстанс: жадібний дає 160 (< оптимум 220)", () => {
    const { weights, values } = arrays(KNAPSACK_CLASSIC)
    expect(knapsackGreedy(weights, values, KNAPSACK_CLASSIC.capacity)).toBe(
      KNAPSACK_CLASSIC_GREEDY,
    )
  })

  it("журнал жадібного: бере П1, П2, пропускає П3", () => {
    const { weights, values } = arrays(KNAPSACK_CLASSIC)
    const steps = greedySteps(weights, values, KNAPSACK_CLASSIC.capacity)
    expect(steps.map((s) => s.index)).toEqual([0, 1, 2])
    expect(steps.map((s) => s.taken)).toEqual([true, true, false])
    expect(steps.map((s) => s.ratio)).toEqual([6, 5, 4])
  })

  it("кидає, якщо вага предмета не додатна", () => {
    expect(() => greedySteps([0, 2], [5, 5], 10)).toThrow()
  })
})

describe("крайові випадки", () => {
  it("порожні предмети або нульова місткість → 0", () => {
    expect(knapsackDp([], [], 10)).toBe(0)
    expect(knapsackDp([1, 2], [3, 4], 0)).toBe(0)
    expect(knapsackBruteForce([], [], 10).value).toBe(0)
  })

  it("єдиний предмет важчий за рюкзак → 0, набір порожній", () => {
    const table = knapsackDpTable([7], [100], 5)
    expect(table[1][5]).toBe(0)
    expect(reconstructItems(table, [7], 5)).toEqual([])
  })

  it("єдиний предмет рівно по місткості → беремо його", () => {
    const table = knapsackDpTable([7], [100], 7)
    expect(table[1][7]).toBe(100)
    expect(reconstructItems(table, [7], 7)).toEqual([0])
  })

  it("усі предмети вміщаються → беремо всі", () => {
    const table = knapsackDpTable([2, 3, 4], [5, 6, 7], 20)
    expect(table[3][20]).toBe(18)
    expect(reconstructItems(table, [2, 3, 4], 20)).toEqual([0, 1, 2])
  })
})

describe("узгодженість методів на випадкових інстансах", () => {
  it("рекурсія == перебір == ДП на 150 випадкових інстансах", () => {
    const rand = mulberry32(20240617)
    for (let trial = 0; trial < 150; trial++) {
      const n = Math.floor(rand() * 10) // 0..9
      const weights = Array.from({ length: n }, () => 1 + Math.floor(rand() * 15))
      const values = Array.from({ length: n }, () => Math.floor(rand() * 31))
      const capacity = Math.floor(rand() * 41) // 0..40

      const rec = knapsackRecursive(capacity, weights, values, n)
      const bf = knapsackBruteForce(weights, values, capacity).value
      const dp = knapsackDp(weights, values, capacity)
      expect(rec).toBe(bf)
      expect(bf).toBe(dp)

      // Жадібний ніколи не перевершує оптимум (а часто програє).
      expect(knapsackGreedy(weights, values, capacity)).toBeLessThanOrEqual(dp)
    }
  })

  it("відновлений набір справді дає оптимум і вміщається", () => {
    const rand = mulberry32(7)
    for (let trial = 0; trial < 100; trial++) {
      const n = 1 + Math.floor(rand() * 8)
      const weights = Array.from({ length: n }, () => 1 + Math.floor(rand() * 12))
      const values = Array.from({ length: n }, () => Math.floor(rand() * 25))
      const capacity = Math.floor(rand() * 35)

      const table = knapsackDpTable(weights, values, capacity)
      const chosen = reconstructItems(table, weights, capacity)
      const w = chosen.reduce((acc, i) => acc + weights[i], 0)
      const v = chosen.reduce((acc, i) => acc + values[i], 0)
      expect(w).toBeLessThanOrEqual(capacity)
      expect(v).toBe(table[n][capacity])
    }
  })
})
