import { describe, it, expect } from "vitest"
import {
  LEARN_CONTENT,
  parseToc,
} from "@/algorithms/interpolation-search/learn/learn-content"
import { figureForSrc } from "@/algorithms/interpolation-search/learn/figure-widgets"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import { isValidElement } from "react"

describe("parseToc (інтерполяційний пошук)", () => {
  it("парсить нумеровані секції UA та EN (id secN у порядку)", () => {
    const ua = parseToc(LEARN_CONTENT.ua)
    const en = parseToc(LEARN_CONTENT.en)
    expect(ua.length).toBe(19)
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
      "intuition_dictionary.png",
      "array_demo1.png",
      "line_demo1.png",
      "evolution_demo2.png",
      "complexity.png",
      "degradation.png",
      "vs_binary_uniform.png",
      "vs_binary_clustered.png",
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

  it("відомі стеми (вкл. EN-префікс та walkthrough) дають живі віджети", () => {
    const known = [
      "docs/images/intuition_dictionary.png",
      "docs/images/array_demo1.png",
      "docs/images/line_demo1.png",
      "docs/images/evolution_demo2.png",
      "docs/images/complexity.png",
      "docs/images/degradation.png",
      "docs/images/vs_binary_uniform.png",
      "docs/images/en/vs_binary_clustered.png",
      "docs/images/en/search_demo1.gif",
      "docs/images/en/search_absent.gif",
      "docs/images/code_steps_demo2.png",
      "docs/images/en/code_walk_demo2.gif",
      "docs/images/walkthrough/step_01.png",
      "docs/images/en/walkthrough/step_05.png",
    ]
    for (const src of known) {
      expect(isFallback(figureForSrc(src, "alt"))).toBe(false)
    }
  })

  it("невідомий стем → запасна картка", () => {
    expect(isFallback(figureForSrc("docs/images/unknown_xyz.png", "alt"))).toBe(true)
  })
})
