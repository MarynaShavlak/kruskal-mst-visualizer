import { describe, it, expect } from "vitest"
import {
  sumCodesHash,
  slotOf,
  runHashTable,
  hashTableSteps,
  countHtOperations,
  type HtOp,
} from "@/lib/hashTable"
import {
  HT_INTRO_OPS,
  HT_INTRO_CAPACITY,
  HT_INTRO_STATS,
  HT_INTRO_SLOTS,
  HT_ANAGRAMS_OPS,
  HT_ANAGRAMS_CAPACITY,
} from "@/lib/exampleHashTable"

describe("sumCodesHash / slotOf — навчальна хеш-функція", () => {
  it("сума кодів символів (усно перевірна)", () => {
    expect(sumCodesHash("apple")).toBe(530)
    expect(sumCodesHash("orange")).toBe(636)
    expect(sumCodesHash("banana")).toBe(609)
    expect(sumCodesHash("lemon")).toBe(539)
    expect(sumCodesHash("grape")).toBe(527)
    expect(sumCodesHash("")).toBe(0)
  })

  it("slot = hash % capacity збігається з еталоном комірок", () => {
    for (const [key, slot] of Object.entries(HT_INTRO_SLOTS)) {
      expect(slotOf(key, HT_INTRO_CAPACITY), key).toBe(slot)
    }
    // banana і lemon → одна комірка (колізія)
    expect(slotOf("banana", 5)).toBe(slotOf("lemon", 5))
  })

  it("детермінованість: той самий ключ → той самий слот", () => {
    expect(slotOf("apple", 5)).toBe(slotOf("apple", 5))
  })

  it("poly-хеш дає валідний слот у діапазоні та детермінований", () => {
    const a = slotOf("apple", 5, "poly")
    expect(a).toBe(slotOf("apple", 5, "poly"))
    expect(a).toBeGreaterThanOrEqual(0)
    expect(a).toBeLessThan(5)
  })
})

describe("runHashTable (головний приклад, ланцюжки)", () => {
  const run = runHashTable(HT_INTRO_OPS, HT_INTRO_CAPACITY)

  it("фінальний стан комірок — еталон", () => {
    expect(run.buckets[0]).toEqual([{ key: "apple", value: 10 }])
    expect(run.buckets[1]).toEqual([{ key: "orange", value: 20 }])
    expect(run.buckets[2]).toEqual([])
    expect(run.buckets[3]).toEqual([])
    // banana і lemon у одному ланцюзі (колізія), у порядку вставки
    expect(run.buckets[4]).toEqual([
      { key: "banana", value: 30 },
      { key: "lemon", value: 40 },
    ])
  })

  it("лічильники — еталон (4 пари / 4 порівняння / 1 колізія)", () => {
    expect(run.size).toBe(HT_INTRO_STATS.size)
    expect(run.comparisons).toBe(HT_INTRO_STATS.comparisons)
    expect(run.collisions).toBe(HT_INTRO_STATS.collisions)
  })

  it("результат кожної операції: три stored, влучення, скан-влучення, промах", () => {
    const results = run.perOp.map((p) => p.result)
    expect(results).toEqual([
      "stored", "stored", "stored", "stored", "hit", "hit", "miss",
    ])
    expect(run.perOp[4].value).toBe(20) // get orange → 20
    expect(run.perOp[5].value).toBe(40) // get lemon → 40 (аж у кінці ланцюга)
    expect(run.perOp[6].value).toBeNull() // get grape → промах
    expect(run.perOp[6].homeIndex).toBe(2) // порожня комірка 2
  })

  it("countHtOperations узгоджений із прогоном; α = 0.8", () => {
    const c = countHtOperations(HT_INTRO_OPS, HT_INTRO_CAPACITY)
    expect(c.comparisons).toBe(run.comparisons)
    expect(c.collisions).toBe(run.collisions)
    expect(c.loadFactor).toBeCloseTo(HT_INTRO_STATS.loadFactor)
  })
})

describe("runHashTable — семантика операцій", () => {
  it("insert наявного ключа = ОНОВЛЕННЯ, не дубль (size не росте)", () => {
    const ops: HtOp[] = [
      { kind: "insert", key: "apple", value: 10 },
      { kind: "insert", key: "apple", value: 99 },
    ]
    const run = runHashTable(ops, 5)
    expect(run.size).toBe(1)
    expect(run.buckets[0]).toEqual([{ key: "apple", value: 99 }])
    expect(run.perOp[1].result).toBe("updated")
    expect(run.perOp[1].value).toBe(99)
  })

  it("delete вирізає ноду (size--), далі get → промах; delete відсутнього → промах", () => {
    const ops: HtOp[] = [
      { kind: "insert", key: "banana", value: 30 },
      { kind: "insert", key: "lemon", value: 40 }, // той самий слот
      { kind: "delete", key: "banana" },
      { kind: "get", key: "banana" },
      { kind: "get", key: "lemon" }, // lemon лишається в ланцюзі
      { kind: "delete", key: "cherry" }, // немає такого
    ]
    const run = runHashTable(ops, 5)
    expect(run.perOp[2].result).toBe("deleted")
    expect(run.perOp[3].result).toBe("miss")
    expect(run.perOp[4].result).toBe("hit")
    expect(run.perOp[4].value).toBe(40)
    expect(run.perOp[5].result).toBe("miss")
    expect(run.size).toBe(1) // лишився лише lemon
    expect(run.buckets[4]).toEqual([{ key: "lemon", value: 40 }])
  })

  it("анаграми ate/eat/tea колізують у одну комірку → довгий ланцюг", () => {
    const run = runHashTable(HT_ANAGRAMS_OPS, HT_ANAGRAMS_CAPACITY)
    expect(sumCodesHash("ate")).toBe(314)
    expect(slotOf("ate", 5)).toBe(4)
    expect(run.buckets[4].map((e) => e.key)).toEqual(["ate", "eat", "tea"])
    expect(run.collisions).toBe(2) // eat і tea обидва влучили в непорожню комірку
    // get tea сканує весь ланцюг: 3 порівняння (ate,eat,tea) + 2 при вставках
    expect(run.perOp[3].result).toBe("hit")
    expect(run.perOp[3].value).toBe(3)
  })

  it("порожній скрипт → порожня таблиця, нульові лічильники", () => {
    const run = runHashTable([], 5)
    expect(run.size).toBe(0)
    expect(run.comparisons).toBe(0)
    expect(run.collisions).toBe(0)
    expect(run.buckets).toHaveLength(5)
    expect(run.buckets.every((b) => b.length === 0)).toBe(true)
  })
})

describe("hashTableSteps — знімки незмінні (чесний scrubbing назад)", () => {
  it("знімок раннього кадру НЕ змінюється пізнішими операціями", () => {
    const { events } = hashTableSteps(HT_INTRO_OPS, HT_INTRO_CAPACITY)
    // кадр після вставки apple: комірка 0 має apple, комірка 4 ще порожня
    const afterApple = events.find(
      (e) => e.kind === "insert" && e.op?.key === "apple",
    )!
    expect(afterApple.buckets[0]).toEqual([{ key: "apple", value: 10 }])
    expect(afterApple.buckets[4]).toEqual([])
    // фінальний кадр: комірка 4 має banana+lemon — знімки незалежні
    const done = events[events.length - 1]
    expect(done.buckets[4]).toHaveLength(2)
    expect(afterApple.buckets[4]).toHaveLength(0)
  })
})
