import { describe, it, expect } from "vitest"
import {
  readGraphParam,
  readModeParam,
  readStepParam,
} from "@/algorithms/shared/editor/use-graph-editor"

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

describe("readStepParam", () => {
  it("дістає невід'ємне ціле з ?step=", () => {
    expect(readStepParam("#linear-search/playback?g=x&step=5")).toBe(5)
    expect(readStepParam("#linear-search/playback?step=0")).toBe(0)
  })

  it("null без параметра/без query", () => {
    expect(readStepParam("#linear-search/playback?g=x")).toBeNull()
    expect(readStepParam("#linear-search/playback")).toBeNull()
    expect(readStepParam("")).toBeNull()
  })

  it("відкидає від'ємне/дробове/нечислове", () => {
    expect(readStepParam("#x/playback?step=-1")).toBeNull()
    expect(readStepParam("#x/playback?step=2.5")).toBeNull()
    expect(readStepParam("#x/playback?step=abc")).toBeNull()
  })
})

describe("readModeParam", () => {
  it("дістає непорожній mode", () => {
    expect(readModeParam("#binary-search/playback?g=x&mode=recursive")).toBe(
      "recursive",
    )
    expect(readModeParam("#x/playback?mode=first&step=3")).toBe("first")
  })

  it("null без параметра/порожнього значення/без query", () => {
    expect(readModeParam("#x/playback?g=z")).toBeNull()
    expect(readModeParam("#x/playback?mode=")).toBeNull()
    expect(readModeParam("#x/playback")).toBeNull()
  })
})
