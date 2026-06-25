import { describe, it, expect } from "vitest"
import { algorithmsByFamily } from "@/algorithms/registry"
import {
  applyCatalogFilters,
  countForClass,
  countForFamily,
  matchesClass,
  matchesFamily,
  matchesQuery,
  normalize,
} from "@/features/home/catalog-filter"
import type { Algorithm } from "@/algorithms/types"

const groups = algorithmsByFamily()
const all: readonly Algorithm[] = groups.flatMap((g) => g.items)
const kruskal = all.find((a) => a.id === "kruskal")!

describe("normalize", () => {
  it("обрізає й опускає регістр", () => {
    expect(normalize("  Краскал  ")).toBe("краскал")
    expect(normalize("BFS")).toBe("bfs")
  })
})

describe("matchesQuery", () => {
  it("порожній запит → завжди true", () => {
    expect(matchesQuery(kruskal, "", "ua")).toBe(true)
    expect(matchesQuery(kruskal, "   ", "en")).toBe(true)
  })

  it("збіг по id незалежно від мови", () => {
    expect(matchesQuery(kruskal, "kruskal", "ua")).toBe(true)
    expect(matchesQuery(kruskal, "kruskal", "en")).toBe(true)
  })

  it("збіг по назві поточною мовою", () => {
    expect(matchesQuery(kruskal, kruskal.shortName.ua.slice(0, 4), "ua")).toBe(
      true,
    )
    expect(matchesQuery(kruskal, kruskal.shortName.en.slice(0, 4), "en")).toBe(
      true,
    )
  })

  it("нерелевантний запит → false", () => {
    expect(matchesQuery(kruskal, "zzzzz-no-match", "ua")).toBe(false)
  })
})

describe("matchesClass / matchesFamily", () => {
  it("«all» завжди проходить", () => {
    expect(matchesClass(kruskal, "all")).toBe(true)
    expect(matchesFamily(kruskal, "all")).toBe(true)
  })

  it("точний збіг фасети", () => {
    expect(matchesFamily(kruskal, kruskal.family)).toBe(true)
    expect(matchesClass(kruskal, kruskal.complexityClass)).toBe(true)
  })
})

describe("applyCatalogFilters", () => {
  it("без фільтрів повертає всі непорожні групи", () => {
    const res = applyCatalogFilters(groups, {
      family: "all",
      cls: "all",
      q: "",
      lang: "ua",
    })
    expect(res.total).toBe(all.length)
    expect(res.groups.length).toBe(groups.length)
  })

  it("фасета родини лишає лише одну секцію", () => {
    const res = applyCatalogFilters(groups, {
      family: "graphs",
      cls: "all",
      q: "",
      lang: "ua",
    })
    expect(res.groups.every((g) => g.family.id === "graphs")).toBe(true)
    expect(res.total).toBeGreaterThan(0)
  })

  it("текстовий запит звужує до підмножини", () => {
    const res = applyCatalogFilters(groups, {
      family: "all",
      cls: "all",
      q: "kruskal",
      lang: "ua",
    })
    expect(res.total).toBe(1)
    expect(res.groups.flatMap((g) => g.items)[0]!.id).toBe("kruskal")
  })

  it("несумісні фасети → порожньо (total 0, без груп)", () => {
    const res = applyCatalogFilters(groups, {
      family: "all",
      cls: "all",
      q: "zzzzz-no-match",
      lang: "ua",
    })
    expect(res.total).toBe(0)
    expect(res.groups).toHaveLength(0)
  })
})

describe("лічильники фасет", () => {
  it("countForFamily('all') = усі за решти фасет", () => {
    expect(countForFamily(groups, "all", "all", "", "ua")).toBe(all.length)
  })

  it("countForFamily звужується запитом", () => {
    expect(countForFamily(groups, "all", "all", "kruskal", "ua")).toBe(1)
  })

  it("countForClass('all') = усі за решти фасет", () => {
    expect(countForClass(groups, "all", "all", "", "ua")).toBe(all.length)
  })

  it("лічильники фасет враховують одна одну", () => {
    const graphsCount = countForFamily(groups, "graphs", "all", "", "ua")
    const linearInGraphs = countForClass(groups, "linear", "graphs", "", "ua")
    expect(linearInGraphs).toBeLessThanOrEqual(graphsCount)
  })
})
