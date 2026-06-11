import { describe, it, expect } from "vitest"
import { LEARN_CONTENT, parseToc } from "@/algorithms/kruskal/learn/learn-content"

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

  it("вкладає H3-підрозділи й тримає всі їхні id унікальними", () => {
    const toc = parseToc(LEARN_CONTENT.ua)
    // Принаймні якась секція має підрозділи (реальний README їх має десятки).
    expect(toc.some((s) => (s.children?.length ?? 0) > 0)).toBe(true)
    const childIds = toc.flatMap((s) => (s.children ?? []).map((c) => c.id))
    expect(childIds.length).toBeGreaterThan(0)
    expect(new Set(childIds).size).toBe(childIds.length)
  })
})

describe("stripReadmeChrome (GitHub-хром README)", () => {
  it("прибирає ручний «Зміст»/«Contents» — його заміняє бічний TOC", () => {
    expect(LEARN_CONTENT.ua).not.toMatch(/^##\s+Зміст\s*$/m)
    expect(LEARN_CONTENT.en).not.toMatch(/^##\s+Contents\s*$/m)
    // Вступний абзац після списку має лишитися.
    expect(LEARN_CONTENT.ua).toContain("Коротко про шлях")
  })

  it("прибирає блок-цитату з битим посиланням на PROJECT.md", () => {
    expect(LEARN_CONTENT.ua).not.toContain("PROJECT.md")
    expect(LEARN_CONTENT.en).not.toContain("PROJECT.md")
  })

  it("прибирає emoji 🌳 з H1 і рядок-бейдж перемикача мови", () => {
    for (const md of [LEARN_CONTENT.ua, LEARN_CONTENT.en]) {
      expect(md).not.toContain("🌳")
      expect(md).not.toContain("🇬🇧")
      expect(md).not.toContain("🇺🇦")
    }
    // Сам H1-заголовок лишається (без emoji).
    expect(LEARN_CONTENT.ua).toMatch(/^#\s+Алгоритм Краскала/m)
    expect(LEARN_CONTENT.en).toMatch(/^#\s+Kruskal/m)
  })
})
