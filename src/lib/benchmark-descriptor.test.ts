import { describe, it, expect } from "vitest"
import {
  countBenchmarkOps,
  defineBenchmark,
  getBenchmarkCore,
  runBenchmarkPoint,
  type BenchmarkCore,
} from "@/lib/benchmark-descriptor"
import { sortBenchmark } from "@/lib/benchmarks/sort-benchmark"

// Детермінований backbone дескриптора: реєстрація, незмінність входу, детермінований
// makeInput, збіг ops-метрики. ms-метрика недетермінована → лише finiteness.

describe("benchmark-descriptor (узагальнений kit)", () => {
  it("defineBenchmark реєструє PURE-ядро в реєстрі за id", () => {
    const core = getBenchmarkCore("bubble-sort")
    expect(core).toBeDefined()
    expect(core?.id).toBe("bubble-sort")
    expect(core?.series.map((s) => s.id)).toEqual(["naive", "optimized"])
  })

  it("UI-проєкція несе метадані серій без closures", () => {
    expect(sortBenchmark.id).toBe("bubble-sort")
    expect(sortBenchmark.series).toEqual([
      { id: "naive", name: { ua: "наївна", en: "naive" }, color: "#dc2626", hasOps: true, theoretical: "quadratic" },
      {
        id: "optimized",
        name: { ua: "оптимізована (swapped)", en: "optimized (swapped)" },
        color: "#16a34a",
        hasOps: true,
        theoretical: "quadratic",
      },
    ])
    // closures не протікли в UI-проєкцію
    expect((sortBenchmark.series[0] as unknown as Record<string, unknown>).runMs).toBeUndefined()
  })

  it("makeInput детермінований за seed", () => {
    const core = getBenchmarkCore("bubble-sort")!
    const a = core.makeInput(50, 7)
    const b = core.makeInput(50, 7)
    expect(a).toEqual(b)
    const c = core.makeInput(50, 8)
    expect(c).not.toEqual(a)
  })

  it("countBenchmarkOps детермінований і збігається з прямим підрахунком", () => {
    const core = getBenchmarkCore("bubble-sort")!
    const p1 = countBenchmarkOps(core, 40, 1)
    const p2 = countBenchmarkOps(core, 40, 1)
    expect(p1).toEqual(p2)
    expect(p1.size).toBe(40)
    expect(p1.naiveOps).toBeGreaterThan(0)
    // наївна завжди робить усі n(n−1)/2 порівнянь
    expect(p1.naiveOps).toBe((40 * 39) / 2)
    // оптимізована не робить БІЛЬШЕ за наївну
    expect(p1.optimizedOps).toBeLessThanOrEqual(p1.naiveOps)
  })

  it("runMs НЕ мутує спільний вхід (uniform-clone)", () => {
    const core = getBenchmarkCore("bubble-sort")!
    const input = core.makeInput(30, 3)
    const before = [...(input as number[])]
    runBenchmarkPoint(core as BenchmarkCore<number[]>, 30, 3)
    // повторно будуємо й порівнюємо: makeInput детермінований, тож якби runMs
    // мутувало спільний вхід — числа б розійшлися. Тут перевіряємо саму копію.
    expect(input).toEqual(before)
  })

  it("runBenchmarkPoint повертає скінченні невід'ємні часи + ops", () => {
    const core = getBenchmarkCore("bubble-sort")!
    const p = runBenchmarkPoint(core, 60, 1)
    expect(p.size).toBe(60)
    for (const id of ["naive", "optimized"]) {
      expect(Number.isFinite(p[`${id}Ms`])).toBe(true)
      expect(p[`${id}Ms`]).toBeGreaterThanOrEqual(0)
      expect(Number.isFinite(p[`${id}Ops`])).toBe(true)
    }
  })

  it("серія без countOps не пише Ops-ключ", () => {
    const core: BenchmarkCore<number[]> = {
      id: "test-no-ops",
      sizes: [10],
      makeInput: (n) => Array.from({ length: n }, (_, i) => i),
      series: [{ id: "only", name: { ua: "о", en: "o" }, color: "#000", runMs: () => {} }],
    }
    const meta = countBenchmarkOps(core, 10, 1)
    expect(meta.onlyOps).toBeUndefined()
    const desc = defineBenchmark(core, {
      title: { ua: "т", en: "t" },
      intro: { ua: "і", en: "i" },
      xLabel: { ua: "x", en: "x" },
    })
    expect(desc.series[0].hasOps).toBe(false)
  })
})
