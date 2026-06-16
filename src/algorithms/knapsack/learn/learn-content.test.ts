import { describe, it, expect } from "vitest"
import {
  LEARN_CONTENT,
  parseToc,
} from "@/algorithms/knapsack/learn/learn-content"

describe("parseToc (рюкзак)", () => {
  it("парсить нумеровані секції UA та EN (id secN у порядку)", () => {
    const ua = parseToc(LEARN_CONTENT.ua)
    const en = parseToc(LEARN_CONTENT.en)
    expect(ua.length).toBeGreaterThanOrEqual(20)
    expect(en.length).toBe(ua.length) // UA/EN структурно синхронні
    expect(ua[0].id).toBe("sec1")
    expect(ua[ua.length - 1].id).toBe(`sec${ua.length}`)
    expect(ua[0].title).toMatch(/^1\. /)
  })

  it("контент не містить мертвих артефактів README", () => {
    for (const md of [LEARN_CONTENT.ua, LEARN_CONTENT.en]) {
      expect(md).not.toContain("img.shields.io")
      expect(md).not.toContain("<a id=")
      expect(md).not.toContain("<details>")
      expect(md).not.toContain("<summary>")
      expect(md).not.toContain("<Figure size")
    }
  })

  it("ключові фігури README збережено (UA docs/images/, EN docs/images/en/)", () => {
    const keyFigures = [
      "items_classic.png",
      "items_small.png",
      "subsets_classic.png",
      "dp_table_small.png",
      "dp_table_classic.png",
      "backtrack_small.png",
      "greedy_fill_classic.png",
      "growth_2n.png",
    ]
    for (const fig of keyFigures) {
      expect(LEARN_CONTENT.ua).toContain(`docs/images/${fig}`)
      expect(LEARN_CONTENT.en).toContain(`docs/images/en/${fig}`)
    }
  })
})
