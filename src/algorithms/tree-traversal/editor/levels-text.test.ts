import { describe, it, expect } from "vitest"
import { levelsToText, parseLevelsText } from "@/algorithms/tree-traversal/editor/levels-text"

describe("levels-text", () => {
  it("levelsToText: null → «-»", () => {
    expect(levelsToText([1, 2, null, 5])).toBe("1, 2, -, 5")
    expect(levelsToText([])).toBe("")
  })

  it("parseLevelsText: коми/пробіли, «-»/«x»/порожньо → null", () => {
    expect(parseLevelsText("1, 2, -, 5")).toEqual([1, 2, null, 5])
    expect(parseLevelsText("1 2 3")).toEqual([1, 2, 3])
    expect(parseLevelsText("8, x, _, 4")).toEqual([8, null, null, 4])
  })

  it("round-trip зберігає структуру", () => {
    const levels = [1, 2, null, 3, null, 4]
    expect(parseLevelsText(levelsToText(levels))).toEqual(levels)
  })

  it("сміттєві токени стають null", () => {
    expect(parseLevelsText("abc, 5, ??")).toEqual([null, 5, null])
  })
})
