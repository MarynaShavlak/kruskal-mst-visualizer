import { describe, it, expect } from "vitest"
import { anchorScale, theoreticalAt, type ComplexityCurveKind } from "@/lib/complexityBounds"

describe("complexityBounds (теоретичні криві-орієнтири)", () => {
  const kinds: ComplexityCurveKind[] = [
    "constant",
    "log",
    "linear",
    "linearithmic",
    "quadratic",
    "cubic",
  ]

  it("крива ПРОХОДИТЬ точно через якір", () => {
    for (const kind of kinds) {
      const v = theoreticalAt(kind, 100, 100, 42)
      expect(v).toBeCloseTo(42, 6)
    }
  })

  it("anchorScale дає коефіцієнт, що відтворює якір", () => {
    const k = anchorScale("quadratic", 50, 25)
    // f(50) = k·50² = 25  →  k = 25/2500
    expect(k).toBeCloseTo(25 / 2500, 9)
  })

  it("росте монотонно неспадно за n (для n≥1)", () => {
    for (const kind of kinds) {
      const a = theoreticalAt(kind, 10, 100, 1000)
      const b = theoreticalAt(kind, 100, 100, 1000)
      const c = theoreticalAt(kind, 1000, 100, 1000)
      expect(b).toBeGreaterThanOrEqual(a)
      expect(c).toBeGreaterThanOrEqual(b)
    }
  })

  it("квадратична росте швидше за лінійну за межами якоря", () => {
    // спільний якір (100, 100); за n=200 квадратична має обігнати лінійну
    const lin = theoreticalAt("linear", 200, 100, 100)
    const quad = theoreticalAt("quadratic", 200, 100, 100)
    expect(quad).toBeGreaterThan(lin)
  })

  it("constant лишається сталим незалежно від n", () => {
    expect(theoreticalAt("constant", 1, 100, 7)).toBeCloseTo(7, 6)
    expect(theoreticalAt("constant", 9999, 100, 7)).toBeCloseTo(7, 6)
  })
})
