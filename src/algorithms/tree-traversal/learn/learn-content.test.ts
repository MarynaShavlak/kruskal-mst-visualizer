import { describe, it, expect } from "vitest"
import { isValidElement } from "react"
import {
  LEARN_CONTENT,
  parseToc,
} from "@/algorithms/tree-traversal/learn/learn-content"
import { figureForSrc } from "@/algorithms/tree-traversal/learn/figure-widgets"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"

describe("parseToc (обхід дерева)", () => {
  it("парсить 8 нумерованих секцій UA та EN (id secN у порядку)", () => {
    const ua = parseToc(LEARN_CONTENT.ua)
    const en = parseToc(LEARN_CONTENT.en)
    expect(ua.length).toBe(8)
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
    }
  })

  it("живі фігури присутні (UA docs/images/, EN docs/images/en/)", () => {
    const figures = [
      "tt_anatomy.png",
      "tt_preorder.png",
      "tt_inorder.png",
      "tt_bst.png",
      "tt_postorder.png",
      "tt_quiz.png",
    ]
    for (const fig of figures) {
      expect(LEARN_CONTENT.ua).toContain(`docs/images/${fig}`)
      expect(LEARN_CONTENT.en).toContain(`docs/images/en/${fig}`)
    }
  })

  it("три обходи згадано з еталонними послідовностями", () => {
    expect(LEARN_CONTENT.ua).toContain("1, 2, 4, 5, 3")
    expect(LEARN_CONTENT.ua).toContain("4, 2, 5, 1, 3")
    expect(LEARN_CONTENT.ua).toContain("4, 5, 2, 3, 1")
  })
})

describe("figureForSrc: мапінг фігур на живі віджети", () => {
  const isFallback = (node: unknown): boolean =>
    isValidElement(node) && node.type === FigureCard

  it("відомі стеми (вкл. EN-префікс) дають живі віджети", () => {
    const known = [
      "docs/images/tt_anatomy.png",
      "docs/images/tt_preorder.png",
      "docs/images/tt_inorder.png",
      "docs/images/en/tt_bst.png",
      "docs/images/en/tt_postorder.png",
      "docs/images/en/tt_quiz.png",
    ]
    for (const src of known) {
      expect(isFallback(figureForSrc(src, "alt"))).toBe(false)
    }
  })

  it("невідомий стем → запасна картка", () => {
    expect(isFallback(figureForSrc("docs/images/unknown_xyz.png", "alt"))).toBe(true)
  })
})
