import { describe, it, expect } from "vitest"
import {
  LEARN_CONTENT,
  parseToc,
} from "@/algorithms/prim/learn/learn-content"

describe("parseToc (Прима)", () => {
  it("парсить нумеровані секції UA та EN (id secN у порядку)", () => {
    const ua = parseToc(LEARN_CONTENT.ua)
    const en = parseToc(LEARN_CONTENT.en)
    // Кількість секцій тримається синхронно з README; нижня межа захищає від
    // регресій трансформера (порожній/обрізаний контент).
    expect(ua.length).toBeGreaterThanOrEqual(12)
    expect(en.length).toBe(ua.length)
    expect(ua[0].id).toBe("sec1")
    expect(ua[ua.length - 1].id).toBe(`sec${ua.length}`)
    expect(ua[0].title).toMatch(/^1\. /)
  })

  it("контент не містить мертвих артефактів README", () => {
    for (const md of [LEARN_CONTENT.ua, LEARN_CONTENT.en]) {
      expect(md).not.toContain("img.shields.io")
      expect(md).not.toContain("<a id=")
      expect(md).not.toContain("🇺🇦")
      expect(md).not.toContain("🇬🇧")
      expect(md).not.toMatch(/\]\([^)]*\.(gif|mp4)\)/)
    }
  })

  it("усі 23 PNG-фігури README збережено (UA docs/images/, EN docs/images/en/)", () => {
    for (const md of [LEARN_CONTENT.ua, LEARN_CONTENT.en]) {
      const figs = md.match(/!\[[^\]]*\]\(docs\/images\/(?:en\/)?[^)]+\.png\)/g) ?? []
      expect(figs).toHaveLength(23)
    }
  })
})
