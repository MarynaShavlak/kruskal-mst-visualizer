import { describe, it, expect } from "vitest"
import {
  LEARN_CONTENT,
  parseToc,
} from "@/algorithms/kmp-string-search/learn/learn-content"
import { figureForSrc } from "@/algorithms/kmp-string-search/learn/figure-widgets"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import { isValidElement } from "react"

describe("parseToc (KMP)", () => {
  it("парсить нумеровані секції UA та EN з однаковою кількістю (id secN)", () => {
    const ua = parseToc(LEARN_CONTENT.ua)
    const en = parseToc(LEARN_CONTENT.en)
    expect(ua.length).toBe(10)
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
      "intuition.png",
      "lps_table_ABAB.png",
      "lps_build.gif",
      "search_konspekt.gif",
      "i_monotonic.png",
      "vs_naive_worst.png",
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

  it("відомі стеми (вкл. EN-префікс, walkthrough lps/search) дають живі віджети", () => {
    const known = [
      "docs/images/intuition.png",
      "docs/images/lps_table_ABAB.png",
      "docs/images/lps_table_ABABCABAB.png",
      "docs/images/lps_table_AAAAB.png",
      "docs/images/lps_build_AABAA_01.png",
      "docs/images/lps_build.gif",
      "docs/images/search_konspekt.gif",
      "docs/images/search_konspekt_match.png",
      "docs/images/i_monotonic.png",
      "docs/images/vs_naive_worst.png",
      "docs/images/complexity.png",
      "docs/images/code_lps_grid.png",
      "docs/images/code_search_grid.png",
      "docs/images/walkthrough/lps_01.png",
      "docs/images/walkthrough/search_05.png",
      "docs/images/en/walkthrough/search_08.png",
      "docs/images/en/i_monotonic.png",
    ]
    for (const src of known) {
      expect(isFallback(figureForSrc(src, "alt"))).toBe(false)
    }
  })

  it("невідомий стем → запасна картка", () => {
    expect(isFallback(figureForSrc("docs/images/unknown_xyz.png", "alt"))).toBe(true)
  })
})
