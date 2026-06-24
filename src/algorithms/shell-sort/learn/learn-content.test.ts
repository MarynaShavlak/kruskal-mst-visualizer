import { describe, it, expect } from "vitest"
import {
  LEARN_CONTENT,
  parseToc,
} from "@/algorithms/shell-sort/learn/learn-content"
import { figureForSrc } from "@/algorithms/shell-sort/learn/figure-widgets"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import { isValidElement } from "react"

describe("parseToc (сортування Шелла)", () => {
  it("парсить нумеровані секції UA та EN (id secN у порядку)", () => {
    const ua = parseToc(LEARN_CONTENT.ua)
    const en = parseToc(LEARN_CONTENT.en)
    expect(ua.length).toBe(13)
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
      "array_intro.png",
      "gap_groups_intro.png",
      "evolution_intro.png",
      "result_intro.png",
      "gap_comparison.png",
      "growth.png",
    ]
    for (const fig of keyFigures) {
      expect(LEARN_CONTENT.ua).toContain(`docs/images/${fig}`)
      expect(LEARN_CONTENT.en).toContain(`docs/images/en/${fig}`)
    }
  })
})

describe("figureForSrc: мапінг фігур на живі віджети", () => {
  const isFallback = (node: unknown): boolean =>
    isValidElement(node) && node.type === FigureCard

  it("відомі стеми (вкл. EN-префікс, walkthrough, малі прев'ю) дають живі віджети", () => {
    const known = [
      "docs/images/array_intro.png",
      "docs/images/shell_idea.png",
      "docs/images/gap_groups_intro.png",
      "docs/images/gap_groups_g2.png",
      "docs/images/gap_groups_g1.png",
      "docs/images/gap_groups_dup.png",
      "docs/images/evolution_intro.png",
      "docs/images/en/sort_intro.gif",
      "docs/images/result_intro.png",
      "docs/images/gap_comparison.png",
      "docs/images/growth.png",
      "docs/images/result_duplicates.png",
      "docs/images/en/code_walk_conspect.gif",
      "docs/images/code_steps_conspect.png",
      "docs/images/step_intro_02.png",
      "docs/images/walkthrough/step_00.png",
      "docs/images/en/walkthrough/step_75.png",
    ]
    for (const src of known) {
      expect(isFallback(figureForSrc(src, "alt"))).toBe(false)
    }
  })

  it("невідомий стем → запасна картка", () => {
    expect(isFallback(figureForSrc("docs/images/unknown_xyz.png", "alt"))).toBe(true)
  })
})
