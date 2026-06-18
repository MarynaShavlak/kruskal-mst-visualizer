import { describe, it, expect } from "vitest"
import {
  LEARN_CONTENT,
  parseToc,
} from "@/algorithms/binary-search/learn/learn-content"
import { figureForSrc } from "@/algorithms/binary-search/learn/figure-widgets"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import { isValidElement } from "react"

describe("parseToc (двійковий пошук)", () => {
  it("парсить нумеровані секції UA та EN (id secN у порядку)", () => {
    const ua = parseToc(LEARN_CONTENT.ua)
    const en = parseToc(LEARN_CONTENT.en)
    expect(ua.length).toBe(20)
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
      "intuition_guess.png",
      "intuition_window.png",
      "array_intro.png",
      "evolution_intro.png",
      "result_intro.png",
      "log_explainer.png",
      "linear_vs_binary.png",
      "cases.png",
      "variants_duplicates.png",
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

  it("відомі стеми (вкл. EN-префікс, walkthrough, step_intro) дають живі віджети", () => {
    const known = [
      "docs/images/intuition_guess.png",
      "docs/images/intuition_window.png",
      "docs/images/array_intro.png",
      "docs/images/step_intro_0.png",
      "docs/images/step_intro_1.png",
      "docs/images/step_intro_2.png",
      "docs/images/evolution_intro.png",
      "docs/images/result_intro.png",
      "docs/images/en/search_intro.gif",
      "docs/images/en/search_best.gif",
      "docs/images/en/search_absent.gif",
      "docs/images/log_explainer.png",
      "docs/images/linear_vs_binary.png",
      "docs/images/cases.png",
      "docs/images/variants_duplicates.png",
      "docs/images/code_steps_intro.png",
      "docs/images/en/code_walk_intro.gif",
      "docs/images/walkthrough/step_00.png",
      "docs/images/en/walkthrough/step_07.png",
    ]
    for (const src of known) {
      expect(isFallback(figureForSrc(src, "alt"))).toBe(false)
    }
  })

  it("невідомий стем → запасна картка", () => {
    expect(isFallback(figureForSrc("docs/images/unknown_xyz.png", "alt"))).toBe(true)
  })
})
