import { describe, it, expect } from "vitest"
import {
  LEARN_CONTENT,
  parseToc,
} from "@/algorithms/floyd-warshall/learn/learn-content"

describe("parseToc (Флойд–Воршал)", () => {
  it("парсить 12 нумерованих секцій (UA та EN)", () => {
    expect(parseToc(LEARN_CONTENT.ua)).toHaveLength(12)
    expect(parseToc(LEARN_CONTENT.en)).toHaveLength(12)
  })

  it("id секцій — sec1..sec12 у порядку", () => {
    const toc = parseToc(LEARN_CONTENT.ua)
    expect(toc[0].id).toBe("sec1")
    expect(toc[11].id).toBe("sec12")
    expect(toc[0].title).toMatch(/^1\. /)
  })

  it("контент не містить мертвих артефактів README", () => {
    for (const md of [LEARN_CONTENT.ua, LEARN_CONTENT.en]) {
      expect(md).not.toContain("img.shields.io")
      expect(md).not.toContain("user-attachments")
      expect(md).not.toContain("<a id=")
    }
  })
})
