import { describe, it, expect } from "vitest"
import {
  LEARN_CONTENT,
  parseToc,
} from "@/algorithms/rabin-karp-string-search/learn/learn-content"
import { figureForSrc } from "@/algorithms/rabin-karp-string-search/learn/figure-widgets"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import { isValidElement } from "react"

describe("parseToc (пошук Рабіна-Карпа)", () => {
  it("парсить нумеровані секції UA та EN з однаковою кількістю (id secN)", () => {
    const ua = parseToc(LEARN_CONTENT.ua)
    const en = parseToc(LEARN_CONTENT.en)
    expect(ua.length).toBe(14)
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
      expect(md).not.toContain(".mp4)")
    }
  })

  it("ключові фігури README збережено (UA docs/images/, EN docs/images/en/)", () => {
    const keyFigures = [
      "intuition_hash.png",
      "hash_developer.png",
      "rolling_update.png",
      "collision_for_jar.png",
      "complexity.png",
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

  it("відомі стеми (вкл. EN-префікс та walkthrough hash_/search_) дають живі віджети", () => {
    const known = [
      "docs/images/intuition_hash.png",
      "docs/images/intuition_window.png",
      "docs/images/hash_abc.png",
      "docs/images/hash_developer.png",
      "docs/images/hash_build.gif",
      "docs/images/rolling_update.png",
      "docs/images/rolling_vs_recompute.png",
      "docs/images/complexity.png",
      "docs/images/compare_four.png",
      "docs/images/collision_for_jar.png",
      "docs/images/search_collision.gif",
      "docs/images/search_konspekt.png",
      "docs/images/code_hash_grid.png",
      "docs/images/code_search_grid.png",
      "docs/images/walkthrough/hash_00.png",
      "docs/images/walkthrough/hash_10.png",
      "docs/images/en/walkthrough/search_06.png",
      "docs/images/en/walkthrough/search_09.png",
    ]
    for (const src of known) {
      expect(isFallback(figureForSrc(src, "alt"))).toBe(false)
    }
  })

  it("невідомий стем → запасна картка", () => {
    expect(isFallback(figureForSrc("docs/images/unknown_xyz.png", "alt"))).toBe(true)
  })
})
