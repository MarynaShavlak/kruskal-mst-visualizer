import { describe, it, expect, vi, afterEach, beforeEach } from "vitest"
import { render, cleanup, act } from "@testing-library/react"
import { usePredict, type PredictController } from "@/algorithms/shared/playback/use-predict"
import type { PredictQuestion } from "@/algorithms/shared/playback/predict"
import type { Player } from "@/algorithms/shared/playback/use-player"
import type { PlayerAction } from "@/algorithms/shared/playback/player"
import { usePredictStore } from "@/store/predict-store"

const QUESTION: PredictQuestion = {
  promptKey: "play.predictLinPrompt",
  options: [
    { id: "match", labelKey: "play.predictLinMatch" },
    { id: "reject", labelKey: "play.predictLinReject" },
  ],
  correctId: "reject",
}

function fakePlayer(over: Partial<Player> = {}): Player {
  return {
    index: 0,
    isPlaying: false,
    speedMs: 800,
    frameCount: 8,
    dispatch: vi.fn(),
    ...over,
  }
}

let captured: PredictController | null = null
function Host({
  player,
  question,
}: {
  player: Player
  question: PredictQuestion | null
}): null {
  captured = usePredict(player, question)
  return null
}

beforeEach(() => {
  usePredictStore.getState().setEnabled(true)
  captured = null
})

afterEach(() => {
  cleanup()
  usePredictStore.getState().setEnabled(false)
})

describe("usePredict — автопауза на інтризі", () => {
  it("коли увімкнено, є питання й плеєр ГРАЄ → синхронно pause", () => {
    const dispatch = vi.fn<(a: PlayerAction) => void>()
    render(<Host player={fakePlayer({ dispatch, isPlaying: true })} question={QUESTION} />)
    expect(dispatch).toHaveBeenCalledWith({ type: "pause" })
  })

  it("плеєр НЕ грає → без паузи", () => {
    const dispatch = vi.fn<(a: PlayerAction) => void>()
    render(<Host player={fakePlayer({ dispatch, isPlaying: false })} question={QUESTION} />)
    expect(dispatch).not.toHaveBeenCalled()
  })

  it("null-question → без паузи (кадр не інтрига)", () => {
    const dispatch = vi.fn<(a: PlayerAction) => void>()
    render(<Host player={fakePlayer({ dispatch, isPlaying: true })} question={null} />)
    expect(dispatch).not.toHaveBeenCalled()
  })

  it("тумблер вимкнено → без паузи й без питання", () => {
    usePredictStore.getState().setEnabled(false)
    const dispatch = vi.fn<(a: PlayerAction) => void>()
    render(<Host player={fakePlayer({ dispatch, isPlaying: true })} question={QUESTION} />)
    expect(dispatch).not.toHaveBeenCalled()
    expect(captured!.question).toBeNull()
  })
})

describe("usePredict — відповідь і коректність", () => {
  it("isCorrect=false для хибного, true для правильного; revealed", () => {
    render(<Host player={fakePlayer()} question={QUESTION} />)
    expect(captured!.isCorrect).toBeNull()
    expect(captured!.revealed).toBe(false)

    act(() => captured!.pick("match")) // хибний (correctId=reject)
    expect(captured!.answeredId).toBe("match")
    expect(captured!.isCorrect).toBe(false)
    expect(captured!.revealed).toBe(true)

    act(() => captured!.pick("reject")) // правильний
    expect(captured!.isCorrect).toBe(true)

    act(() => captured!.reset())
    expect(captured!.answeredId).toBeNull()
    expect(captured!.revealed).toBe(false)
  })
})

describe("usePredict — прив'язка відповіді до index", () => {
  it("зміна player.index скидає обраний варіант", () => {
    let player = fakePlayer({ index: 1 })
    const { rerender } = render(<Host player={player} question={QUESTION} />)
    act(() => captured!.pick("reject"))
    expect(captured!.answeredId).toBe("reject")

    // Перехід на інший кадр → відповідь уже не дійсна.
    player = fakePlayer({ index: 2 })
    rerender(<Host player={player} question={QUESTION} />)
    expect(captured!.answeredId).toBeNull()
    expect(captured!.revealed).toBe(false)
  })
})
