import { describe, it, expect } from "vitest"
import { isValidElement } from "react"
import { LEARN_CONTENT, parseToc } from "@/algorithms/bst/learn/learn-content"
import { figureForSrc } from "@/algorithms/bst/learn/figure-widgets"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"

describe("parseToc (дерево пошуку)", () => {
  it("парсить 7 нумерованих секцій UA та EN (id secN у порядку)", () => {
    const ua = parseToc(LEARN_CONTENT.ua)
    const en = parseToc(LEARN_CONTENT.en)
    expect(ua.length).toBe(7)
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
      "bst_anatomy.png",
      "bst_walk.png",
      "bst_shape.png",
      "bst_inorder.png",
      "bst_quiz.png",
    ]
    for (const fig of figures) {
      expect(LEARN_CONTENT.ua).toContain(`docs/images/${fig}`)
      expect(LEARN_CONTENT.en).toContain(`docs/images/en/${fig}`)
    }
  })

  it("центровий обхід дерева-туру згадано як відсортовану послідовність", () => {
    expect(LEARN_CONTENT.ua).toContain("2, 3, 4, 5, 6, 7, 8")
    expect(LEARN_CONTENT.en).toContain("2, 3, 4, 5, 6, 7, 8")
  })
})

describe("figureForSrc: мапінг фігур на живі віджети", () => {
  const isFallback = (node: unknown): boolean =>
    isValidElement(node) && node.type === FigureCard

  it("відомі стеми (вкл. EN-префікс) дають живі віджети", () => {
    const known = [
      "docs/images/bst_anatomy.png",
      "docs/images/bst_walk.png",
      "docs/images/en/bst_shape.png",
      "docs/images/en/bst_inorder.png",
      "docs/images/en/bst_quiz.png",
    ]
    for (const src of known) {
      expect(isFallback(figureForSrc(src, "alt"))).toBe(false)
    }
  })

  it("невідомий стем → запасна картка", () => {
    expect(isFallback(figureForSrc("docs/images/unknown_xyz.png", "alt"))).toBe(true)
  })
})
