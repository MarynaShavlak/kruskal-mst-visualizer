import { describe, it, expect, beforeEach } from "vitest"
import { useKnapsackStore } from "@/store/knapsack-store"
import {
  KNAPSACK_CLASSIC,
  KNAPSACK_SMALL,
  KNAPSACK_SMALL_OPTIMAL,
} from "@/lib/exampleKnapsack"
import { knapsackDp } from "@/lib/knapsack"

const get = () => useKnapsackStore.getState()

describe("knapsack-store", () => {
  beforeEach(() => get().loadClassic())

  it("стартовий стан — класичний еталон", () => {
    expect(get().items).toEqual(KNAPSACK_CLASSIC.items)
    expect(get().capacity).toBe(KNAPSACK_CLASSIC.capacity)
  })

  it("addItem додає предмет із канонічним ім'ям", () => {
    const before = get().items.length
    get().addItem()
    expect(get().items.length).toBe(before + 1)
    expect(get().items[before].name).toBe(`П${before + 1}`)
  })

  it("updateItem санітизує вагу (≥1) і вартість (≥0)", () => {
    get().updateItem(0, { weight: 0, value: -10 })
    expect(get().items[0].weight).toBe(1)
    expect(get().items[0].value).toBe(0)
    get().updateItem(0, { weight: 3.9 })
    expect(get().items[0].weight).toBe(3) // truncate
  })

  it("removeItem прибирає предмет за індексом", () => {
    get().removeItem(1)
    expect(get().items.map((it) => it.name)).toEqual(["П1", "П3"])
  })

  it("setCapacity тримає ціле ≥ 0", () => {
    get().setCapacity(-5)
    expect(get().capacity).toBe(0)
    get().setCapacity(12.7)
    expect(get().capacity).toBe(12)
  })

  it("clear спорожнює інстанс", () => {
    get().clear()
    expect(get().items).toEqual([])
    expect(get().capacity).toBe(0)
  })

  it("пресети завантажуються", () => {
    get().loadSmall()
    expect(get().capacity).toBe(KNAPSACK_SMALL.capacity)
    expect(get().items).toEqual(KNAPSACK_SMALL.items)
    get().loadRandom(123)
    expect(get().items.length).toBe(5)
    expect(get().capacity).toBeGreaterThan(0)
  })

  it("toDoc/loadDoc — round-trip; завантажений малий інстанс дає оптимум 18", () => {
    get().loadSmall()
    const doc = get().toDoc()
    get().clear()
    get().loadDoc(doc)
    const weights = get().items.map((it) => it.weight)
    const values = get().items.map((it) => it.value)
    expect(knapsackDp(weights, values, get().capacity)).toBe(KNAPSACK_SMALL_OPTIMAL)
  })
})
