import { describe, it, expect } from "vitest"
import {
  LEARN_CONTENT,
  parseToc,
} from "@/algorithms/held-karp/learn/learn-content"

describe("parseToc (Хелда–Карпа)", () => {
  it("парсить нумеровані секції UA та EN (id secN у порядку)", () => {
    const ua = parseToc(LEARN_CONTENT.ua)
    const en = parseToc(LEARN_CONTENT.en)
    // Кількість секцій тримається синхронно з README; нижня межа захищає від
    // регресій трансформера (порожній/обрізаний контент).
    expect(ua.length).toBeGreaterThanOrEqual(20)
    expect(en.length).toBeGreaterThanOrEqual(20)
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

  it("усі 11 фігур README збережено (UA images/, EN images/en/)", () => {
    // figureForSrc мапить за іменем файлу (.split('/').pop()), тож префікс en/
    // не заважає — але обидві мови мають містити всі 11 фігур.
    for (const md of [LEARN_CONTENT.ua, LEARN_CONTENT.en]) {
      const figs = md.match(/!\[[^\]]*\]\(images\/(?:en\/)?\d{2}_[^)]+\.png\)/g) ?? []
      expect(figs).toHaveLength(11)
    }
  })
})
