import { describe, it, expect, vi, afterEach } from "vitest"
import { render, fireEvent, cleanup } from "@testing-library/react"
import { usePlayerHotkeys } from "@/algorithms/shared/playback/use-player-hotkeys"
import { SPEEDS } from "@/algorithms/shared/playback/speeds"
import type { Player } from "@/algorithms/shared/playback/use-player"
import type { PlayerAction } from "@/algorithms/shared/playback/player"

function fakePlayer(over: Partial<Player> = {}): Player {
  return {
    index: 0,
    isPlaying: false,
    speedMs: 800,
    frameCount: 7,
    dispatch: vi.fn(),
    ...over,
  }
}

// Тонкий хост: монтує лише хук, аби слухач навісився на window.
function Host({ player }: { player: Player }): null {
  usePlayerHotkeys(player)
  return null
}

afterEach(() => {
  cleanup()
})

describe("usePlayerHotkeys", () => {
  it("Space → toggle", () => {
    const dispatch = vi.fn<(a: PlayerAction) => void>()
    render(<Host player={fakePlayer({ dispatch })} />)
    fireEvent.keyDown(window, { code: "Space" })
    expect(dispatch).toHaveBeenCalledWith({ type: "toggle" })
  })

  it("ArrowRight → next, ArrowLeft → prev", () => {
    const dispatch = vi.fn<(a: PlayerAction) => void>()
    render(<Host player={fakePlayer({ dispatch })} />)
    fireEvent.keyDown(window, { code: "ArrowRight" })
    fireEvent.keyDown(window, { code: "ArrowLeft" })
    expect(dispatch).toHaveBeenCalledWith({ type: "next" })
    expect(dispatch).toHaveBeenCalledWith({ type: "prev" })
  })

  it("Home → reset, End → seek(frameCount-1)", () => {
    const dispatch = vi.fn<(a: PlayerAction) => void>()
    render(<Host player={fakePlayer({ dispatch, frameCount: 7 })} />)
    fireEvent.keyDown(window, { code: "Home" })
    fireEvent.keyDown(window, { code: "End" })
    expect(dispatch).toHaveBeenCalledWith({ type: "reset" })
    expect(dispatch).toHaveBeenCalledWith({ type: "seek", index: 6 })
  })

  it("Digit1/2/3 → setSpeed із SPEEDS", () => {
    const dispatch = vi.fn<(a: PlayerAction) => void>()
    render(<Host player={fakePlayer({ dispatch })} />)
    fireEvent.keyDown(window, { code: "Digit1" })
    fireEvent.keyDown(window, { code: "Digit2" })
    fireEvent.keyDown(window, { code: "Digit3" })
    expect(dispatch).toHaveBeenCalledWith({ type: "setSpeed", speedMs: SPEEDS[0].ms })
    expect(dispatch).toHaveBeenCalledWith({ type: "setSpeed", speedMs: SPEEDS[1].ms })
    expect(dispatch).toHaveBeenCalledWith({ type: "setSpeed", speedMs: SPEEDS[2].ms })
  })

  it("ігнорує клавіші, коли фокус у полі вводу", () => {
    const dispatch = vi.fn<(a: PlayerAction) => void>()
    const { container } = render(
      <>
        <Host player={fakePlayer({ dispatch })} />
        <input data-testid="field" />
      </>,
    )
    const input = container.querySelector("input")!
    input.focus()
    fireEvent.keyDown(input, { code: "Space" })
    fireEvent.keyDown(input, { code: "ArrowRight" })
    expect(dispatch).not.toHaveBeenCalled()
  })

  it("не реагує на модифіковані комбінації (Ctrl/Meta/Alt)", () => {
    const dispatch = vi.fn<(a: PlayerAction) => void>()
    render(<Host player={fakePlayer({ dispatch })} />)
    fireEvent.keyDown(window, { code: "Space", ctrlKey: true })
    fireEvent.keyDown(window, { code: "ArrowRight", metaKey: true })
    expect(dispatch).not.toHaveBeenCalled()
  })

  it("знімає слухач при анмонті", () => {
    const dispatch = vi.fn<(a: PlayerAction) => void>()
    const { unmount } = render(<Host player={fakePlayer({ dispatch })} />)
    unmount()
    fireEvent.keyDown(window, { code: "Space" })
    expect(dispatch).not.toHaveBeenCalled()
  })
})
