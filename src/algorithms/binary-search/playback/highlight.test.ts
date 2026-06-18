import { describe, it, expect } from "vitest"
import { cellRole } from "@/algorithms/binary-search/playback/highlight"

const base = {
  low: 0,
  high: 10,
  mid: null as number | null,
  probing: false,
  discardLo: null as number | null,
  discardHi: null as number | null,
  result: -1,
  resolved: false,
}

describe("cellRole — роль комірки двійкового пошуку", () => {
  it("init: усе вікно активне (🟦)", () => {
    expect([0, 5, 10].map((i) => cellRole(i, base))).toEqual(["active", "active", "active"])
  })

  it("проба: mid рожевий, решта вікна активна, поза вікном тьмяно", () => {
    const s = { ...base, low: 0, high: 10, mid: 5, probing: true }
    expect(cellRole(5, s)).toBe("mid")
    expect(cellRole(3, s)).toBe("active")
    expect(cellRole(10, s)).toBe("active")
  })

  it("відкидання лівої половини: [0..5] червоні ✗, нове вікно [6..10] активне", () => {
    const s = { ...base, low: 6, high: 10, mid: 5, discardLo: 0, discardHi: 5 }
    expect([0, 3, 5].map((i) => cellRole(i, s))).toEqual(["discarding", "discarding", "discarding"])
    expect([6, 8, 10].map((i) => cellRole(i, s))).toEqual(["active", "active", "active"])
  })

  it("відкидання правої половини: [8..10] червоні, вікно [6..7] активне", () => {
    const s = { ...base, low: 6, high: 7, mid: 8, discardLo: 8, discardHi: 10 }
    expect(cellRole(8, s)).toBe("discarding")
    expect(cellRole(6, s)).toBe("active")
    // вже відкинута раніше ліва половина — поза вікном
    expect(cellRole(0, s)).toBe("out")
  })

  it("знайдено: комірка-результат зелена ✓ навіть поверх вікна", () => {
    const s = { ...base, low: 6, high: 7, mid: 6, result: 6, resolved: true }
    expect(cellRole(6, s)).toBe("found")
    expect(cellRole(7, s)).toBe("active")
    expect(cellRole(0, s)).toBe("out")
  })

  it("відсутній (done): вікно схрестилось — усе поза вікном, без збігу", () => {
    const s = { ...base, low: 5, high: 4, mid: null, result: -1, resolved: true }
    expect([0, 4, 5, 10].map((i) => cellRole(i, s))).toEqual(["out", "out", "out", "out"])
  })
})
