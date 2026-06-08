import { describe, it, expect } from "vitest"
import { initialPlayerState, makePlayerReducer } from "@/algorithms/kruskal/playback/player"

const r = makePlayerReducer(5) // індекси 0..4

describe("player reducer", () => {
  it("next інкрементує; на останньому зупиняє відтворення", () => {
    expect(r({ index: 0, isPlaying: true, speedMs: 100 }, { type: "next" }).index).toBe(1)
    const end = r({ index: 4, isPlaying: true, speedMs: 100 }, { type: "next" })
    expect(end.index).toBe(4)
    expect(end.isPlaying).toBe(false)
  })

  it("prev декрементує й паузить, не нижче 0", () => {
    expect(r({ index: 3, isPlaying: false, speedMs: 100 }, { type: "prev" }).index).toBe(2)
    expect(r({ index: 0, isPlaying: false, speedMs: 100 }, { type: "prev" }).index).toBe(0)
  })

  it("seek кламп у межі [0, last]", () => {
    expect(r(initialPlayerState(), { type: "seek", index: 99 }).index).toBe(4)
    expect(r(initialPlayerState(), { type: "seek", index: -3 }).index).toBe(0)
  })

  it("play/toggle з кінця починає з нуля", () => {
    expect(r({ index: 4, isPlaying: false, speedMs: 100 }, { type: "play" })).toMatchObject({
      index: 0,
      isPlaying: true,
    })
    expect(r({ index: 4, isPlaying: false, speedMs: 100 }, { type: "toggle" }).index).toBe(0)
  })

  it("reset і setSpeed", () => {
    expect(
      r({ index: 3, isPlaying: true, speedMs: 100 }, { type: "reset" }),
    ).toMatchObject({ index: 0, isPlaying: false })
    expect(r(initialPlayerState(), { type: "setSpeed", speedMs: 250 }).speedMs).toBe(250)
  })
})
