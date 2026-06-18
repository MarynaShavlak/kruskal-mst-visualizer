import { describe, it, expect } from "vitest"
import { cellRole } from "@/algorithms/interpolation-search/playback/highlight"

const base = {
  low: 0,
  high: 10,
  index: null as number | null,
  probing: false,
  discardLo: null as number | null,
  discardHi: null as number | null,
  result: -1,
  resolved: false,
}

describe("cellRole — роль комірки інтерполяційного пошуку", () => {
  it("init: усе вікно активне (🟦)", () => {
    expect([0, 5, 10].map((i) => cellRole(i, base))).toEqual(["active", "active", "active"])
  })

  it("проба: інтерпольований index рожевий (НЕ обов'язково середина)", () => {
    // index = 0 (на скупчених даних формула вказує на початок) — теж рожевий.
    const s = { ...base, low: 0, high: 10, index: 0, probing: true }
    expect(cellRole(0, s)).toBe("probe")
    expect(cellRole(3, s)).toBe("active")
    expect(cellRole(10, s)).toBe("active")
  })

  it("відкидання лівої частини: [0..index] червоні ✗, нове вікно активне", () => {
    const s = { ...base, low: 8, high: 10, index: 7, discardLo: 0, discardHi: 7 }
    expect([0, 4, 7].map((i) => cellRole(i, s))).toEqual(["discarding", "discarding", "discarding"])
    expect([8, 9, 10].map((i) => cellRole(i, s))).toEqual(["active", "active", "active"])
  })

  it("відкидання правої частини: [index..10] червоні, вікно [0..index-1] активне", () => {
    const s = { ...base, low: 0, high: 1, index: 2, discardLo: 2, discardHi: 10 }
    expect(cellRole(2, s)).toBe("discarding")
    expect(cellRole(0, s)).toBe("active")
    expect(cellRole(10, s)).toBe("discarding")
  })

  it("знайдено: комірка-результат зелена ✓ навіть поверх вікна", () => {
    const s = { ...base, low: 6, high: 7, index: 6, result: 6, resolved: true }
    expect(cellRole(6, s)).toBe("found")
    expect(cellRole(7, s)).toBe("active")
    expect(cellRole(0, s)).toBe("out")
  })

  it("відсутній (done): вікно схрестилось — усе поза вікном, без збігу", () => {
    const s = { ...base, low: 5, high: 4, index: null, result: -1, resolved: true }
    expect([0, 4, 5, 10].map((i) => cellRole(i, s))).toEqual(["out", "out", "out", "out"])
  })
})
