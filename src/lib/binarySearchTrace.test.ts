import { describe, it, expect } from "vitest"
import {
  buildBinarySearchTrace,
  ITERATIVE_CODE,
  RECURSIVE_CODE,
} from "@/lib/binarySearchTrace"
import { BS_INTRO, BS_ABSENT, BS_BEST } from "@/lib/exampleBinarySearch"

describe("buildBinarySearchTrace — головний приклад (ітеративний)", () => {
  const trace = buildBinarySearchTrace(BS_INTRO.values, BS_INTRO.target)

  it("8 кадрів (init + по 2 на 3 кроки + done) — як повне трасування README", () => {
    expect(trace.frames.length).toBe(8)
    expect(trace.frames.map((f) => f.phase)).toEqual([
      "init",
      "probe",
      "discard",
      "probe",
      "discard",
      "probe",
      "found",
      "done",
    ])
  })

  it("результат і лічильники — еталон (індекс 6, 3 кроки)", () => {
    expect(trace.result.result).toBe(6)
    expect(trace.result.steps).toBe(3)
    expect(trace.result.found).toBe(true)
    expect(trace.result.size).toBe(11)
    expect(trace.code).toBe(ITERATIVE_CODE)
  })

  it("проби на mid 5,8,6; вікно звужується вдвічі", () => {
    const probes = trace.frames.filter((f) => f.phase === "probe")
    expect(probes.map((f) => f.mid)).toEqual([5, 8, 6])
    expect(probes.map((f) => [f.low, f.high])).toEqual([
      [0, 10],
      [6, 10],
      [6, 7],
    ])
  })

  it("кадри відкидання несуть половину, яку відкидаємо (discardLo..discardHi)", () => {
    const d1 = trace.frames[2] // step 1 discard: arr[5]=12<15 → відкидаємо [0..5]
    expect(d1.phase).toBe("discard")
    expect([d1.discardLo, d1.discardHi]).toEqual([0, 5])
    expect([d1.low, d1.high]).toEqual([6, 10]) // нове вікно
    const d2 = trace.frames[4] // step 2 discard: arr[8]=20>15 → відкидаємо [8..10]
    expect([d2.discardLo, d2.discardHi]).toEqual([8, 10])
    expect([d2.low, d2.high]).toEqual([6, 7])
  })

  it("масив незмінний; лічильник кроків монотонний; підписи непорожні", () => {
    let prev = 0
    for (const f of trace.frames) {
      expect(f.array).toEqual([...BS_INTRO.values])
      expect(f.caption.length).toBeGreaterThan(0)
      expect(f.steps).toBeGreaterThanOrEqual(prev)
      prev = f.steps
    }
  })

  it("step_intro_K ↔ кадр 2K+2 (розв'язок кроку K)", () => {
    expect(trace.frames[2].phase).toBe("discard") // step_intro_0
    expect(trace.frames[4].phase).toBe("discard") // step_intro_1
    expect(trace.frames[6].phase).toBe("found") // step_intro_2
    expect(trace.frames[6].mid).toBe(6)
  })
})

describe("buildBinarySearchTrace — відсутній та найкращий", () => {
  it("ABSENT 11: 10 кадрів, -1, 4 кроки, done на гілці return -1", () => {
    const trace = buildBinarySearchTrace(BS_ABSENT.values, BS_ABSENT.target)
    expect(trace.frames.length).toBe(10)
    expect(trace.result.result).toBe(-1)
    expect(trace.result.found).toBe(false)
    expect(trace.result.steps).toBe(4)
    expect(trace.frames[trace.frames.length - 1].mid).toBeNull()
  })

  it("BEST 12: 4 кадри (init+probe+found+done), 1 крок", () => {
    const trace = buildBinarySearchTrace(BS_BEST.values, BS_BEST.target)
    expect(trace.frames.length).toBe(4)
    expect(trace.result.result).toBe(5)
    expect(trace.result.steps).toBe(1)
  })
})

describe("buildBinarySearchTrace — рекурсивний режим", () => {
  const iter = buildBinarySearchTrace(BS_INTRO.values, BS_INTRO.target, false)
  const rec = buildBinarySearchTrace(BS_INTRO.values, BS_INTRO.target, true)

  it("еволюція вікна ІДЕНТИЧНА ітеративній; різниться лише лістинг + глибина", () => {
    expect(rec.code).toBe(RECURSIVE_CODE)
    expect(rec.frames.length).toBe(iter.frames.length)
    expect(rec.frames.map((f) => [f.low, f.high, f.mid])).toEqual(
      iter.frames.map((f) => [f.low, f.high, f.mid]),
    )
    expect(rec.result.result).toBe(6)
    // глибина рекурсії зростає з кроками
    const lastProbe = rec.frames.filter((f) => f.phase === "probe").at(-1)!
    expect(lastProbe.depth).toBe(3)
  })
})

describe("лістинги коду", () => {
  it("ITERATIVE_CODE: while-цикл, return mid / return -1", () => {
    expect(ITERATIVE_CODE.some((l) => l.includes("while low <= high"))).toBe(true)
    expect(ITERATIVE_CODE.some((l) => l.includes("return mid"))).toBe(true)
    expect(ITERATIVE_CODE.some((l) => l.includes("return -1"))).toBe(true)
  })

  it("RECURSIVE_CODE: рекурсивний виклик binary_search(...)", () => {
    expect(RECURSIVE_CODE.filter((l) => l.includes("binary_search(arr, x")).length).toBeGreaterThanOrEqual(2)
  })
})
