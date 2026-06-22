import { describe, expect, it } from "vitest"
import { buildRabinKarpStringSearchTrace } from "@/lib/rabinKarpStringSearchTrace"
import {
  RK_MAIN,
  RK_NOT_FOUND,
  RK_MAIN_STATS,
} from "@/lib/exampleRabinKarpStringSearch"

describe("buildRabinKarpStringSearchTrace — канонічний приклад (rolling)", () => {
  const trace = buildRabinKarpStringSearchTrace(RK_MAIN.text, RK_MAIN.pattern)

  it("22 кадри = фаза1(11) + searchInit(1) + 9 вікон + done(1)", () => {
    expect(trace.frames.length).toBe(22)
    expect(trace.frames[0].phase).toBe("hashInit")
    expect(trace.frames[trace.frames.length - 1].phase).toBe("done")
  })

  it("фаза 1: 11 кадрів хешу, фінальний хеш шаблону 35", () => {
    const phase1 = trace.frames.filter((f) => f.panel === "hash")
    expect(phase1.length).toBe(11)
    expect(phase1[0].phase).toBe("hashInit")
    expect(phase1[phase1.length - 1].phase).toBe("hashDone")
    expect(phase1[phase1.length - 1].hashValue).toBe(35)
    expect(trace.result.patternHash).toBe(35)
    expect(trace.result.hMultiplier).toBe(79)
  })

  it("фаза 1: Horner-крок i=0 — символ d, код 100, степінь 79, внесок 7900", () => {
    const t0 = trace.frames.find((f) => f.phase === "hashTerm" && f.hashTermIndex === 0)!
    expect(t0.hashChar).toBe("d")
    expect(t0.hashCode).toBe(100)
    expect(t0.hashPower).toBe(79)
    expect(t0.hashContribution).toBe(7900)
  })

  it("фаза 2: searchInit, далі вікна; на зміщенні 6 — колізія (хеш 35, але «a develop»≠«developer»)", () => {
    const collision = trace.frames.find((f) => f.phase === "collision")!
    expect(collision.offset).toBe(6)
    expect(collision.windowHash).toBe(collision.patternHash)
    expect(collision.verdict).toBe("collision")
  })

  it("фінальний результат: 8 за 9 порівнянь хешів, 2 char-перевірки, 1 колізія, 8 rolls", () => {
    expect(trace.result.result).toBe(RK_MAIN_STATS.result)
    expect(trace.result.hashComparisons).toBe(RK_MAIN_STATS.hashComparisons)
    expect(trace.result.charVerifications).toBe(RK_MAIN_STATS.charVerifications)
    expect(trace.result.collisions).toBe(RK_MAIN_STATS.collisions)
    expect(trace.result.rolls).toBe(RK_MAIN_STATS.rolls)
    expect(trace.result.found).toBe(true)
  })

  it("кадр-збіг: offset 8, verdict match, matched=M", () => {
    const found = trace.frames.find((f) => f.phase === "found")!
    expect(found.offset).toBe(8)
    expect(found.verdict).toBe("match")
    expect(found.matched).toBe(RK_MAIN.pattern.length)
  })

  it("rollingOps < recomputeOps (контраст ціни хешування)", () => {
    expect(trace.result.rollingOps).toBeLessThan(trace.result.recomputeOps)
  })

  it("код фази 2 — rolling-лістинг rabin_karp_search", () => {
    expect(trace.searchCode.join("\n")).toContain("def rabin_karp_search(")
    expect(trace.searchCode.join("\n")).toContain("h_multiplier")
  })
})

describe("buildRabinKarpStringSearchTrace — режим перерахунку", () => {
  const trace = buildRabinKarpStringSearchTrace(RK_MAIN.text, RK_MAIN.pattern, false)

  it("той самий результат 8, але код — recompute й лічаться перерахунки (rolls=0)", () => {
    expect(trace.result.result).toBe(8)
    expect(trace.result.rolling).toBe(false)
    expect(trace.result.rolls).toBe(0)
    expect(trace.result.recomputes).toBeGreaterThan(0)
    expect(trace.searchCode.join("\n")).toContain("def rabin_karp_search_recompute(")
  })
})

describe("buildRabinKarpStringSearchTrace — крайові випадки", () => {
  it("не знайдено: фінальний кадр done, результат -1", () => {
    const trace = buildRabinKarpStringSearchTrace(RK_NOT_FOUND.text, RK_NOT_FOUND.pattern)
    expect(trace.result.found).toBe(false)
    expect(trace.result.result).toBe(-1)
    expect(trace.frames[trace.frames.length - 1].phase).toBe("done")
  })

  it("накопичені порівняння хешів монотонно зростають", () => {
    const trace = buildRabinKarpStringSearchTrace(RK_MAIN.text, RK_MAIN.pattern)
    let prev = -1
    for (const f of trace.frames) {
      expect(f.hashComparisons).toBeGreaterThanOrEqual(prev)
      prev = f.hashComparisons
    }
  })
})
