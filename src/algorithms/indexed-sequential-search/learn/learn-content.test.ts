import { describe, it, expect } from "vitest"
import {
  LEARN_CONTENT,
  parseToc,
} from "@/algorithms/indexed-sequential-search/learn/learn-content"
import { figureForSrc } from "@/algorithms/indexed-sequential-search/learn/figure-widgets"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import { isValidElement } from "react"

describe("parseToc (індексно-послідовний пошук)", () => {
  it("парсить нумеровані секції UA та EN (id secN у порядку)", () => {
    const ua = parseToc(LEARN_CONTENT.ua)
    const en = parseToc(LEARN_CONTENT.en)
    expect(ua.length).toBe(16)
    expect(en.length).toBe(ua.length)
    expect(ua[0].id).toBe("sec1")
    expect(ua[ua.length - 1].id).toBe(`sec${ua.length}`)
    expect(ua[0].title).toMatch(/^1\. /)
  })

  it("контент не містить мертвих артефактів README", () => {
    for (const md of [LEARN_CONTENT.ua, LEARN_CONTENT.en]) {
      expect(md).not.toContain("img.shields.io")
      expect(md).not.toContain("<a id=")
      expect(md).not.toContain("<!--")
      expect(md).not.toContain("🇺🇦")
    }
  })

  it("ключові фігури README збережено (UA docs/images/, EN docs/images/en/)", () => {
    const keyFigures = [
      "two_level.png",
      "intuition.png",
      "step_main_1.png",
      "step_table.png",
      "evolution_main.png",
      "result_main.png",
      "complexity.png",
      "step_tradeoff.png",
      "code_steps_main.png",
    ]
    for (const fig of keyFigures) {
      expect(LEARN_CONTENT.ua).toContain(`docs/images/${fig}`)
      expect(LEARN_CONTENT.en).toContain(`docs/images/en/${fig}`)
    }
    // повне трасування: 15 кадрів walkthrough
    expect(LEARN_CONTENT.ua).toContain("docs/images/walkthrough/step_00.png")
    expect(LEARN_CONTENT.ua).toContain("docs/images/walkthrough/step_14.png")
  })
})

describe("figureForSrc: мапінг фігур на живі віджети", () => {
  const isFallback = (node: unknown): boolean =>
    isValidElement(node) && node.type === FigureCard

  it("відомі стеми (вкл. EN-префікс, walkthrough, step_main) дають живі віджети", () => {
    const known = [
      "docs/images/two_level.png",
      "docs/images/intuition.png",
      "docs/images/step_main_1.png",
      "docs/images/step_main_7.png",
      "docs/images/step_table.png",
      "docs/images/evolution_main.png",
      "docs/images/result_main.png",
      "docs/images/complexity.png",
      "docs/images/step_tradeoff.png",
      "docs/images/code_steps_main.png",
      "docs/images/en/code_walk_main.gif",
      "docs/images/en/search_main.gif",
      "docs/images/walkthrough/step_00.png",
      "docs/images/en/walkthrough/step_14.png",
    ]
    for (const src of known) {
      expect(isFallback(figureForSrc(src, "alt"))).toBe(false)
    }
  })

  it("невідомий стем → запасна картка", () => {
    expect(isFallback(figureForSrc("docs/images/unknown_xyz.png", "alt"))).toBe(true)
  })
})
