import { describe, expect, it } from "vitest"
import {
  textRole,
  patternRole,
  pointerIndex,
  type BmCellState,
} from "@/algorithms/boyer-moore-string-search/playback/highlight"

// Вікно i=8 шаблону довжини 9: збіглий суфікс 3 (j=8,7,6 — праворуч), поточне j=5 — збіг.
const matchState: BmCellState = {
  offset: 8, j: 5, matchedSuffix: 4, mismatch: false, full: false, patternLen: 9, skipped: new Set(),
}

// Вікно i=0: розбіжність на j=8 (поганий символ), суфікс ще 0.
const missState: BmCellState = {
  offset: 0, j: 8, matchedSuffix: 0, mismatch: true, full: false, patternLen: 9,
  skipped: new Set(),
}

describe("patternRole — суфікс росте справа наліво", () => {
  it("збіжний суфікс [m-matchedSuffix .. m-1] → match", () => {
    expect(patternRole(8, matchState)).toBe("match") // у суфіксі
    expect(patternRole(5, matchState)).toBe("match") // поточне j (matchedSuffix=4 → [5..8])
    expect(patternRole(4, matchState)).toBe("window") // ще не звірено
  })

  it("поганий символ на j → mismatch; повний збіг → усі match", () => {
    expect(patternRole(8, missState)).toBe("mismatch")
    expect(patternRole(7, missState)).toBe("window")
    const full: BmCellState = { ...matchState, full: true }
    expect(patternRole(0, full)).toBe("match")
    expect(patternRole(8, full)).toBe("match")
  })
})

describe("textRole", () => {
  it("усередині вікна — як у шаблоні (зсув на offset)", () => {
    expect(textRole(8 + 5, matchState)).toBe("match") // j=5
    expect(textRole(8 + 4, matchState)).toBe("window") // j=4
  })

  it("пропущені стрибком → skipped", () => {
    const s: BmCellState = { ...missState, offset: 8, skipped: new Set([0, 1, 2, 3, 4, 5, 6, 7]) }
    expect(textRole(0, s)).toBe("skipped")
    expect(textRole(7, s)).toBe("skipped")
  })

  it("поза вікном і не пропущені → idle; offset -1 → усе idle", () => {
    expect(textRole(0, matchState)).toBe("idle")
    expect(textRole(99, matchState)).toBe("idle")
    const init: BmCellState = { ...matchState, offset: -1 }
    expect(textRole(5, init)).toBe("idle")
  })
})

describe("pointerIndex", () => {
  it("курсор на поточній позиції j у тексті (offset + j)", () => {
    expect(pointerIndex(matchState)).toBe(13)
    expect(pointerIndex(missState)).toBe(8)
  })

  it("повний збіг (j<0) / немає вікна → немає курсора", () => {
    expect(pointerIndex({ ...matchState, j: -1 })).toBeNull()
    expect(pointerIndex({ ...matchState, offset: -1 })).toBeNull()
  })
})
