import { describe, it, expect } from "vitest"
import { isValidElement } from "react"
import { LEARN_CONTENT, parseToc } from "@/algorithms/kruskal/learn/learn-content"
import { figureForSrc } from "@/algorithms/kruskal/learn/figure-widgets"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"

describe("parseToc", () => {
  it("парсить 18 нумерованих секцій (UA та EN)", () => {
    expect(parseToc(LEARN_CONTENT.ua)).toHaveLength(18)
    expect(parseToc(LEARN_CONTENT.en)).toHaveLength(18)
  })

  it("id секцій — sec1..sec18 у порядку", () => {
    const toc = parseToc(LEARN_CONTENT.ua)
    expect(toc[0].id).toBe("sec1")
    expect(toc[17].id).toBe("sec18")
    expect(toc[0].title).toMatch(/^1\. /)
  })

  it("вкладає H3-підрозділи й тримає всі їхні id унікальними", () => {
    const toc = parseToc(LEARN_CONTENT.ua)
    // Принаймні якась секція має підрозділи (реальний README їх має десятки).
    expect(toc.some((s) => (s.children?.length ?? 0) > 0)).toBe(true)
    const childIds = toc.flatMap((s) => (s.children ?? []).map((c) => c.id))
    expect(childIds.length).toBeGreaterThan(0)
    expect(new Set(childIds).size).toBe(childIds.length)
  })
})

describe("stripReadmeChrome (GitHub-хром README)", () => {
  it("прибирає ручний «Зміст»/«Contents» — його заміняє бічний TOC", () => {
    expect(LEARN_CONTENT.ua).not.toMatch(/^##\s+Зміст\s*$/m)
    expect(LEARN_CONTENT.en).not.toMatch(/^##\s+Contents\s*$/m)
    // Вступний абзац після списку має лишитися.
    expect(LEARN_CONTENT.ua).toContain("Коротко про шлях")
  })

  it("прибирає блок-цитату з битим посиланням на PROJECT.md", () => {
    expect(LEARN_CONTENT.ua).not.toContain("PROJECT.md")
    expect(LEARN_CONTENT.en).not.toContain("PROJECT.md")
  })

  it("прибирає emoji 🌳 з H1 і рядок-бейдж перемикача мови", () => {
    for (const md of [LEARN_CONTENT.ua, LEARN_CONTENT.en]) {
      expect(md).not.toContain("🌳")
      expect(md).not.toContain("🇬🇧")
      expect(md).not.toContain("🇺🇦")
    }
    // Сам H1-заголовок лишається (без emoji).
    expect(LEARN_CONTENT.ua).toMatch(/^#\s+Алгоритм Краскала/m)
    expect(LEARN_CONTENT.en).toMatch(/^#\s+Kruskal/m)
  })
})

describe("примітка «сортування — відкладена чорна скринька» (крок 1)", () => {
  it("вставлена в обидві мови й не додає нової секції (TOC лишається 18)", () => {
    expect(LEARN_CONTENT.ua).toContain("«чорна скринька»")
    expect(LEARN_CONTENT.ua).toContain("родина «Сортування»")
    expect(LEARN_CONTENT.en).toContain('a "black box"')
    expect(LEARN_CONTENT.en).toContain("the Sorting family")
    expect(parseToc(LEARN_CONTENT.ua)).toHaveLength(18)
    expect(parseToc(LEARN_CONTENT.en)).toHaveLength(18)
  })

  it("стоїть у секції 3 — перед абзацом «Ключове спостереження»", () => {
    expect(LEARN_CONTENT.ua.indexOf("«чорна скринька»")).toBeLessThan(
      LEARN_CONTENT.ua.indexOf("Ключове спостереження"),
    )
    expect(LEARN_CONTENT.en.indexOf('a "black box"')).toBeLessThan(
      LEARN_CONTENT.en.indexOf("Key observation"),
    )
  })
})

describe("figureForSrc: мапінг фігур на живі віджети", () => {
  const isFallback = (node: unknown): boolean =>
    isValidElement(node) && node.type === FigureCard

  it("відомі стеми (вкл. EN-префікс) дають живі віджети, а не картку", () => {
    const known = [
      "docs/images/graph.png",
      "docs/images/spanning_tree_example.png",
      "docs/images/mst_result.png",
      "docs/images/components_example.png",
      "docs/images/chain_vs_flat.png",
      "docs/images/cut_property.png",
      "docs/images/exchange_argument.png",
      "docs/images/dsu_build.gif",
      "docs/images/dsu_step8.png",
      "docs/images/dsu_step8_build.gif",
      "docs/images/has_path_steps.png",
      "docs/images/dsu_steps.png",
      "docs/images/steps_grid.png",
      "docs/images/bc_cycle_step8.png",
      "docs/images/bfs_found.gif",
      "docs/images/bfs_notfound.gif",
      "docs/images/compare_step8.png",
      // EN-markdown веде на en/-префікс; мапінг — за іменем файлу (.split('/').pop()).
      "docs/images/en/graph.png",
      "docs/images/en/dsu_steps.png",
    ]
    for (const src of known) {
      expect(isFallback(figureForSrc(src, "alt"))).toBe(false)
    }
  })

  it("невідомий стем → запасна картка", () => {
    expect(isFallback(figureForSrc("docs/images/unknown_xyz.png", "alt"))).toBe(true)
  })

  it("стем benchmark → картка з кнопкою на вкладку бенчмарку", () => {
    const node = figureForSrc("docs/images/benchmark.png", "alt")
    expect(isValidElement(node)).toBe(true)
    const cta = isValidElement(node)
      ? (node.props as { cta?: { route?: string } }).cta
      : undefined
    expect(cta?.route).toBe("kruskal/benchmark")
  })
})
