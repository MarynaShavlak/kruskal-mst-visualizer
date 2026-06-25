import { describe, it, expect } from "vitest"
import {
  ALGORITHMS,
  BRIDGES,
  bridgeFrom,
  bridgeTo,
  isAlgorithmId,
} from "@/algorithms/registry"

describe("BRIDGES — навчальні містки між алгоритмами", () => {
  it("кожен from/to — реальний id алгоритму", () => {
    for (const b of BRIDGES) {
      expect(isAlgorithmId(b.from), `from=${b.from}`).toBe(true)
      expect(isAlgorithmId(b.to), `to=${b.to}`).toBe(true)
    }
  })

  it("без петель (from ≠ to)", () => {
    for (const b of BRIDGES) {
      expect(b.from).not.toBe(b.to)
    }
  })

  it("без дублікатів ребер (унікальна пара from→to)", () => {
    const keys = BRIDGES.map((b) => `${b.from}→${b.to}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it("кожен from має не більше одного містка (лінійний ланцюг)", () => {
    const froms = BRIDGES.map((b) => b.from)
    expect(new Set(froms).size).toBe(froms.length)
  })

  it("кожен to має не більше одного вхідного містка (лінійний ланцюг)", () => {
    const tos = BRIDGES.map((b) => b.to)
    expect(new Set(tos).size).toBe(tos.length)
  })

  it("кожна нотатка непорожня обома мовами", () => {
    for (const b of BRIDGES) {
      expect(b.note.ua.trim().length, `${b.from}→${b.to} ua`).toBeGreaterThan(0)
      expect(b.note.en.trim().length, `${b.from}→${b.to} en`).toBeGreaterThan(0)
    }
  })

  it("bridgeFrom/bridgeTo — round-trip із BRIDGES", () => {
    for (const b of BRIDGES) {
      expect(bridgeFrom(b.from)).toBe(b)
      expect(bridgeTo(b.to)).toBe(b)
    }
  })

  it("охоплює весь курс: лише один старт і один фініш ланцюга", () => {
    const fromSet = new Set(BRIDGES.map((b) => b.from))
    const toSet = new Set(BRIDGES.map((b) => b.to))
    const starts = ALGORITHMS.filter((a) => !toSet.has(a.id))
    const ends = ALGORITHMS.filter((a) => !fromSet.has(a.id))
    // Один безперервний ланцюг через усі 24 алгоритми → рівно 1 старт і 1 фініш.
    expect(starts).toHaveLength(1)
    expect(ends).toHaveLength(1)
  })

  it("кожен алгоритм (крім кінцевих точок) має хоча б один місток", () => {
    for (const a of ALGORITHMS) {
      const has = bridgeFrom(a.id) != null || bridgeTo(a.id) != null
      expect(has, `алгоритм ${a.id} без жодного містка`).toBe(true)
    }
  })

  it("bridgeFrom/bridgeTo повертають undefined для невідомого id", () => {
    expect(bridgeFrom("__nope__")).toBeUndefined()
    expect(bridgeTo("__nope__")).toBeUndefined()
  })
})
