import { describe, it, expect } from "vitest"
import {
  parseHash,
  parseCatalogQuery,
  buildCatalogHash,
} from "@/hooks/use-route"

const EMPTY_CATALOG = { family: null, cls: null, q: null }

describe("parseHash", () => {
  it("порожній хеш → каталог (домівка)", () => {
    expect(parseHash("")).toEqual({
      algorithmId: null,
      tab: null,
      page: null,
      catalog: EMPTY_CATALOG,
    })
    expect(parseHash("#")).toEqual({
      algorithmId: null,
      tab: null,
      page: null,
      catalog: EMPTY_CATALOG,
    })
  })

  it("алгоритм без вкладки", () => {
    expect(parseHash("#kruskal")).toEqual({
      algorithmId: "kruskal",
      tab: null,
      page: null,
      catalog: EMPTY_CATALOG,
    })
  })

  it("алгоритм + вкладка", () => {
    expect(parseHash("#kruskal/editor")).toEqual({
      algorithmId: "kruskal",
      tab: "editor",
      page: null,
      catalog: EMPTY_CATALOG,
    })
  })

  it("заглушка Флойда розпізнається", () => {
    expect(parseHash("#floyd-warshall")).toEqual({
      algorithmId: "floyd-warshall",
      tab: null,
      page: null,
      catalog: EMPTY_CATALOG,
    })
  })

  it("службова сторінка #compare (матриця складності)", () => {
    expect(parseHash("#compare")).toEqual({
      algorithmId: null,
      tab: null,
      page: "compare",
      catalog: EMPTY_CATALOG,
    })
  })

  it("параметри після ? відкидаються (шаринг графа через ?g=)", () => {
    expect(parseHash("#kruskal/editor?g=AbC123")).toEqual({
      algorithmId: "kruskal",
      tab: "editor",
      page: null,
      catalog: EMPTY_CATALOG,
    })
  })

  it("невідомий перший сегмент → домівка", () => {
    expect(parseHash("#nope")).toEqual({
      algorithmId: null,
      tab: null,
      page: null,
      catalog: EMPTY_CATALOG,
    })
  })

  it("зворотна сумісність: стара вкладка без алгоритму → Краскал", () => {
    expect(parseHash("#editor")).toEqual({
      algorithmId: "kruskal",
      tab: "editor",
      page: null,
      catalog: EMPTY_CATALOG,
    })
    expect(parseHash("#benchmark?g=x")).toEqual({
      algorithmId: "kruskal",
      tab: "benchmark",
      page: null,
      catalog: EMPTY_CATALOG,
    })
  })

  it("фасети каталогу зчитуються лише на каталог-роуті", () => {
    expect(parseHash("#?family=graphs&class=linear&q=bfs").catalog).toEqual({
      family: "graphs",
      cls: "linear",
      q: "bfs",
    })
    // На роуті алгоритму query-фасети ігноруються (там працює ?g=).
    expect(parseHash("#kruskal/editor?family=graphs").catalog).toEqual(
      EMPTY_CATALOG,
    )
  })
})

describe("parseCatalogQuery", () => {
  it("повна форма family/class/q", () => {
    expect(parseCatalogQuery("#?family=graphs&class=linear&q=bfs")).toEqual({
      family: "graphs",
      cls: "linear",
      q: "bfs",
    })
  })

  it("&-форма теж парситься", () => {
    expect(parseCatalogQuery("#&family=sorting").family).toBe("sorting")
  })

  it("«all»/порожні значення нормалізуються до null", () => {
    expect(parseCatalogQuery("#?family=all&class=&q=")).toEqual({
      family: null,
      cls: null,
      q: null,
    })
  })

  it("без query → усе null", () => {
    expect(parseCatalogQuery("#")).toEqual({
      family: null,
      cls: null,
      q: null,
    })
    expect(parseCatalogQuery("")).toEqual({
      family: null,
      cls: null,
      q: null,
    })
  })

  it("пробіли в q зберігаються (через URLSearchParams)", () => {
    expect(parseCatalogQuery("#?q=binary+search").q).toBe("binary search")
  })
})

describe("buildCatalogHash", () => {
  it("омітить «all»/порожні значення", () => {
    expect(buildCatalogHash({ family: "all", cls: "all", q: "" })).toBe("")
    expect(buildCatalogHash({})).toBe("")
  })

  it("кодує задані фасети під ключем class (не cls)", () => {
    expect(buildCatalogHash({ family: "graphs", cls: "linear" })).toBe(
      "?family=graphs&class=linear",
    )
  })

  it("кодує текст q безпечно", () => {
    expect(buildCatalogHash({ q: "binary search" })).toBe("?q=binary+search")
  })

  it("round-trip із parseCatalogQuery", () => {
    const hash = buildCatalogHash({
      family: "search",
      cls: "logarithmic",
      q: "поиск",
    })
    expect(parseCatalogQuery("#" + hash)).toEqual({
      family: "search",
      cls: "logarithmic",
      q: "поиск",
    })
  })
})
