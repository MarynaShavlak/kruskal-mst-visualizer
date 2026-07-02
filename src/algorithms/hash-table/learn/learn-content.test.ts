import { describe, it, expect } from "vitest"
import { isValidElement } from "react"
import {
  LEARN_CONTENT,
  parseToc,
} from "@/algorithms/hash-table/learn/learn-content"
import { figureForSrc } from "@/algorithms/hash-table/learn/figure-widgets"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"

describe("parseToc (хеш-таблиця)", () => {
  it("парсить 9 нумерованих секцій UA та EN (id secN у порядку)", () => {
    const ua = parseToc(LEARN_CONTENT.ua)
    const en = parseToc(LEARN_CONTENT.en)
    expect(ua.length).toBe(9)
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
    const figures = ["ht_pipeline.png", "ht_walk.png", "ht_compare.png", "ht_slot_quiz.png", "ht_quiz.png"]
    for (const fig of figures) {
      expect(LEARN_CONTENT.ua).toContain(`docs/images/${fig}`)
      expect(LEARN_CONTENT.en).toContain(`docs/images/en/${fig}`)
    }
  })
})

describe("figureForSrc: мапінг фігур на живі віджети", () => {
  const isFallback = (node: unknown): boolean =>
    isValidElement(node) && node.type === FigureCard

  it("відомі стеми (вкл. EN-префікс) дають живі віджети", () => {
    const known = [
      "docs/images/ht_pipeline.png",
      "docs/images/ht_walk.png",
      "docs/images/ht_compare.png",
      "docs/images/en/ht_slot_quiz.png",
      "docs/images/en/ht_quiz.png",
    ]
    for (const src of known) {
      expect(isFallback(figureForSrc(src, "alt"))).toBe(false)
    }
  })

  it("невідомий стем → запасна картка", () => {
    expect(isFallback(figureForSrc("docs/images/unknown_xyz.png", "alt"))).toBe(true)
  })
})
