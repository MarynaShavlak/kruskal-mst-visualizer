import { describe, it, expect } from "vitest"
import { Waypoints } from "lucide-react"
import { createAlgorithm, type AlgorithmConfig } from "@/algorithms/create-algorithm"

// Спільна заготовка конфігу — мінімум обов'язкових полів; кожен тест домішує своє.
function baseConfig(extra?: Partial<AlgorithmConfig>): AlgorithmConfig {
  return {
    id: "demo",
    name: { ua: "Демо", en: "Demo" },
    shortName: { ua: "Демо", en: "Demo" },
    tagline: { ua: "опис", en: "tagline" },
    family: "search",
    category: { ua: "категорія", en: "category" },
    complexity: { typical: "O(log n)", worst: "O(n)" },
    complexityClass: "logarithmic",
    icon: Waypoints,
    views: {
      learn: () => Promise.resolve({ LearnView: () => null }),
    },
    ...extra,
  }
}

describe("createAlgorithm", () => {
  it("проставляє дефолти status/defaultTab", () => {
    const algo = createAlgorithm(baseConfig())
    expect(algo.status).toBe("ready")
    expect(algo.defaultTab).toBe("learn")
    expect(algo.tabs).toHaveLength(1)
    expect(algo.tabs[0]?.key).toBe("learn")
  })

  it("протягує precondition у дескриптор (round-trip)", () => {
    const algo = createAlgorithm(
      baseConfig({ precondition: { kind: "sorted-array" } }),
    )
    expect(algo.precondition).toEqual({ kind: "sorted-array" })
  })

  it("протягує connected-graph precondition", () => {
    const algo = createAlgorithm(
      baseConfig({ precondition: { kind: "connected-graph" } }),
    )
    expect(algo.precondition?.kind).toBe("connected-graph")
  })

  it("без precondition поле відсутнє (умовний spread, не undefined-значення)", () => {
    const algo = createAlgorithm(baseConfig())
    expect(algo.precondition).toBeUndefined()
    expect("precondition" in algo).toBe(false)
  })

  it("planned і precondition не заважають одне одному", () => {
    const algo = createAlgorithm(
      baseConfig({
        planned: [{ ua: "розділ", en: "section" }],
        precondition: { kind: "sorted-array" },
      }),
    )
    expect(algo.planned).toHaveLength(1)
    expect(algo.precondition?.kind).toBe("sorted-array")
  })
})
