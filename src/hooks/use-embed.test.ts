import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { parseEmbedSearch, buildEmbedUrl } from "@/hooks/use-embed"

describe("parseEmbedSearch", () => {
  it("без параметра embed → вимкнено", () => {
    expect(parseEmbedSearch("")).toEqual({ embed: false, lang: null })
    expect(parseEmbedSearch("?g=abc")).toEqual({ embed: false, lang: null })
  })

  it("?embed=1 → увімкнено", () => {
    expect(parseEmbedSearch("?embed=1")).toEqual({ embed: true, lang: null })
  })

  it("працює без ведучого '?'", () => {
    expect(parseEmbedSearch("embed=1")).toEqual({ embed: true, lang: null })
  })

  it("embed=0 / embed=false → вимкнено", () => {
    expect(parseEmbedSearch("?embed=0")).toEqual({ embed: false, lang: null })
    expect(parseEmbedSearch("?embed=false")).toEqual({
      embed: false,
      lang: null,
    })
    expect(parseEmbedSearch("?embed=FALSE")).toEqual({
      embed: false,
      lang: null,
    })
  })

  it("&lang=en додає override мови", () => {
    expect(parseEmbedSearch("?embed=1&lang=en")).toEqual({
      embed: true,
      lang: "en",
    })
    expect(parseEmbedSearch("?embed=1&lang=ua")).toEqual({
      embed: true,
      lang: "ua",
    })
  })

  it("невалідна мова → lang:null (embed лишається)", () => {
    expect(parseEmbedSearch("?embed=1&lang=de")).toEqual({
      embed: true,
      lang: null,
    })
  })

  it("lang без embed ігнорується", () => {
    expect(parseEmbedSearch("?lang=en")).toEqual({ embed: false, lang: null })
  })
})

describe("buildEmbedUrl", () => {
  const origPathname = window.location.pathname

  beforeEach(() => {
    Object.defineProperty(window, "location", {
      value: {
        origin: "https://example.com",
        pathname: "/kruskal-mst-visualizer/",
        search: "",
        hash: "",
      },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: { origin: "http://localhost", pathname: origPathname, hash: "" },
      writable: true,
      configurable: true,
    })
  })

  it("містить origin + pathname + ?embed=1 у query (перед #) і роут у hash", () => {
    const url = buildEmbedUrl("kruskal/playback")
    expect(url).toBe(
      "https://example.com/kruskal-mst-visualizer/?embed=1#kruskal/playback",
    )
    // ?embed=1 — у реальному query (перед '#'), роут — у hash (після '#').
    const hashAt = url.indexOf("#")
    expect(url.indexOf("?embed=1")).toBeLessThan(hashAt)
    expect(url.slice(hashAt)).toBe("#kruskal/playback")
  })

  it("додає &lang= коли вказано", () => {
    expect(buildEmbedUrl("kruskal/playback", { lang: "en" })).toBe(
      "https://example.com/kruskal-mst-visualizer/?embed=1&lang=en#kruskal/playback",
    )
  })

  it("зрізає ведучий '#' у роуті", () => {
    expect(buildEmbedUrl("#kruskal/learn")).toBe(
      "https://example.com/kruskal-mst-visualizer/?embed=1#kruskal/learn",
    )
  })

  it("зберігає власний ?g=… усередині hash-роута", () => {
    const url = buildEmbedUrl("kruskal/editor?g=ABC")
    expect(url).toBe(
      "https://example.com/kruskal-mst-visualizer/?embed=1#kruskal/editor?g=ABC",
    )
    // ?g=… лишається ПІСЛЯ '#' (у hash), а ?embed=1 — ДО '#'.
    expect(url.indexOf("?embed=1")).toBeLessThan(url.indexOf("#"))
    expect(url.indexOf("?g=ABC")).toBeGreaterThan(url.indexOf("#"))
  })
})
