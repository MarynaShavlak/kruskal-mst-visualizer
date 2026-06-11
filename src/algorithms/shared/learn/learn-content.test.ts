import { describe, it, expect } from "vitest"
import { parseToc } from "@/algorithms/shared/learn/learn-content"

describe("parseToc — вкладений зміст (H2 + H3)", () => {
  it("вкладає H3 у попередню секцію H2", () => {
    const md = [
      "## 1. Перша",
      "### Підрозділ A",
      "### Підрозділ B",
      "## 2. Друга",
      "### Підрозділ C",
    ].join("\n")

    const toc = parseToc(md)
    expect(toc).toHaveLength(2)
    expect(toc[0].id).toBe("sec1")
    expect(toc[0].children?.map((c) => c.title)).toEqual([
      "Підрозділ A",
      "Підрозділ B",
    ])
    expect(toc[1].children?.map((c) => c.title)).toEqual(["Підрозділ C"])
  })

  it("дає slug-id для H3 (Unicode/кирилиця) і номери рядків", () => {
    const md = ["## 1. Розділ", "", "### Що таке `dsu`"].join("\n")
    const [section] = parseToc(md)
    const child = section.children![0]
    expect(child.id).toBe("що-таке-dsu") // backticks прибрано, slug кирилицею
    expect(child.title).toBe("Що таке dsu") // inline-код у підписі без backticks
    expect(section.line).toBe(1)
    expect(child.line).toBe(3)
  })

  it("дедуплікує однакові slug-id H3", () => {
    const md = ["## 1. A", "### Підсумок", "## 2. B", "### Підсумок"].join("\n")
    const toc = parseToc(md)
    expect(toc[0].children![0].id).toBe("підсумок")
    expect(toc[1].children![0].id).toBe("підсумок-2")
  })

  it("ігнорує заголовки всередині блоків коду", () => {
    const md = [
      "## 1. Розділ",
      "```python",
      "## не заголовок",
      "### теж ні",
      "```",
      "### справжній підрозділ",
    ].join("\n")
    const toc = parseToc(md)
    expect(toc).toHaveLength(1)
    expect(toc[0].children?.map((c) => c.title)).toEqual(["справжній підрозділ"])
  })

  it("не виносить H3 до першого H2 у верхній рівень (контракт sec1..secN)", () => {
    const md = ["### Сирота", "## 1. Розділ"].join("\n")
    const toc = parseToc(md)
    expect(toc).toHaveLength(1)
    expect(toc[0].id).toBe("sec1")
  })
})
