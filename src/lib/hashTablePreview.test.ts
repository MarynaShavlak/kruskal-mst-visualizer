import { describe, it, expect } from "vitest"
import { hashTablePreview, HT_LOAD_THRESHOLD } from "@/lib/hashTablePreview"
import {
  HT_INTRO_OPS,
  HT_INTRO_CAPACITY,
  HT_ANAGRAMS_OPS,
  HT_ANAGRAMS_CAPACITY,
} from "@/lib/exampleHashTable"

describe("hashTablePreview", () => {
  it("класичний приклад: α=0.8 (перевантажено), 1 колізія, ланцюги [1,1,0,0,2]", () => {
    const p = hashTablePreview(HT_INTRO_OPS, HT_INTRO_CAPACITY)
    expect(p.size).toBe(4)
    expect(p.loadFactor).toBeCloseTo(0.8)
    expect(p.collisions).toBe(1)
    expect(p.chainLengths).toEqual([1, 1, 0, 0, 2])
    expect(p.maxChain).toBe(2)
    expect(p.emptyBuckets).toBe(2)
    expect(p.overloaded).toBe(true) // 0.8 > 0.75
    expect(p.clustered).toBe(false) // найдовший ланцюг 2 < 3
  })

  it("анаграми: один ланцюг завдовжки 3 → clustered (гаряча точка)", () => {
    const p = hashTablePreview(HT_ANAGRAMS_OPS, HT_ANAGRAMS_CAPACITY)
    expect(p.maxChain).toBe(3)
    expect(p.clustered).toBe(true)
    expect(p.chainLengths).toEqual([0, 0, 0, 0, 3])
    expect(p.collisions).toBe(2)
  })

  it("порожній скрипт: α=0, без попереджень", () => {
    const p = hashTablePreview([], 5)
    expect(p.loadFactor).toBe(0)
    expect(p.overloaded).toBe(false)
    expect(p.clustered).toBe(false)
    expect(p.emptyBuckets).toBe(5)
  })

  it("поріг навантаження — класичні 0.75", () => {
    expect(HT_LOAD_THRESHOLD).toBe(0.75)
  })
})
