import { describe, it, expect } from "vitest"
import {
  LEARN_CONTENT,
  parseToc,
} from "@/algorithms/boyer-moore-string-search/learn/learn-content"
import { figureForSrc } from "@/algorithms/boyer-moore-string-search/learn/figure-widgets"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import { isValidElement } from "react"

describe("parseToc (Боєра-Мура)", () => {
  it("парсить нумеровані секції UA та EN з однаковою кількістю (id secN)", () => {
    const ua = parseToc(LEARN_CONTENT.ua)
    const en = parseToc(LEARN_CONTENT.en)
    expect(ua.length).toBe(13)
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
      "shift_table_developer.png",
      "intuition.png",
      "search_konspekt.gif",
      "complexity.png",
      "vs_others.png",
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

  it("відомі стеми (вкл. EN-префікс та walkthrough обох фаз) дають живі віджети", () => {
    const known = [
      "docs/images/shift_table_developer.png",
      "docs/images/shift_table_ABC.png",
      "docs/images/shift_table_CAAAA.png",
      "docs/images/table_build.gif",
      "docs/images/build_developer_04.png",
      "docs/images/build_developer_08.png",
      "docs/images/build_developer_09.png",
      "docs/images/intuition.png",
      "docs/images/intro_skipped.png",
      "docs/images/skipped_big_jumps.png",
      "docs/images/search_konspekt.gif",
      "docs/images/search_konspekt_start.png",
      "docs/images/search_konspekt_jump.png",
      "docs/images/search_konspekt_match.png",
      "docs/images/search_big_jumps.gif",
      "docs/images/code_table_grid.png",
      "docs/images/code_search_grid.png",
      "docs/images/complexity.png",
      "docs/images/vs_others.png",
      "docs/images/walkthrough/table_04.png",
      "docs/images/walkthrough/search_02.png",
      "docs/images/en/walkthrough/search_12.png",
      "docs/images/en/walkthrough/table_00.png",
    ]
    for (const src of known) {
      expect(isFallback(figureForSrc(src, "alt"))).toBe(false)
    }
  })

  it("невідомий стем → запасна картка", () => {
    expect(isFallback(figureForSrc("docs/images/unknown_xyz.png", "alt"))).toBe(true)
  })
})
