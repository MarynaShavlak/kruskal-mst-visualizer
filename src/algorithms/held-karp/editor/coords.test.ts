import { describe, it, expect } from "vitest"
import {
  CANVAS_PAD,
  CANVAS_SCALE,
  toCanvas,
  toMathSnapped,
} from "@/algorithms/held-karp/editor/coords"

describe("coords (math ↔ canvas)", () => {
  it("toCanvas масштабує й зсуває", () => {
    expect(toCanvas({ x: 0, y: 0 })).toEqual({ x: CANVAS_PAD, y: CANVAS_PAD })
    expect(toCanvas({ x: 5, y: 1 })).toEqual({
      x: 5 * CANVAS_SCALE + CANVAS_PAD,
      y: 1 * CANVAS_SCALE + CANVAS_PAD,
    })
  })

  it("toMathSnapped — обернене до toCanvas на цілій сітці", () => {
    for (const m of [{ x: 0, y: 0 }, { x: 3, y: 5 }, { x: 5, y: 1 }]) {
      expect(toMathSnapped(toCanvas(m))).toEqual(m)
    }
  })

  it("snap округляє довільні пікселі до найближчого цілого вузла", () => {
    // трохи лівіше/нижче від вузла (3,3) → все одно (3,3)
    const near = toCanvas({ x: 3, y: 3 })
    expect(toMathSnapped({ x: near.x + 12, y: near.y - 12 })).toEqual({ x: 3, y: 3 })
  })

  it("координати затискаються до невід'ємних", () => {
    expect(toMathSnapped({ x: -500, y: -500 })).toEqual({ x: 0, y: 0 })
  })
})
