import { describe, expect, it } from "vitest"
import {
  textRole,
  patternRole,
  pointerIndex,
  type NssCellState,
} from "@/algorithms/naive-string-search/playback/highlight"

// Вирівнювання i=5 шаблону довжини 9: збіглося 3 символи, розбіжність на j=3.
const mismatchState: NssCellState = { offset: 5, matched: 3, mismatchJ: 3, patternLen: 9 }

describe("patternRole", () => {
  it("збіглий префікс → match, позиція розбіжності → mismatch, решта → window", () => {
    expect(patternRole(0, mismatchState)).toBe("match")
    expect(patternRole(2, mismatchState)).toBe("match")
    expect(patternRole(3, mismatchState)).toBe("mismatch")
    expect(patternRole(4, mismatchState)).toBe("window")
  })

  it("повний збіг (matched=patternLen) → усі match", () => {
    const full: NssCellState = { offset: 10, matched: 9, mismatchJ: null, patternLen: 9 }
    expect(patternRole(0, full)).toBe("match")
    expect(patternRole(8, full)).toBe("match")
  })
})

describe("textRole", () => {
  it("поза вікном вирівнювання → idle", () => {
    expect(textRole(4, mismatchState)).toBe("idle") // ліворуч від offset
    expect(textRole(5 + 9, mismatchState)).toBe("idle") // праворуч від вікна
  })

  it("усередині вікна — як у шаблоні (зсув на offset)", () => {
    expect(textRole(5, mismatchState)).toBe("match") // j=0
    expect(textRole(8, mismatchState)).toBe("mismatch") // j=3
    expect(textRole(9, mismatchState)).toBe("window") // j=4
  })

  it("init (offset -1) → усе idle", () => {
    const init: NssCellState = { offset: -1, matched: 0, mismatchJ: null, patternLen: 9 }
    expect(textRole(0, init)).toBe("idle")
    expect(textRole(5, init)).toBe("idle")
  })
})

describe("pointerIndex", () => {
  it("курсор на позиції розбіжності в тексті (offset + mismatchJ)", () => {
    expect(pointerIndex(mismatchState)).toBe(8)
  })

  it("повний збіг / init → немає курсора", () => {
    expect(pointerIndex({ offset: 10, matched: 9, mismatchJ: null, patternLen: 9 })).toBeNull()
    expect(pointerIndex({ offset: -1, matched: 0, mismatchJ: null, patternLen: 9 })).toBeNull()
  })
})
