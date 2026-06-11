import { describe, it, expect } from "vitest"
import { parseHighlightLines } from "@/algorithms/shared/learn/use-shiki-html"

describe("parseHighlightLines", () => {
  it("розбирає кілька діапазонів і поодинокі рядки", () => {
    expect([...parseHighlightLines("13-15,22-24")]).toEqual([
      13, 14, 15, 22, 23, 24,
    ])
    expect([...parseHighlightLines("8")]).toEqual([8])
  })

  it("толерантний до пробілів і зворотного порядку діапазону", () => {
    expect([...parseHighlightLines(" 3 - 5 , 8 ")]).toEqual([3, 4, 5, 8])
    expect([...parseHighlightLines("5-3")]).toEqual([3, 4, 5])
  })

  it("порожньо для undefined/порожнього/сміття", () => {
    expect(parseHighlightLines(undefined).size).toBe(0)
    expect(parseHighlightLines("").size).toBe(0)
    expect(parseHighlightLines("abc, {}").size).toBe(0)
  })
})
