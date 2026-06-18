import { describe, it, expect } from "vitest"
import {
  LEARN_CONTENT,
  parseToc,
} from "@/algorithms/radix-sort/learn/learn-content"
import { figureForSrc } from "@/algorithms/radix-sort/learn/figure-widgets"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import { isValidElement } from "react"

describe("parseToc (порозрядне сортування)", () => {
  it("парсить нумеровані секції UA та EN (id secN у порядку)", () => {
    const ua = parseToc(LEARN_CONTENT.ua)
    const en = parseToc(LEARN_CONTENT.en)
    expect(ua.length).toBe(18)
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
      "radix_idea.png",
      "array_conspect.png",
      "buckets_units.png",
      "evolution_conspect.png",
      "result_conspect.png",
      "counting_units.png",
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

  it("відомі стеми (вкл. EN-префікс, walkthrough) дають живі віджети", () => {
    const known = [
      "docs/images/radix_idea.png",
      "docs/images/array_conspect.png",
      "docs/images/buckets_units.png",
      "docs/images/buckets_tens.png",
      "docs/images/buckets_hundreds.png",
      "docs/images/evolution_conspect.png",
      "docs/images/en/sort_buckets.gif",
      "docs/images/result_conspect.png",
      "docs/images/counting_units.png",
      "docs/images/count_steps_units.png",
      "docs/images/array_duplicates.png",
      "docs/images/evolution_duplicates.png",
      "docs/images/result_duplicates.png",
      "docs/images/growth.png",
      "docs/images/en/code_walk_conspect.gif",
      "docs/images/code_steps_conspect.png",
      "docs/images/walkthrough/step_00.png",
      "docs/images/en/walkthrough/step_34.png",
    ]
    for (const src of known) {
      expect(isFallback(figureForSrc(src, "alt"))).toBe(false)
    }
  })

  it("невідомий стем → запасна картка", () => {
    expect(isFallback(figureForSrc("docs/images/unknown_xyz.png", "alt"))).toBe(true)
  })
})
