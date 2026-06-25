import { describe, it, expect, vi, afterEach, beforeEach } from "vitest"
import { render, cleanup, fireEvent, screen } from "@testing-library/react"
import { PredictOverlay } from "@/algorithms/shared/playback/PredictOverlay"
import { usePredict } from "@/algorithms/shared/playback/use-predict"
import type { PredictQuestion } from "@/algorithms/shared/playback/predict"
import type { Player } from "@/algorithms/shared/playback/use-player"
import { usePredictStore } from "@/store/predict-store"
import { messages } from "@/i18n/messages"

const QUESTION: PredictQuestion = {
  promptKey: "play.predictLinPrompt",
  options: [
    { id: "match", labelKey: "play.predictLinMatch" },
    { id: "reject", labelKey: "play.predictLinReject" },
  ],
  correctId: "reject",
}

function fakePlayer(): Player {
  return { index: 0, isPlaying: false, speedMs: 800, frameCount: 8, dispatch: vi.fn() }
}

// Хост: реальний usePredict + оверлей (як у view).
function Host({ question }: { question: PredictQuestion | null }) {
  const controller = usePredict(fakePlayer(), question)
  return <PredictOverlay controller={controller} />
}

const ua = messages.ua

beforeEach(() => usePredictStore.getState().setEnabled(true))
afterEach(() => {
  cleanup()
  usePredictStore.getState().setEnabled(false)
})

describe("PredictOverlay", () => {
  it("показує промпт і всі варіанти", () => {
    render(<Host question={QUESTION} />)
    expect(screen.getByText(ua["play.predictLinPrompt"])).toBeTruthy()
    expect(screen.getByText(ua["play.predictLinMatch"])).toBeTruthy()
    expect(screen.getByText(ua["play.predictLinReject"])).toBeTruthy()
  })

  it("клік по ПРАВИЛЬНОМУ варіанті → вердикт «правильно»", () => {
    render(<Host question={QUESTION} />)
    fireEvent.click(screen.getByText(ua["play.predictLinReject"]))
    expect(screen.getByText(ua["play.predictRight"])).toBeTruthy()
  })

  it("клік по ХИБНОМУ варіанті → вердикт «не вгадано»", () => {
    render(<Host question={QUESTION} />)
    fireEvent.click(screen.getByText(ua["play.predictLinMatch"]))
    expect(screen.getByText(ua["play.predictWrong"])).toBeTruthy()
  })

  it("кнопка «Ще раз» прибирає вердикт", () => {
    render(<Host question={QUESTION} />)
    fireEvent.click(screen.getByText(ua["play.predictLinMatch"]))
    expect(screen.queryByText(ua["play.predictWrong"])).toBeTruthy()
    fireEvent.click(screen.getByText(ua["play.predictReset"]))
    expect(screen.queryByText(ua["play.predictWrong"])).toBeNull()
  })

  it("question=null → нічого не рендерить", () => {
    const { container } = render(<Host question={null} />)
    expect(container.textContent).toBe("")
  })
})
