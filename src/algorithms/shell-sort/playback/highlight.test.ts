import { describe, it, expect } from "vitest"
import {
  shellBarRole,
  inCurrentGroup,
  barHeightPct,
  type ShellBarState,
} from "@/algorithms/shell-sort/playback/highlight"

const base: ShellBarState = {
  hole: null, compareAt: null, shiftAt: null, insertAt: null, sortedAll: false,
}

describe("shellBarRole", () => {
  it("«дірка» має найвищий пріоритет", () => {
    expect(shellBarRole(2, { ...base, hole: 2, compareAt: 2 })).toBe("hole")
  })

  it("sortedAll → усі sorted (крім дірки)", () => {
    expect(shellBarRole(0, { ...base, sortedAll: true })).toBe("sorted")
  })

  it("розрізняє shift / compare / insert / idle", () => {
    expect(shellBarRole(3, { ...base, shiftAt: 3 })).toBe("shift")
    expect(shellBarRole(1, { ...base, compareAt: 1 })).toBe("compare")
    expect(shellBarRole(4, { ...base, insertAt: 4 })).toBe("insert")
    expect(shellBarRole(7, base)).toBe("idle")
  })
})

describe("inCurrentGroup", () => {
  it("елементи з кроком gap і тим самим залишком — в одній групі", () => {
    // gap=4, residue=0 → індекси 0,4 (для n=8)
    expect(inCurrentGroup(0, 4, 0)).toBe(true)
    expect(inCurrentGroup(4, 4, 0)).toBe(true)
    expect(inCurrentGroup(1, 4, 0)).toBe(false)
    expect(inCurrentGroup(2, 4, 0)).toBe(false)
  })

  it("residue < 0 або gap null → нічого не підсвічуємо", () => {
    expect(inCurrentGroup(0, 4, -1)).toBe(false)
    expect(inCurrentGroup(0, null, 0)).toBe(false)
  })
})

describe("barHeightPct", () => {
  it("масштабує з мінімумом", () => {
    expect(barHeightPct(8, 8)).toBe(100)
    expect(barHeightPct(0, 8)).toBe(8)
    expect(barHeightPct(4, 0)).toBe(8)
  })
})
