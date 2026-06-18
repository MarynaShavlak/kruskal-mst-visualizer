import { describe, it, expect } from "vitest"
import { cellRole } from "@/algorithms/linear-search/playback/highlight"

describe("cellRole — роль комірки лінійного пошуку", () => {
  it("init: жоден не перевірено → усі pending", () => {
    const s = { cursor: null, checking: false, matches: [], resolvedTo: -1 }
    expect([0, 1, 2].map((i) => cellRole(i, s))).toEqual(["pending", "pending", "pending"])
  })

  it("інтрига на індексі 2: <2 rejected, 2 checking, >2 pending", () => {
    const s = { cursor: 2, checking: true, matches: [], resolvedTo: 1 }
    expect(cellRole(0, s)).toBe("rejected")
    expect(cellRole(1, s)).toBe("rejected")
    expect(cellRole(2, s)).toBe("checking")
    expect(cellRole(3, s)).toBe("pending")
  })

  it("розв'язок-збіг: комірка-збіг зелена навіть під курсором", () => {
    const s = { cursor: 2, checking: false, matches: [2], resolvedTo: 2 }
    expect(cellRole(2, s)).toBe("match")
    expect(cellRole(1, s)).toBe("rejected")
    expect(cellRole(3, s)).toBe("pending")
  })

  it("розв'язок-відкидання: курсор-комірка стає rejected (не checking)", () => {
    const s = { cursor: 1, checking: false, matches: [], resolvedTo: 1 }
    expect(cellRole(1, s)).toBe("rejected")
  })

  it("усі входження: кілька зелених збігів, решта rejected", () => {
    const s = { cursor: 1, checking: false, matches: [1, 3, 5], resolvedTo: 5 }
    expect([0, 1, 2, 3, 4, 5].map((i) => cellRole(i, s))).toEqual([
      "rejected",
      "match",
      "rejected",
      "match",
      "rejected",
      "match",
    ])
  })

  it("відсутній (done): усі rejected, жодного збігу", () => {
    const s = { cursor: null, checking: false, matches: [], resolvedTo: 4 }
    expect([0, 1, 2, 3, 4].map((i) => cellRole(i, s))).toEqual([
      "rejected",
      "rejected",
      "rejected",
      "rejected",
      "rejected",
    ])
  })
})
