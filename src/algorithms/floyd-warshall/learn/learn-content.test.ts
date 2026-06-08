import { describe, it, expect } from "vitest"
import {
  LEARN_CONTENT,
  parseToc,
} from "@/algorithms/floyd-warshall/learn/learn-content"

describe("parseToc (Флойд–Воршал)", () => {
  it("парсить 13 нумерованих секцій (UA та EN)", () => {
    expect(parseToc(LEARN_CONTENT.ua)).toHaveLength(13)
    expect(parseToc(LEARN_CONTENT.en)).toHaveLength(13)
  })

  it("id секцій — sec1..sec13 у порядку", () => {
    const toc = parseToc(LEARN_CONTENT.ua)
    expect(toc[0].id).toBe("sec1")
    expect(toc[12].id).toBe("sec13")
    expect(toc[0].title).toMatch(/^1\. /)
    expect(toc[3].title).toMatch(/^4\. Релаксація/)
  })

  it("контент не містить мертвих артефактів README", () => {
    for (const md of [LEARN_CONTENT.ua, LEARN_CONTENT.en]) {
      expect(md).not.toContain("img.shields.io")
      expect(md).not.toContain("user-attachments")
      expect(md).not.toContain("<a id=")
    }
  })
})
