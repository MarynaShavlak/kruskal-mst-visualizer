import { describe, expect, it } from "vitest"
import {
  textRole,
  patternRole,
  pointerIndex,
  type KmpCellState,
} from "@/algorithms/kmp-string-search/playback/highlight"

// Пошук «ABABCABAB» у тексті: offset=10, j=4 уже звірено, поточне порівняння на i=14 —
// розбіжність (kind=compare, match=false), pattern довжини 9.
const mismatch: KmpCellState = {
  offset: 10, i: 14, j: 4, kind: "compare", match: false, patternLen: 9,
}

describe("patternRole (фаза пошуку)", () => {
  it("звірений префікс → match; позиція розбіжності → mismatch; решта → window", () => {
    expect(patternRole(0, mismatch)).toBe("match")
    expect(patternRole(3, mismatch)).toBe("match")
    expect(patternRole(4, mismatch)).toBe("mismatch")
    expect(patternRole(5, mismatch)).toBe("window")
  })

  it("поточне порівняння-збіг → active", () => {
    const m: KmpCellState = { offset: 4, i: 6, j: 2, kind: "compare", match: true, patternLen: 3 }
    expect(patternRole(2, m)).toBe("active")
  })

  it("match_found → усі match", () => {
    const full: KmpCellState = { offset: 10, i: 19, j: 9, kind: "match_found", match: null, patternLen: 9 }
    expect(patternRole(0, full)).toBe("match")
    expect(patternRole(8, full)).toBe("match")
  })
})

describe("textRole (фаза пошуку)", () => {
  it("поза вікном вирівнювання → idle", () => {
    expect(textRole(9, mismatch)).toBe("idle") // ліворуч від offset 10
    expect(textRole(10 + 9, mismatch)).toBe("idle") // праворуч від вікна
  })

  it("усередині вікна — як у шаблоні (зсув на offset)", () => {
    expect(textRole(10, mismatch)).toBe("match") // pj=0
    expect(textRole(14, mismatch)).toBe("mismatch") // pj=4 (поточна розбіжність)
    expect(textRole(15, mismatch)).toBe("window") // pj=5
  })

  it("init → усе idle", () => {
    const init: KmpCellState = { offset: 0, i: 0, j: 0, kind: "init", match: null, patternLen: 9 }
    expect(textRole(0, init)).toBe("idle")
  })
})

describe("pointerIndex (фаза пошуку)", () => {
  it("на compare курсор стоїть на text[i]", () => {
    expect(pointerIndex(mismatch)).toBe(14)
  })

  it("на init / shift немає курсора", () => {
    expect(pointerIndex({ offset: 0, i: 0, j: 0, kind: "init", match: null, patternLen: 9 })).toBeNull()
    expect(pointerIndex({ offset: 2, i: 4, j: 2, kind: "shift", match: null, patternLen: 9 })).toBeNull()
  })
})
