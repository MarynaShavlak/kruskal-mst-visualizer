import { describe, it, expect } from "vitest"
import { chipRole, digitParts } from "@/algorithms/radix-sort/playback/highlight"

describe("chipRole", () => {
  it("зібраний масив → усі gathered", () => {
    expect(chipRole(0, { activeIndex: null, gathered: true })).toBe("gathered")
    expect(chipRole(5, { activeIndex: 2, gathered: true })).toBe("gathered")
  })

  it("активна фішка falling; раніші — placed; пізніші — idle", () => {
    const s = { activeIndex: 3, gathered: false }
    expect(chipRole(3, s)).toBe("falling")
    expect(chipRole(1, s)).toBe("placed")
    expect(chipRole(5, s)).toBe("idle")
  })

  it("без активної фішки (init/pass) — усі idle", () => {
    expect(chipRole(0, { activeIndex: null, gathered: false })).toBe("idle")
  })
})

describe("digitParts", () => {
  it("доповнює нулями зліва й підсвічує цифру розряду", () => {
    const parts = digitParts(3, 3, 0) // 003, розряд одиниць
    expect(parts.map((p) => p.char).join("")).toBe("003")
    expect(parts.map((p) => p.pad)).toEqual([true, true, false])
    expect(parts.map((p) => p.active)).toEqual([false, false, true])
  })

  it("розряд десятків підсвічує середню цифру", () => {
    const parts = digitParts(254, 3, 1)
    expect(parts.map((p) => p.active)).toEqual([false, true, false])
    expect(parts.every((p) => !p.pad)).toBe(true)
  })

  it("activeDigit = null — без підсвітки", () => {
    const parts = digitParts(89, 3, null)
    expect(parts.some((p) => p.active)).toBe(false)
    expect(parts.map((p) => p.pad)).toEqual([true, false, false])
  })
})
