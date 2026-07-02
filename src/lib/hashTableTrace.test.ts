import { describe, it, expect } from "vitest"
import { buildHashTableTrace, HT_CODE } from "@/lib/hashTableTrace"
import {
  HT_INTRO_OPS,
  HT_INTRO_CAPACITY,
  HT_INTRO_STATS,
} from "@/lib/exampleHashTable"

describe("buildHashTableTrace (головний приклад)", () => {
  const trace = buildHashTableTrace(HT_INTRO_OPS, HT_INTRO_CAPACITY)

  it("35 кадрів (по одному на подію); перший init, останній done", () => {
    expect(trace.frames.length).toBe(HT_INTRO_STATS.frames)
    expect(trace.frames[0].phase).toBe("init")
    expect(trace.frames[trace.frames.length - 1].phase).toBe("done")
  })

  it("індекс кадру i збігається з позицією в списку", () => {
    trace.frames.forEach((f, i) => expect(f.i).toBe(i))
  })

  it("підсумок — еталон (4 пари / 4 порівняння / 1 колізія / α=0.8)", () => {
    expect(trace.result.size).toBe(HT_INTRO_STATS.size)
    expect(trace.result.comparisons).toBe(HT_INTRO_STATS.comparisons)
    expect(trace.result.collisions).toBe(HT_INTRO_STATS.collisions)
    expect(trace.result.loadFactor).toBeCloseTo(HT_INTRO_STATS.loadFactor)
    expect(trace.result.capacity).toBe(5)
    expect(trace.result.hashFn).toBe("sum")
    expect(trace.result.strategy).toBe("chaining")
  })

  it("кожен кадр має непорожню нарацію; лічильники монотонні; α ∈ [0,1]", () => {
    let prevC = 0
    let prevK = 0
    for (const f of trace.frames) {
      expect(f.caption.length).toBeGreaterThan(0)
      expect(f.buckets.length).toBe(5)
      expect(f.comparisons).toBeGreaterThanOrEqual(prevC)
      expect(f.collisions).toBeGreaterThanOrEqual(prevK)
      expect(f.loadFactor).toBeGreaterThanOrEqual(0)
      expect(f.loadFactor).toBeLessThanOrEqual(1)
      prevC = f.comparisons
      prevK = f.collisions
    }
  })

  it("кадр hash несе сирий хеш і домашній індекс (apple → 530 → комірка 0)", () => {
    const hashApple = trace.frames.find(
      (f) => f.phase === "hash" && f.op?.key === "apple",
    )!
    expect(hashApple.rawHash).toBe(530)
    expect(hashApple.homeIndex).toBe(0)
    expect(hashApple.keyCodes).toEqual([97, 112, 112, 108, 101])
  })

  it("є рівно один кадр колізії — вставка lemon у комірку 4", () => {
    const collisions = trace.frames.filter((f) => f.phase === "collision")
    expect(collisions).toHaveLength(1)
    expect(collisions[0].op?.key).toBe("lemon")
    expect(collisions[0].homeIndex).toBe(4)
    expect(collisions[0].collisions).toBe(1)
  })

  it("get lemon сканує ланцюг [banana, lemon] і влучає (2 порівняння)", () => {
    const compares = trace.frames.filter(
      (f) => f.phase === "compare" && f.op?.kind === "get" && f.op?.key === "lemon",
    )
    expect(compares.map((f) => f.scanPos)).toEqual([0, 1])
    const found = trace.frames.find(
      (f) => f.phase === "found" && f.op?.key === "lemon",
    )!
    expect(found.resultValue).toBe(40)
    expect(found.landedChainPos).toBe(1)
  })

  it("get grape → промах у порожню комірку 2, без порівнянь", () => {
    const miss = trace.frames.find((f) => f.phase === "miss" && f.op?.key === "grape")!
    expect(miss.homeIndex).toBe(2)
    const grapeCompares = trace.frames.filter(
      (f) => f.phase === "compare" && f.op?.key === "grape",
    )
    expect(grapeCompares).toHaveLength(0)
  })

  it("op_done кадри несуть вердикт кожної операції у порядку скрипту", () => {
    const verdicts = trace.frames
      .filter((f) => f.phase === "op" && f.opResult !== null)
      .map((f) => f.opResult)
    expect(verdicts).toEqual([
      "stored", "stored", "stored", "stored", "hit", "hit", "miss",
    ])
  })

  it("знімки кадрів незалежні (рання комірка 4 порожня, фінальна — 2 пари)", () => {
    const insertApple = trace.frames.find(
      (f) => f.phase === "insert" && f.op?.key === "apple",
    )!
    expect(insertApple.buckets[4]).toHaveLength(0)
    const done = trace.frames[trace.frames.length - 1]
    expect(done.buckets[4]).toHaveLength(2)
  })
})

describe("HT_CODE", () => {
  it("наочний лістинг: хеш→індекс, скан ланцюга, append нового ключа", () => {
    expect(HT_CODE.some((l) => l.includes("hash(key) % size"))).toBe(true)
    expect(HT_CODE.some((l) => l.includes("bucket.append"))).toBe(true)
    expect(HT_CODE.some((l) => l.includes("for pair in table[i]"))).toBe(true)
  })
})
