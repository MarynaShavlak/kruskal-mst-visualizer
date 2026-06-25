import { describe, it, expect } from "vitest"
import {
  LEARN_CONTENT,
  parseToc,
} from "@/algorithms/heap-sort/learn/learn-content"
import { figureForSrc } from "@/algorithms/heap-sort/learn/figure-widgets"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import { isValidElement } from "react"

describe("parseToc (пірамідальне сортування)", () => {
  it("парсить нумеровані секції UA та EN (id secN у порядку)", () => {
    const ua = parseToc(LEARN_CONTENT.ua)
    const en = parseToc(LEARN_CONTENT.en)
    expect(ua.length).toBe(12)
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
      "heap_index_map.png",
      "heap_build.png",
      "heap_array_intro.png",
      "heap_walk.png",
      "order_compare.png",
      "non_adaptive.png",
      "growth.png",
      "max_heap_quiz.png",
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

  it("відомі стеми (вкл. EN-префікс, walkthrough, покрокові) дають живі віджети", () => {
    const known = [
      "docs/images/heap_array_intro.png",
      "docs/images/heap_index_map.png",
      "docs/images/heap_build.png",
      "docs/images/heap_walk.png",
      "docs/images/en/heap_walk_desc.png",
      "docs/images/order_compare.png",
      "docs/images/non_adaptive.png",
      "docs/images/growth.png",
      "docs/images/max_heap_quiz.png",
      "docs/images/step_05.png",
      "docs/images/en/step_20.png",
    ]
    for (const src of known) {
      expect(isFallback(figureForSrc(src, "alt"))).toBe(false)
    }
  })

  it("невідомий стем → запасна картка", () => {
    expect(isFallback(figureForSrc("docs/images/unknown_xyz.png", "alt"))).toBe(true)
  })
})
