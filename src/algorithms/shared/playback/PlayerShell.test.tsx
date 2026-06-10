import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import type { Player } from "@/algorithms/shared/playback/use-player"

function fakePlayer(over: Partial<Player> = {}): Player {
  return {
    index: 0,
    isPlaying: false,
    speedMs: 800,
    frameCount: 5,
    dispatch: () => {},
    ...over,
  }
}

describe("PlayerShell", () => {
  it("рендерить нарацію «Крок i/n», контроли, панелі та другий рядок", () => {
    render(
      <PlayerShell
        player={fakePlayer({ index: 2, frameCount: 7 })}
        caption="розгляд ребра"
        panels={<div>панелі</div>}
        secondRow={<div>другий-рядок</div>}
      />,
    )

    expect(screen.getByText(/Крок 3\/7/)).toBeInTheDocument()
    expect(screen.getByText("розгляд ребра")).toBeInTheDocument()
    expect(screen.getByText("панелі")).toBeInTheDocument()
    expect(screen.getByText("другий-рядок")).toBeInTheDocument()
    expect(screen.getByTitle("Грати")).toBeInTheDocument()
  })

  it("без secondRow не рендерить другу сітку", () => {
    render(
      <PlayerShell
        player={fakePlayer()}
        caption="старт"
        panels={<div>панелі</div>}
      />,
    )
    expect(screen.getByText(/Крок 1\/5/)).toBeInTheDocument()
    expect(screen.queryByText("другий-рядок")).not.toBeInTheDocument()
  })
})
