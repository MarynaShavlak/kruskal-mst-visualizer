import { describe, it, expect, beforeEach } from "vitest"
import { render } from "@testing-library/react"
import { PlaybackView } from "@/algorithms/linear-search/playback/PlaybackView"
import { useLinearSearchStore } from "@/store/linear-search-store"
import { linearSearchCodec } from "@/algorithms/linear-search/editor/linear-search-doc"
import { resetPlaybackDeeplinkGuard } from "@/algorithms/shared/playback/use-playback-deeplink"
import { useLangStore } from "@/store/lang-store"

function setHash(h: string): void {
  Object.defineProperty(window, "location", {
    value: {
      origin: "https://example.com",
      pathname: "/kruskal-mst-visualizer/",
      search: "",
      hash: h,
    },
    writable: true,
    configurable: true,
  })
}

describe("PlaybackView (лінійний пошук) — дип-лінк на крок", () => {
  beforeEach(() => {
    resetPlaybackDeeplinkGuard()
    useLangStore.getState().setLang("ua")
    useLinearSearchStore.getState().loadMain()
  })

  it("прехеш ?g=&mode=all&step=3 → документ із хеша + режим + стартовий індекс 4/N", () => {
    // Документ із хеша (масив [4,8,15,16,23], ціль 15) має перекрити дефолтний пресет.
    const g = linearSearchCodec.encodeHash({ values: [4, 8, 15, 16, 23], target: 15 })
    setHash(`#linear-search/playback?g=${g}&mode=all&step=3`)

    const { container, getByTitle } = render(<PlaybackView />)
    const text = container.textContent ?? ""

    // Курсор стартував на кроці 3 (індекс 0-based) → «4/…».
    expect(text).toMatch(/\b4\//)
    // Документ із хеша застосовано (значення масиву присутні в панелі).
    expect(text).toContain("23")
    // Кнопка «Поділитися кроком» доступна у контролах.
    expect(getByTitle("Поділитися цим кроком")).toBeTruthy()
  })

  it("без ?step= стартує на 1/N (кнопка share присутня)", () => {
    setHash("#linear-search/playback")
    const { container, getByTitle } = render(<PlaybackView />)
    const text = container.textContent ?? ""
    expect(text).toMatch(/\b1\//)
    expect(getByTitle("Поділитися цим кроком")).toBeTruthy()
  })
})
