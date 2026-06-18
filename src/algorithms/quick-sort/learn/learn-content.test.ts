import { describe, it, expect } from "vitest"
import {
  LEARN_CONTENT,
  parseToc,
} from "@/algorithms/quick-sort/learn/learn-content"
import { figureForSrc } from "@/algorithms/quick-sort/learn/figure-widgets"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import { isValidElement } from "react"

describe("parseToc (швидке сортування)", () => {
  it("парсить нумеровані секції UA та EN (id secN у порядку)", () => {
    const ua = parseToc(LEARN_CONTENT.ua)
    const en = parseToc(LEARN_CONTENT.en)
    expect(ua.length).toBe(18)
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
      "array_intro.png",
      "tree_intro.png",
      "partition_intro.png",
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
      "docs/images/array_intro.png",
      "docs/images/tree_intro.png",
      "docs/images/en/tree_grow_intro.gif",
      "docs/images/partition_intro.png",
      "docs/images/levels_intro.png",
      "docs/images/growth.png",
      "docs/images/tree_balanced.png",
      "docs/images/tree_degenerate.png",
      "docs/images/stability_duplicates.png",
      "docs/images/walkthrough/step_00.png",
      "docs/images/en/walkthrough/step_04.png",
      "docs/images/code_steps_conspect.png",
    ]
    for (const src of known) {
      expect(isFallback(figureForSrc(src, "alt"))).toBe(false)
    }
  })

  it("невідомий стем → запасна картка", () => {
    expect(isFallback(figureForSrc("docs/images/unknown_xyz.png", "alt"))).toBe(true)
  })
})
