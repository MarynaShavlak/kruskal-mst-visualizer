import { describe, it, expect, vi, afterEach } from "vitest"
import { render, cleanup, fireEvent, screen } from "@testing-library/react"
import { PlayerControls } from "@/algorithms/shared/playback/PlayerControls"
import type { Player } from "@/algorithms/shared/playback/use-player"
import type { LabeledPhaseMarker } from "@/algorithms/shared/playback/use-phase-markers"

function fakePlayer(over: Partial<Player> = {}): Player {
  return {
    index: 0,
    isPlaying: false,
    speedMs: 800,
    frameCount: 10,
    dispatch: vi.fn(),
    ...over,
  }
}

const MARKERS: LabeledPhaseMarker[] = [
  { index: 3, leftPct: 33.3, phase: "search", cls: "bg-rose-500", label: "Пошук" },
  { index: 6, leftPct: 66.6, phase: "done", cls: "bg-emerald-500", label: "Готово" },
]

afterEach(cleanup)

describe("PlayerControls — засічки фаз", () => {
  it("рендерить контроли під UA-дефолтом (title «Грати»)", () => {
    render(<PlayerControls player={fakePlayer()} />)
    expect(screen.getByTitle("Грати")).toBeInTheDocument()
  })

  it("без markers оверлея-засічок немає", () => {
    render(<PlayerControls player={fakePlayer()} />)
    expect(screen.queryByTitle(/Перейти до фази/)).toBeNull()
  })

  it("рендерить засічку на кожну фазу (за title)", () => {
    render(<PlayerControls player={fakePlayer()} markers={MARKERS} />)
    expect(screen.getByTitle("Перейти до фази: Пошук")).toBeInTheDocument()
    expect(screen.getByTitle("Перейти до фази: Готово")).toBeInTheDocument()
  })

  it("клік по засічці → dispatch({type:'seek',index})", () => {
    const player = fakePlayer()
    render(<PlayerControls player={player} markers={MARKERS} />)
    fireEvent.click(screen.getByTitle("Перейти до фази: Готово"))
    expect(player.dispatch).toHaveBeenCalledWith({ type: "seek", index: 6 })
  })

  it("порожній markers → оверлея немає", () => {
    render(<PlayerControls player={fakePlayer()} markers={[]} />)
    expect(screen.queryByTitle(/Перейти до фази/)).toBeNull()
  })
})
