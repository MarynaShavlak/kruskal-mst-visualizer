import { describe, it, expect } from "vitest"
import { LEARN_CONTENT, parseToc } from "@/features/learn/learn-content"

describe("parseToc", () => {
  it("парсить 18 нумерованих секцій (UA та EN)", () => {
    expect(parseToc(LEARN_CONTENT.ua)).toHaveLength(18)
    expect(parseToc(LEARN_CONTENT.en)).toHaveLength(18)
  })

  it("id секцій — sec1..sec18 у порядку", () => {
    const toc = parseToc(LEARN_CONTENT.ua)
    expect(toc[0].id).toBe("sec1")
    expect(toc[17].id).toBe("sec18")
    expect(toc[0].title).toMatch(/^1\. /)
  })
})
