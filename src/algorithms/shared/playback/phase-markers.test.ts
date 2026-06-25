import { describe, it, expect } from "vitest"
import { computePhaseMarkers } from "@/algorithms/shared/playback/phase-markers"
import type { PhaseStyle } from "@/algorithms/shared/playback/PhaseBadge"

interface F {
  readonly phase: string
}
const f = (phase: string): F => ({ phase })
const getPhase = (x: F): string => x.phase

describe("computePhaseMarkers — індекси входу у відмінну фазу", () => {
  it("0/1-кадрові trace → [] (guard last<=0, без /0/NaN)", () => {
    expect(computePhaseMarkers([], getPhase)).toEqual([])
    expect(computePhaseMarkers([f("init")], getPhase)).toEqual([])
  })

  it("одна межа init→search (кадр 0 не засікаємо)", () => {
    const frames = [f("init"), f("search"), f("search"), f("done")]
    const markers = computePhaseMarkers(frames, getPhase)
    expect(markers.map((m) => m.index)).toEqual([1, 3])
    expect(markers.map((m) => m.phase)).toEqual(["search", "done"])
  })

  it("засікаємо лише ВХОДИ у фазу, не кожен однаковий кадр", () => {
    const frames = [f("a"), f("a"), f("b"), f("b"), f("a")]
    const markers = computePhaseMarkers(frames, getPhase)
    // index 2 (a→b) і index 4 (b→a); index 1 і 3 — без зміни.
    expect(markers.map((m) => m.index)).toEqual([2, 4])
  })

  it("leftPct = index / last * 100", () => {
    const frames = [f("a"), f("b"), f("c"), f("d"), f("e")]
    const markers = computePhaseMarkers(frames, getPhase)
    expect(markers.map((m) => m.leftPct)).toEqual([25, 50, 75, 100])
  })

  it("only-filter лишає засічки лише whitelisted-фаз", () => {
    const frames = [f("init"), f("lps"), f("search"), f("done")]
    const markers = computePhaseMarkers(frames, getPhase, undefined, { only: ["search"] })
    expect(markers.map((m) => m.phase)).toEqual(["search"])
    expect(markers.map((m) => m.index)).toEqual([2])
  })

  it("чергування щокадру → засікаємо кожен вхід (без only — заллє)", () => {
    const frames = [f("a"), f("b"), f("a"), f("b")]
    const markers = computePhaseMarkers(frames, getPhase)
    expect(markers.map((m) => m.index)).toEqual([1, 2, 3])
  })

  it("підтягує cls зі стилів за фазою", () => {
    const styles: Partial<Record<string, PhaseStyle>> = {
      search: { labelKey: "play.step", cls: "bg-rose-500" },
    }
    const frames = [f("init"), f("search")]
    const markers = computePhaseMarkers(frames, getPhase, styles)
    expect(markers[0].cls).toBe("bg-rose-500")
  })

  it("без стилів cls лишається undefined", () => {
    const frames = [f("init"), f("search")]
    const markers = computePhaseMarkers(frames, getPhase)
    expect(markers[0].cls).toBeUndefined()
  })
})
