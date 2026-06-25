import { describe, it, expect, vi, beforeEach } from "vitest"
import { buildEmbedSnippet } from "@/algorithms/shared/editor/use-embed-snippet"
import { useLangStore } from "@/store/lang-store"

describe("buildEmbedSnippet", () => {
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
    useLangStore.getState().setLang("ua")
  })

  it("будує валідний <iframe> із embed-src поточного роута", () => {
    const html = buildEmbedSnippet({
      route: "kruskal/playback",
      title: "Демо",
    })
    expect(html).toContain("<iframe")
    expect(html).toContain("</iframe>")
    expect(html).toContain(
      'src="https://example.com/kruskal-mst-visualizer/?embed=1&lang=ua#kruskal/playback"',
    )
    expect(html).toContain('title="Демо"')
    expect(html).toContain('loading="lazy"')
    expect(html).toContain('style="border:0"')
    expect(html).toContain('width="800"')
    expect(html).toContain('height="600"')
  })

  it("вшиває поточну мову у src", () => {
    useLangStore.getState().setLang("en")
    const html = buildEmbedSnippet({ route: "kruskal/learn", title: "Demo" })
    expect(html).toContain("&lang=en#kruskal/learn")
  })

  it("поважає кастомні розміри", () => {
    const html = buildEmbedSnippet({
      route: "kruskal/learn",
      title: "Demo",
      width: 480,
      height: 320,
    })
    expect(html).toContain('width="480"')
    expect(html).toContain('height="320"')
  })

  it("екранує лапки у заголовку (валідний HTML-атрибут)", () => {
    const html = buildEmbedSnippet({
      route: "kruskal/learn",
      title: 'Кра"скал',
      width: 1,
      height: 1,
    })
    expect(html).toContain('title="Кра&quot;скал"')
  })
})

describe("useEmbedSnippet (через DOM-виклик)", () => {
  beforeEach(() => {
    Object.defineProperty(window, "location", {
      value: {
        origin: "https://example.com",
        pathname: "/",
        search: "",
        hash: "",
      },
      writable: true,
      configurable: true,
    })
    useLangStore.getState().setLang("ua")
  })

  it("копіює сніпет у буфер і ростить тост", async () => {
    const { renderHook } = await import("@testing-library/react")
    const { useEmbedSnippet } = await import(
      "@/algorithms/shared/editor/use-embed-snippet"
    )
    const { useToastStore } = await import("@/store/toast-store")
    useToastStore.setState({ toasts: [] })

    const writeText = vi.fn((_text: string) => Promise.resolve())
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    })

    const { result } = renderHook(() =>
      useEmbedSnippet({ route: "kruskal/playback", title: "Демо" }),
    )
    result.current()

    expect(writeText).toHaveBeenCalledTimes(1)
    const arg = writeText.mock.calls[0]?.[0] ?? ""
    expect(arg).toContain("<iframe")
    expect(arg).toContain("?embed=1")

    await vi.waitFor(() =>
      expect(useToastStore.getState().toasts).toHaveLength(1),
    )
  })
})
