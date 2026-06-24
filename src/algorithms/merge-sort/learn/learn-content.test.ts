import { describe, it, expect } from "vitest"
import {
  LEARN_CONTENT,
  parseToc,
} from "@/algorithms/merge-sort/learn/learn-content"
import { figureForSrc } from "@/algorithms/merge-sort/learn/figure-widgets"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import { isValidElement } from "react"

describe("parseToc (сортування злиттям)", () => {
  it("парсить нумеровані секції UA та EN (id secN у порядку)", () => {
    const ua = parseToc(LEARN_CONTENT.ua)
    const en = parseToc(LEARN_CONTENT.en)
    expect(ua.length).toBe(14)
    expect(en.length).toBe(ua.length) // UA/EN структурно синхронні
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
      "idea_intro.png",
      "tree_intro.png",
      "levels_intro.png",
      "result_intro.png",
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

  it("відомі стеми (вкл. EN-префікс і walkthrough) дають живі віджети, не запасну картку", () => {
    const known = [
      "docs/images/idea_intro.png",
      "docs/images/idea_merge_steps.png",
      "docs/images/en/recursion_intro.gif",
      "docs/images/tree_intro.png",
      "docs/images/levels_intro.png",
      "docs/images/merge_root_intro.png",
      "docs/images/merge_step.gif",
      "docs/images/merge_step_grid.png",
      "docs/images/result_intro.png",
      "docs/images/growth.png",
      "docs/images/merge_duplicates.png",
      "docs/images/result_duplicates.png",
      "docs/images/en/code_walk_conspect.gif",
      "docs/images/code_steps_conspect.png",
      "docs/images/walkthrough/step_00.png",
      "docs/images/en/walkthrough/step_23.png",
    ]
    for (const src of known) {
      expect(isFallback(figureForSrc(src, "alt"))).toBe(false)
    }
  })

  it("невідомий стем → запасна картка", () => {
    expect(isFallback(figureForSrc("docs/images/unknown_xyz.png", "alt"))).toBe(true)
  })
})
