import { describe, expect, it } from "vitest"
import {
  textRole,
  patternRole,
  pointerIndex,
  hashesEqual,
  type RkCellState,
} from "@/algorithms/rabin-karp-string-search/playback/highlight"

// Вікно на зміщенні 6 завдовжки 9: КОЛІЗІЯ — збіглося 2 символи, розбіжність на j=2.
const collision: RkCellState = { offset: 6, patternLen: 9, verdict: "collision", matched: 2, mismatchJ: 2 }
// Вікно ковзає: хеші різні, символи ще не звіряли → усе window.
const slide: RkCellState = { offset: 0, patternLen: 9, verdict: "slide", matched: 0, mismatchJ: null }
// Повний збіг.
const match: RkCellState = { offset: 8, patternLen: 9, verdict: "match", matched: 9, mismatchJ: null }

describe("patternRole", () => {
  it("slide (порівнюємо лише хеші) → усе window", () => {
    expect(patternRole(0, slide)).toBe("window")
    expect(patternRole(8, slide)).toBe("window")
  })

  it("collision → зелений префікс + червона розбіжність", () => {
    expect(patternRole(0, collision)).toBe("match")
    expect(patternRole(1, collision)).toBe("match")
    expect(patternRole(2, collision)).toBe("mismatch")
    expect(patternRole(3, collision)).toBe("window")
  })

  it("match → усе match", () => {
    expect(patternRole(0, match)).toBe("match")
    expect(patternRole(8, match)).toBe("match")
  })
})

describe("textRole", () => {
  it("поза вікном → idle", () => {
    expect(textRole(5, collision)).toBe("idle")
    expect(textRole(6 + 9, collision)).toBe("idle")
  })

  it("усередині вікна — як у шаблоні (зсув на offset)", () => {
    expect(textRole(6, collision)).toBe("match") // j=0
    expect(textRole(8, collision)).toBe("mismatch") // j=2
    expect(textRole(9, collision)).toBe("window") // j=3
  })

  it("offset -1 → усе idle", () => {
    const init: RkCellState = { offset: -1, patternLen: 9, verdict: null, matched: 0, mismatchJ: null }
    expect(textRole(0, init)).toBe("idle")
  })
})

describe("pointerIndex", () => {
  it("курсор на позиції розбіжності колізії (offset + mismatchJ)", () => {
    expect(pointerIndex(collision)).toBe(8)
  })

  it("slide / match → немає курсора", () => {
    expect(pointerIndex(slide)).toBeNull()
    expect(pointerIndex(match)).toBeNull()
  })
})

describe("hashesEqual", () => {
  it("рівні хеші → true (кандидат/колізія)", () => {
    expect(hashesEqual(35, 35)).toBe(true)
    expect(hashesEqual(37, 35)).toBe(false)
  })
})
