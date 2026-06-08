import { describe, it, expect } from "vitest"
import { parseHash } from "@/hooks/use-route"

describe("parseHash", () => {
  it("порожній хеш → каталог (домівка)", () => {
    expect(parseHash("")).toEqual({ algorithmId: null, tab: null })
    expect(parseHash("#")).toEqual({ algorithmId: null, tab: null })
  })

  it("алгоритм без вкладки", () => {
    expect(parseHash("#kruskal")).toEqual({ algorithmId: "kruskal", tab: null })
  })

  it("алгоритм + вкладка", () => {
    expect(parseHash("#kruskal/editor")).toEqual({
      algorithmId: "kruskal",
      tab: "editor",
    })
  })

  it("заглушка Флойда розпізнається", () => {
    expect(parseHash("#floyd-warshall")).toEqual({
      algorithmId: "floyd-warshall",
      tab: null,
    })
  })

  it("параметри після ? відкидаються (шаринг графа через ?g=)", () => {
    expect(parseHash("#kruskal/editor?g=AbC123")).toEqual({
      algorithmId: "kruskal",
      tab: "editor",
    })
  })

  it("невідомий перший сегмент → домівка", () => {
    expect(parseHash("#nope")).toEqual({ algorithmId: null, tab: null })
  })

  it("зворотна сумісність: стара вкладка без алгоритму → Краскал", () => {
    expect(parseHash("#editor")).toEqual({
      algorithmId: "kruskal",
      tab: "editor",
    })
    expect(parseHash("#benchmark?g=x")).toEqual({
      algorithmId: "kruskal",
      tab: "benchmark",
    })
  })
})
