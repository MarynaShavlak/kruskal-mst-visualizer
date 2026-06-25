import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, act } from "@testing-library/react"
import { useState } from "react"
import {
  usePlaybackDeeplink,
  resetPlaybackDeeplinkGuard,
} from "@/algorithms/shared/playback/use-playback-deeplink"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { useToastStore } from "@/store/toast-store"
import type { DocCodec } from "@/algorithms/shared/editor/doc-codec"

interface Doc {
  readonly values: readonly number[]
}

// Тривіальний кодек: hash === JSON, щоб тест не залежав від base64url.
const fakeCodec: DocCodec<Doc> = {
  toJSON: (d) => JSON.stringify(d),
  fromJSON: (s) => JSON.parse(s) as Doc,
  encodeHash: (d) => JSON.stringify(d),
  decodeHash: (s) => {
    try {
      return JSON.parse(s) as Doc
    } catch {
      return null
    }
  },
}

type Mode = "first" | "all"

/** Гарнес: usePlayer + usePlaybackDeeplink + керований ззовні frameCount. */
function Harness({
  frameCount,
  onLoadDoc,
  onShareReady,
}: {
  frameCount: number
  onLoadDoc: (d: Doc) => void
  onShareReady?: (share: () => void) => void
}) {
  const [mode, setMode] = useState<Mode>("first")
  const sig = `${mode}|${frameCount}`
  const player = usePlayer(frameCount, sig)
  const { shareStep } = usePlaybackDeeplink<Doc, Mode>({
    player,
    codec: fakeCodec,
    loadDoc: onLoadDoc,
    toDoc: () => ({ values: [9, 9] }),
    mode,
    setMode,
    modeKeys: ["first", "all"] as const,
    routePath: "fake/playback",
  })
  if (onShareReady) onShareReady(shareStep)
  return (
    <div>
      <span data-testid="index">{player.index}</span>
      <span data-testid="mode">{mode}</span>
    </div>
  )
}

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

describe("usePlaybackDeeplink", () => {
  beforeEach(() => {
    resetPlaybackDeeplinkGuard()
    useToastStore.setState({ toasts: [] })
  })

  it("декодує ?g= → loadDoc, застосовує ?mode=, перемотує на ?step= після готовності trace", () => {
    // readGraphParam розбирає query через URLSearchParams — '{', '}' тут безпечні.
    setHash('#fake/playback?g={"values":[1,2,3]}&step=4&mode=all')
    const loadDoc = vi.fn()

    const { getByTestId } = render(
      <Harness frameCount={8} onLoadDoc={loadDoc} />,
    )

    expect(loadDoc).toHaveBeenCalledWith({ values: [1, 2, 3] })
    // mode застосовано з ?mode=all.
    expect(getByTestId("mode").textContent).toBe("all")
    // step=4 у межах 8 кадрів (0..7) → курсор на 4.
    expect(getByTestId("index").textContent).toBe("4")
  })

  it("клампить ?step= понад останній кадр", () => {
    setHash('#fake/playback?g={"values":[1]}&step=99')
    const { getByTestId } = render(
      <Harness frameCount={3} onLoadDoc={() => undefined} />,
    )
    // 3 кадри → останній індекс 2.
    expect(getByTestId("index").textContent).toBe("2")
  })

  it("НЕ з'їдає крок на fallback-trace (frameCount===1): seek відбувається лише коли trace готовий", () => {
    setHash('#fake/playback?g={"values":[1]}&step=2')
    // Спершу рендеримо з frameCount=1 (порожній/завеликий вхід) — крок чекає.
    const { getByTestId, rerender } = render(
      <Harness frameCount={1} onLoadDoc={() => undefined} />,
    )
    expect(getByTestId("index").textContent).toBe("0")
    // Trace «дозрів» → frameCount стає реальним; курсор стрибає на крок.
    rerender(<Harness frameCount={5} onLoadDoc={() => undefined} />)
    expect(getByTestId("index").textContent).toBe("2")
  })

  it("ігнорує невалідний ?mode= (не зі списку modeKeys)", () => {
    setHash('#fake/playback?g={"values":[1]}&mode=bogus')
    const { getByTestId } = render(
      <Harness frameCount={4} onLoadDoc={() => undefined} />,
    )
    expect(getByTestId("mode").textContent).toBe("first")
  })

  it("shareStep збирає URL із pathname + кроку + режиму і копіює в буфер", async () => {
    setHash("#fake/playback")
    const writeText = vi.fn<(text: string) => Promise<void>>(() =>
      Promise.resolve(),
    )
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    })

    let share: (() => void) | null = null
    render(
      <Harness
        frameCount={5}
        onLoadDoc={() => undefined}
        onShareReady={(s) => {
          share = s
        }}
      />,
    )

    act(() => {
      share?.()
    })

    expect(writeText).toHaveBeenCalledTimes(1)
    const url = writeText.mock.calls[0]?.[0] ?? ""
    expect(url).toContain("https://example.com/kruskal-mst-visualizer/#fake/playback?")
    expect(url).toContain("step=0")
    expect(url).toContain("mode=first")
    // Адрес-бар теж оновлено.
    expect(window.location.hash).toContain("fake/playback?")
    expect(window.location.hash).toContain("step=0")

    await vi.waitFor(() =>
      expect(useToastStore.getState().toasts).toHaveLength(1),
    )
  })
})
