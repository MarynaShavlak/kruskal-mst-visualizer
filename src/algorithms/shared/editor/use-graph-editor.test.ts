import { describe, it, expect } from "vitest"
import { readGraphParam } from "@/algorithms/shared/editor/use-graph-editor"

describe("readGraphParam", () => {
  it("дістає g із hash із ведучим '#'", () => {
    expect(readGraphParam("#kruskal/editor?g=AbC123")).toBe("AbC123")
  })

  it("працює без ведучого '#'", () => {
    expect(readGraphParam("kruskal/editor?g=xyz")).toBe("xyz")
  })

  it("повертає null, коли немає query", () => {
    expect(readGraphParam("#floyd-warshall/editor")).toBeNull()
    expect(readGraphParam("")).toBeNull()
  })

  it("повертає null, коли немає параметра g", () => {
    expect(readGraphParam("#kruskal/editor?other=1")).toBeNull()
  })

  it("знаходить g серед інших параметрів", () => {
    expect(readGraphParam("#kruskal/editor?foo=1&g=zzz")).toBe("zzz")
  })
})
